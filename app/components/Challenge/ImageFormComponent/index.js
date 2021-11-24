/**
 *
 * ImageForm
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Modal } from 'antd';
import { Colors } from 'theme/colors';
import Resizer from 'react-image-file-resizer';
import { Images } from 'images/index';
import axiosInstance, { createFormData } from 'services';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import {
  EditorState,
  convertFromHTML,
  ContentState,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const PopupModel = styled(Modal)`
  background-color: ${Colors.background};
  border-radius: 8px;
  padding: 20px 0px 5px;
  color: ${Colors.white};
  overflow: hidden;
  width: auto !important;
  margin: 20px 0px;

  > div {
    background-color: ${Colors.background};
  }

  > .ant-modal-content {
    box-shadow: none;
    padding: 0px 40px;
    width: 635px;

    > button {
      color: ${Colors.white};
      top: -25px;
      right: 0px;
    }
  }

  .ant-modal-body {
    padding: 24px 0px;
  }
`;

const ImageUploadSection = styled(Row)`
  position: relative;

  > img {
    height: 292px;
    width: 434px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid white;
  }
`;

const UpdateIcon = styled.div`
  background-color: ${Colors.primary};
  height: 56px;
  width: 56px;
  border-radius: 50px;
  position: absolute;
  bottom: 15px;
  right: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 25px;
    width: 25px;
  }
`;

const UploadPicSection = styled(Row)`
  background-color: ${Colors.shadow};
  height: 200px;
  width: 434px;
  border-radius: 8px;
  border: 2px solid ${Colors.white};
  flex-direction: column;
`;

const UploadIcon = styled.div`
  background-color: ${Colors.primary};
  height: 56px;
  width: 56px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 32px;
    width: 32px;
  }
`;

const TextAreaInputSection = styled(Row)`
  border-radius: 8px;
  width: 100%;
  height: auto !important;
  color: ${Colors.bodyText};
  box-shadow: inset 0px 1px 2px 0px #00000035;
  background-color: ${Colors.shadow};
  border: 2px solid ${Colors.white};
  padding: 10px 15px;
  margin-bottom: 20px;

  .toolbarClassName {
    padding-bottom: 12px;
    border: none;
    border-bottom: 1px solid ${Colors.white};
  }

  .editorClassName {
    color: ${Colors.white};
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${Colors.white};
    }
    pre {
      color: ${Colors.black};
    }
  }
`;

function ImageFormComponent({
  selectedImage,
  visibility,
  dismissModal,
  action,
  trailId,
}) {
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [tempFile, setTempFile] = useState(null);
  const [tempPic, setTempPic] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    if (visibility) {
      if (selectedImage) {
        setDesc(selectedImage.description);
        setImage(selectedImage.image_filename);

        setEditorState(() => {
          if (selectedImage.description) {
            const blocksFromHTML = convertFromHTML(selectedImage.description);
            const state = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap,
            );
            return EditorState.createWithContent(state);
          } else {
            return EditorState.createEmpty();
          }
        });
      }
    } else {
      setDesc('');
      setImage('');
      setTempFile(null);
      setTempPic(null);
      setEditorState(EditorState.createEmpty());
    }
  }, [selectedImage, visibility]);

  const imageUpload = async e => {
    const file = e.target.files[0];
    const newFile = await resizeFile(file);
    setTempFile(newFile);
    setTempPic(URL.createObjectURL(newFile));
  };

  // resize image
  const resizeFile = file =>
    new Promise(resolve => {
      Resizer.imageFileResizer(
        file,
        612,
        428,
        'png',
        100,
        0,
        fileObj => {
          resolve(fileObj);
        },
        'file',
      );
    });

  const submit = () => {
    if (!isLoading) {
      setIsLoading(true);

      const params =
        action === 'create'
          ? {
              trail_id: trailId,
              description: desc,
              image_filename: tempFile || null,
            }
          : {
              image_id: selectedImage.image_id,
              description: desc,
              image_filename: tempFile || null,
            };

      axiosInstance
        .post('api/trail-image', createFormData(params), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          setIsLoading(false);
          dismissModal(true);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

  const handleEditorChange = state => {
    setEditorState(state);
    const currentContentAsHTML = draftToHtml(
      convertToRaw(state.getCurrentContent()),
    );
    setDesc(
      currentContentAsHTML.replace(/<ins>/g, '<u>').replace(/<\/ins>/g, '</u>'),
    );
  };

  return (
    <PopupModel
      centered
      maskClosable={false}
      visible={visibility}
      onCancel={() => dismissModal(false)}
      style={{
        backgroundColor: Colors.background,
      }}
      footer={null}
    >
      <Row wrap={false}>
        <div className="bodyBold white-text" style={{ minWidth: '120px' }}>
          Trail Image
        </div>
        {image || tempPic ? (
          <ImageUploadSection justify="center">
            <img
              src={
                tempPic ||
                `${process.env.IMAGE_URL_PREFIX}trail/${trailId}/${image}`
              }
              alt="profile-pic"
            />
            <input
              accept="image/*"
              className="pic"
              id="pic"
              style={{ display: 'none' }}
              onChange={imageUpload}
              type="file"
            />
            <label htmlFor="pic">
              <UpdateIcon>
                <img src={Images.editIcon} alt="upload" />
              </UpdateIcon>
            </label>
          </ImageUploadSection>
        ) : (
          <UploadPicSection
            justify="center"
            align="middle"
            className="bodyBold"
          >
            <input
              accept="image/*"
              className="pic"
              id="pic"
              style={{ display: 'none' }}
              onChange={imageUpload}
              type="file"
            />
            <label htmlFor="pic">
              <UploadIcon>
                <img src={Images.camera} alt="upload" />
              </UploadIcon>
            </label>
          </UploadPicSection>
        )}
      </Row>

      <Row wrap={false} style={{ marginTop: '20px' }}>
        <div className="bodyBold white-text" style={{ minWidth: '120px' }}>
          Description
        </div>
        <TextAreaInputSection type="desc" align="middle">
          <Editor
            placeholder={isFocused ? '' : 'Description in HTML Format'}
            className="white-text"
            editorState={editorState}
            onEditorStateChange={handleEditorChange}
            toolbarClassName="toolbarClassName"
            editorClassName="editorClassName white-text"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            toolbar={{
              options: [
                'inline',
                'blockType',
                'list',
                'textAlign',
                'link',
                'embedded',
                'emoji',
                'image',
                'colorPicker',
              ],
              colorPicker: {
                colors: [
                  Colors.warning,
                  Colors.primary,
                  Colors.orange,
                  Colors.yellow,
                  Colors.bodyText,
                  Colors.white,
                  Colors.green,
                ],
              },
            }}
          />
        </TextAreaInputSection>
      </Row>
      <Row justify="center" style={{ width: '100%' }}>
        <PrimaryButtonComponent
          style={{
            margin: '10px 10px 0px',
          }}
          label={action[0].toUpperCase() + action.substring(1)}
          onClick={() => {
            submit();
          }}
          disabled={!desc || !desc.trim().length}
          loading={isLoading}
          iconRight={false}
        />
        <PrimaryButtonComponent
          style={{
            margin: '10px 10px 0px',
          }}
          label="Cancel"
          onClick={() => dismissModal(false)}
          iconRight={false}
        />
      </Row>
    </PopupModel>
  );
}

ImageFormComponent.propTypes = {
  selectedImage: PropTypes.object,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
  action: PropTypes.string,
  trailId: PropTypes.number,
};

ImageFormComponent.defaultProps = {
  selectedImage: null,
  action: 'update',
};

export default ImageFormComponent;

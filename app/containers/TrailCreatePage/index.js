/* eslint-disable react/no-danger */
/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * TrailCreatePage
 *
 */

import React, { memo, useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axiosInstance, { createFormData } from 'services';
import { Helmet } from 'react-helmet';
import { Row, Modal } from 'antd';
import { replace } from 'connected-react-router';
import Resizer from 'react-image-file-resizer';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';
import {
  EditorState,
  convertFromHTML,
  ContentState,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import DOMPurify from 'dompurify';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectTrailCreatePage from './selectors';
import reducer from './reducer';
import saga from './saga';

const PageWrapperStyled = styled.div`
  width: 1000px;
  margin: 50px 30px 20px;
`;

const Label = styled.p`
  margin-bottom: 6px;
  width: 250px;
  min-width: 250px;
  padding-top: 10px;
`;

const Divider = styled.div`
  height: 2px;
  background-color: ${Colors.white};
  width: 100%;
  margin: 40px 0px 20px;
`;

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
  margin-bottom: 25px;

  > img {
    height: 292px;
    width: 434px;
    object-fit: ${props => (props.type === 'race' ? 'contain' : 'cover')};
    border-radius: 8px;
    border: 2px solid white;
  }
`;

const DeleteIcon = styled.div`
  background-color: ${Colors.warning};
  height: 40px;
  width: 40px;
  border-radius: 50px;
  position: absolute;
  bottom: 10px;
  right: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 20px;
    width: 20px;
  }
`;

const UpdateIcon = styled.div`
  background-color: ${Colors.primary};
  height: 40px;
  width: 40px;
  border-radius: 50px;
  position: absolute;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 20px;
    width: 20px;
  }
`;

const UploadPicSection = styled(Row)`
  background-color: ${Colors.shadow};
  height: 200px;
  width: 434px;
  border-radius: 8px;
  margin-bottom: 25px;
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

const ImageList = styled(Row)`
  margin-bottom: 25px;

  > div {
    .trail-image {
      height: 172px;
      width: 314px;
      object-fit: cover;
    }
  }

  > .html-desc {
    padding: 0px 20px 0px 20px;

    > h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${Colors.white};
    }

    > p {
      margin-bottom: 1rem;
      font-family: Montserrat-Regular;
    }

    > img {
      width: 100%;
    }

    strong {
      font-family: Montserrat-Bold;
    }

    ol,
    ul {
      padding-left: 20px;

      > li {
        padding-left: 5px;
      }
    }
  }
`;

export function TrailCreatePage({ match, location, dispatch }) {
  useInjectReducer({ key: 'trailCreatePage', reducer });
  useInjectSaga({ key: 'trailCreatePage', saga });

  const challengeId = match.params.id;

  const [title, setTitle] = useState('');
  const [mtPoint, setMtPoint] = useState('');
  const [distance, setDistance] = useState('');
  const [trailIndex, setTrailIndex] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [imageList, setImageList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [tempProgressFile, setTempProgressFile] = useState(null);
  const [tempProgressPic, setTempProgressPic] = useState(null);

  // for update trail image
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [createImageModalVisible, setCreateImageModalVisible] = useState(false);
  const [editImageModalVisible, setEditImageModalVisible] = useState(false);

  useEffect(() => {
    if (selectedImageIndex !== null) {
      setEditImageModalVisible(true);
    }
  }, [selectedImageIndex]);

  const submit = () => {
    if (!loading) {
      setLoading(true);

      const params = {
        challenge_id: challengeId,
        title,
        moontrekker_point: mtPoint,
        distance,
        trail_index: trailIndex,
        station_qr_value: qrValue,
        longitude,
        latitude,
        trail_images: imageList,
      };

      if (match.path.includes('race') && tempProgressFile) {
        params.trail_progress_image = tempProgressFile;
      }

      axiosInstance
        .post('api/trail', createFormData(params), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          setLoading(false);
          if (match.path.includes('race')) {
            dispatch(
              replace({
                pathname: `../../../race`,
                state: { tab: 'info' },
              }),
            );
          } else {
            dispatch(
              replace({
                pathname: `../../../challenges/${challengeId}`,
                state: { tab: 'trail' },
              }),
            );
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const progressImageUpload = async e => {
    const file = e.target.files[0];
    const newFile = await resizeFile(file);
    setTempProgressFile(newFile);
    setTempProgressPic(URL.createObjectURL(newFile));
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

  const ImageForm = ({
    visibility,
    dismissModal,
    action,
    selectedIndex = null,
  }) => {
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState('');
    const [tempFile, setTempFile] = useState(null);
    const [tempPic, setTempPic] = useState(null);

    const [isFocused, setIsFocused] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
      if (visibility) {
        if (selectedIndex !== null) {
          setDesc(imageList[selectedIndex].description);
          setImage(
            URL.createObjectURL(imageList[selectedIndex].image_filename),
          );

          setEditorState(() => {
            if (imageList[selectedIndex].description) {
              const blocksFromHTML = convertFromHTML(
                imageList[selectedIndex].description,
              );
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
    }, [visibility]);

    const imageUpload = async e => {
      const file = e.target.files[0];
      const newFile = await resizeFile(file);
      setTempFile(newFile);
      setTempPic(URL.createObjectURL(newFile));
    };

    const submitTrailImage = () => {
      if (action === 'update') {
        const temp = [...imageList];
        temp[selectedIndex] = {
          image_filename: tempFile || imageList[selectedIndex].image_filename,
          description: desc,
        };
        setImageList(temp);
      } else {
        setImageList(prevVal =>
          prevVal.concat([
            {
              image_filename: tempFile || null,
              description: desc,
            },
          ]),
        );
      }

      dismissModal();
    };

    const handleEditorChange = state => {
      setEditorState(state);
      const currentContentAsHTML = draftToHtml(
        convertToRaw(state.getCurrentContent()),
      );
      setDesc(
        currentContentAsHTML
          .replace(/<ins>/g, '<u>')
          .replace(/<\/ins>/g, '</u>'),
      );
    };

    return (
      <PopupModel
        centered
        maskClosable={false}
        visible={visibility}
        onCancel={dismissModal}
        style={{
          backgroundColor: Colors.background,
        }}
        footer={null}
      >
        <Row wrap={false}>
          <div className="bodyBold white-text" style={{ minWidth: '120px' }}>
            Trail Image
          </div>
          {(action === 'update' && image) || tempPic ? (
            <ImageUploadSection justify="center">
              <img src={tempPic || image} alt="profile-pic" />
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

        <Row wrap={false}>
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
            label={action === 'create' ? 'Add' : 'Update'}
            onClick={() => {
              submitTrailImage();
            }}
            disabled={
              (action === 'create' && !tempFile) || !desc || !desc.trim().length
            }
            iconRight={false}
          />
          <PrimaryButtonComponent
            style={{
              margin: '10px 10px 0px',
            }}
            label="Cancel"
            onClick={dismissModal}
            iconRight={false}
          />
        </Row>
      </PopupModel>
    );
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent
        match={match}
        location={location}
        topTab={null}
      >
        <PageWrapperStyled>
          <p className="h2 white-text" style={{ marginBottom: '40px' }}>
            Create New Trail
          </p>

          <div className="white-text">
            <TextInputComponent
              title="Trail Sequence Number"
              defaultValue={trailIndex}
              value={trailIndex}
              type="text"
              admin
              placeholder="Sequence of the Trail"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setTrailIndex(value);
                }
              }}
            />
            <TextInputComponent
              title="Title"
              defaultValue={title}
              value={title}
              admin
              placeholder="Title"
              onChange={value => {
                setTitle(value);
              }}
            />
            <TextInputComponent
              title="MoonTrekker Point"
              defaultValue={mtPoint}
              value={mtPoint}
              admin
              placeholder="MoonTrekker Point"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setMtPoint(value);
                }
              }}
            />
            <TextInputComponent
              title="Distance (KM)"
              defaultValue={distance}
              value={distance}
              admin
              placeholder="Distance"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setDistance(value);
                }
              }}
            />
            <TextInputComponent
              title="Qr Code Value"
              defaultValue={qrValue}
              value={qrValue}
              type="text"
              admin
              placeholder="Qr Code Value"
              onChange={value => {
                setQrValue(value);
              }}
            />
            <TextInputComponent
              title="Longitude"
              defaultValue={longitude}
              value={longitude}
              type="text"
              admin
              placeholder="Longitude"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setLongitude(value);
                }
              }}
            />
            <TextInputComponent
              title="Latitude"
              defaultValue={latitude}
              value={latitude}
              type="text"
              admin
              placeholder="Latitude"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setLatitude(value);
                }
              }}
            />
            {match.path.includes('race') ? (
              <Row wrap={false}>
                <Label className="bodyBold white-text">
                  Trail Progress Image
                </Label>
                {tempProgressPic ? (
                  <ImageUploadSection justify="center" type="race">
                    <img src={tempProgressPic} alt="profile-pic" />
                    <input
                      accept="image/*"
                      className="pic"
                      id="progress_pic"
                      style={{ display: 'none' }}
                      onChange={progressImageUpload}
                      type="file"
                    />
                    <label htmlFor="progress_pic">
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
                      id="progress_pic"
                      style={{ display: 'none' }}
                      onChange={progressImageUpload}
                      type="file"
                    />
                    <label htmlFor="progress_pic">
                      <UploadIcon>
                        <img src={Images.camera} alt="upload" />
                      </UploadIcon>
                    </label>
                  </UploadPicSection>
                )}
              </Row>
            ) : null}

            <Row wrap={false}>
              <Label className="bodyBold">Trail Image</Label>
              <div>
                {imageList.map((image, i) => (
                  <ImageList key={i}>
                    <div style={{ position: 'relative' }}>
                      <img
                        className="trail-image"
                        src={URL.createObjectURL(image.image_filename)}
                        alt="trail_image"
                      />
                      <DeleteIcon
                        onClick={() => {
                          const temp = [...imageList];
                          temp.splice(i, 1);
                          setImageList(temp);
                        }}
                      >
                        <img src={Images.deleteIcon} alt="upload" />
                      </DeleteIcon>
                      <UpdateIcon
                        onClick={() => {
                          setSelectedImageIndex(i);
                        }}
                      >
                        <img src={Images.editIcon} alt="upload" />
                      </UpdateIcon>
                    </div>
                    <div
                      className="body white-text html-desc"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(image.description),
                      }}
                    />
                  </ImageList>
                ))}
                <PrimaryButtonComponent
                  style={{
                    width: '200px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                  label="Add Trail Image"
                  onClick={() => setCreateImageModalVisible(true)}
                />
              </div>
            </Row>
            <Divider />
            <Row justify="center">
              <PrimaryButtonComponent
                style={{
                  margin: '20px ​20px 20p',
                  width: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Save and Preview"
                loading={loading}
                disabled={
                  !title ||
                  !title.trim().length ||
                  !qrValue ||
                  !qrValue.trim().length ||
                  !trailIndex
                }
                onClick={() => submit()}
              />
            </Row>
          </div>
          <ImageForm
            visibility={createImageModalVisible || editImageModalVisible}
            dismissModal={() => {
              if (editImageModalVisible) {
                setSelectedImageIndex(null);
                setEditImageModalVisible(false);
              }
              if (createImageModalVisible) {
                setCreateImageModalVisible(false);
              }
            }}
            action={editImageModalVisible ? 'update' : 'create'}
            selectedIndex={selectedImageIndex}
          />
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

TrailCreatePage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  trailCreatePage: makeSelectTrailCreatePage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(TrailCreatePage);

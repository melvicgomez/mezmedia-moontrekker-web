/**
 *
 * CorporateFormComponent
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
import TextInputComponent from 'components/TextInputComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';

const PopupModel = styled(Modal)`
  background-color: ${Colors.background};
  border-radius: 8px;
  padding: 20px 0px 5px;
  color: ${Colors.white};
  overflow: hidden;
  margin: 20px 0px;

  > div {
    background-color: ${Colors.background};
  }

  > .ant-modal-content {
    box-shadow: none;
    padding: 0px 40px;

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
    height: 250px;
    width: 434px;
    object-fit: contain;
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

function CorporateFormComponent({
  selectedCorporate,
  updateTeamList,
  visibility,
  dismissModal,
  action,
}) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [tempFile, setTempFile] = useState(null);
  const [tempPic, setTempPic] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCorporate) {
      setName(selectedCorporate.corporateName);
      setImage(selectedCorporate.logo);
    }
  }, [selectedCorporate]);

  const update = () => {
    if (!isLoading) {
      setIsLoading(true);
      const params =
        action === 'update'
          ? {
              corporate_id: selectedCorporate.corporateId,
              business_name: name,
              logo_filename: tempFile || null,
            }
          : {
              business_name: name,
              logo_filename: tempFile || null,
            };

      axiosInstance
        .post('api/corporate', createFormData(params))
        .then(res => {
          setIsLoading(false);

          updateTeamList(action, res.data.data);
          dismissModal();
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

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
      {image || tempPic ? (
        <ImageUploadSection justify="center">
          <img
            src={
              tempPic ||
              `${process.env.IMAGE_URL_PREFIX}corporate/${
                selectedCorporate.corporateId
              }/${image}`
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
        <UploadPicSection justify="center" align="middle" className="bodyBold">
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

      <div style={{ marginTop: '20px' }}>
        <TextInputComponent
          title="Corporate Name"
          defaultValue={name}
          value={name}
          type="text"
          placeholder="Enter Corporate Name"
          onChange={value => {
            setName(value);
          }}
        />
      </div>

      <Row justify="center" style={{ width: '100%' }}>
        <PrimaryButtonComponent
          style={{
            margin: '10px 10px 0px',
          }}
          label={action[0].toUpperCase() + action.substring(1)}
          onClick={() => {
            update();
          }}
          disabled={!name || !name.trim().length}
          loading={isLoading}
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
}

CorporateFormComponent.propTypes = {
  selectedCorporate: PropTypes.object,
  updateTeamList: PropTypes.func,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
  action: PropTypes.string,
};

CorporateFormComponent.defaultProps = {
  selectedCorporate: null,
  action: 'update',
};

export default CorporateFormComponent;

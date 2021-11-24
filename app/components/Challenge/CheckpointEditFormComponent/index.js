/* eslint-disable no-restricted-globals */
/**
 *
 * TrailEditForm
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Modal } from 'antd';
import { Colors } from 'theme/colors';
import Resizer from 'react-image-file-resizer';
import axiosInstance, { createFormData } from 'services';
import TextInputComponent from 'components/TextInputComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import { Images } from 'images/index';

const PopupModel = styled(Modal)`
  background-color: ${Colors.background};
  border-radius: 8px;
  padding: 20px 0px 5px;
  color: ${Colors.white};
  overflow: hidden;
  margin: 20px 0px;
  width: auto !important;

  > div {
    background-color: ${Colors.background};
  }

  > .ant-modal-content {
    box-shadow: none;
    padding: 0px 40px;
    width: 830px;

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

const Label = styled.p`
  margin-bottom: 6px;
  width: 250px;
  min-width: 250px;
  padding-top: 10px;
`;

const ImageUploadSection = styled(Row)`
  position: relative;
  margin-bottom: 15px;

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

function CheckpointEditForm({ visibility, dismissModal, selectedTrail, type }) {
  const [trailId, setTrailId] = useState(0);
  const [title, setTitle] = useState('');
  const [mtPoint, setMtPoint] = useState(0);
  const [distance, setDistance] = useState(0);
  const [trailIndex, setTrailIndex] = useState(0);
  const [qrValue, setQrValue] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [image, setImage] = useState('');

  const [tempFile, setTempFile] = useState(null);
  const [tempPic, setTempPic] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visibility) {
      if (selectedTrail) {
        setTitle(selectedTrail.title);
        setMtPoint(selectedTrail.moontrekker_point);
        setDistance(selectedTrail.distance);
        setTrailIndex(selectedTrail.trail_index);
        setQrValue(selectedTrail.station_qr_value);
        setLongitude(selectedTrail.longitude);
        setLatitude(selectedTrail.latitude);
        setImage(selectedTrail.trail_progress_image);
        setTrailId(selectedTrail.trail_id);
      }
    } else {
      setTempFile(null);
      setTempPic(null);
      setImage('');
    }
  }, [selectedTrail, visibility]);

  const updateTrail = () => {
    if (!isLoading) {
      setIsLoading(true);
      const params = {
        trail_id: trailId,
        title,
        moontrekker_point: !mtPoint ? 0 : mtPoint,
        distance: !distance ? 0 : distance,
        trail_index: trailIndex || selectedTrail.trail_index,
        station_qr_value: qrValue,
      };

      if (type === 'race' && tempFile) {
        params.trail_progress_image = tempFile;
      }

      if (longitude) {
        params.longitude = longitude;
      }
      if (latitude) {
        params.latitude = latitude;
      }

      axiosInstance
        .post('api/trail', createFormData(params), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          setIsLoading(false);
          setTempFile(null);
          setTempPic(null);
          dismissModal(true);
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
      onCancel={() => dismissModal(false)}
      style={{
        backgroundColor: Colors.background,
      }}
      footer={null}
    >
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
        type="text"
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
        type="text"
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
        title="Distance"
        defaultValue={distance}
        value={distance}
        type="text"
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
      {type === 'race' && (
        <Row wrap={false}>
          <Label className="bodyBold white-text">Trail Progress Image</Label>
          {image || tempPic ? (
            <ImageUploadSection justify="center">
              <img
                src={
                  tempPic ||
                  `${process.env.IMAGE_URL_PREFIX}trail/${trailId}/${image}`
                }
                alt="trail_progress"
              />
              <input
                accept="image/*"
                className="pic"
                id="trail_progress_edit"
                style={{ display: 'none' }}
                onChange={imageUpload}
                type="file"
              />
              <label htmlFor="trail_progress_edit">
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
                id="trail_progress_edit"
                style={{ display: 'none' }}
                onChange={imageUpload}
                type="file"
              />
              <label htmlFor="trail_progress_edit">
                <UploadIcon>
                  <img src={Images.camera} alt="upload" />
                </UploadIcon>
              </label>
            </UploadPicSection>
          )}
        </Row>
      )}

      <Row justify="center" style={{ width: '100%' }}>
        <PrimaryButtonComponent
          style={{
            margin: '10px 10px 0px',
          }}
          label="Update"
          onClick={() => updateTrail()}
          disabled={
            !trailIndex ||
            (!title || !title.trim().length) ||
            (!qrValue || !qrValue.trim().length)
          }
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

CheckpointEditForm.propTypes = {
  selectedTrail: PropTypes.object,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
};

CheckpointEditForm.defaultProps = {
  selectedTrail: null,
};

export default CheckpointEditForm;

/* eslint-disable no-restricted-globals */
/**
 *
 * BadWeatherFormComponent
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Modal, Col, DatePicker } from 'antd';
import moment from 'moment';
import { Colors } from 'theme/colors';
import axiosInstance from 'services';
import TextInputComponent from 'components/TextInputComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';

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

const DateTimePicker = styled(DatePicker)`
  background-color: ${Colors.shadow};
  height: 48px;
  width: 45%;
  border: 2px solid ${props => (props.error ? Colors.warning : Colors.white)};
  border-radius: 8px;
  margin-bottom: 25px;

  :focus,
  :active,
  :hover {
    border-color: ${props =>
      props.error ? Colors.warning : Colors.white} !important;
  }

  .ant-picker-suffix {
    color: ${Colors.placeholderTextColor};
  }

  .ant-picker-input > input {
    color: ${Colors.white};
    text-align: center;
  }
`;

function ProgressEditFormComponent({
  selectedProgress,
  updateProgress,
  visibility,
  dismissModal,
}) {
  const [time, setTime] = useState('');
  const [distance, setDistance] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [startDateTime, setStartDateTime] = useState(
    selectedProgress && selectedProgress.started_at
      ? moment.utc(selectedProgress.started_at)
      : null,
  );
  const [endDateTime, setEndDateTime] = useState(
    selectedProgress && selectedProgress.ended_at
      ? moment.utc(selectedProgress.ended_at)
      : null,
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedProgress) {
      setTime(selectedProgress.duration);
      setDistance(selectedProgress.distance);
      setLongitude(selectedProgress.longitude);
      setLatitude(selectedProgress.latitude);
      setStartDateTime(
        selectedProgress.started_at
          ? moment.utc(selectedProgress.started_at)
          : null,
      );
      setEndDateTime(
        selectedProgress.ended_at
          ? moment.utc(selectedProgress.ended_at)
          : null,
      );

      setIsLoading(false);
    }
  }, [selectedProgress]);

  const update = () => {
    if (!isLoading) {
      setIsLoading(true);

      const params = {
        progress_id: selectedProgress.progress_id,
        duration: time,
        distance,
        longitude,
        latitude,
      };

      if (startDateTime) {
        params.started_at = moment
          .utc(`${startDateTime}${moment().format('Z')}`)
          .format('YYYY-MM-DD HH:mm:ss');
      }

      if (endDateTime) {
        params.ended_at = moment
          .utc(`${endDateTime}${moment().format('Z')}`)
          .format('YYYY-MM-DD HH:mm:ss');
      }

      axiosInstance
        .post('api/progress', params)
        .then(() => {
          setIsLoading(false);

          updateProgress();
          dismissModal();
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
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
      <TextInputComponent
        title="Distance (km)"
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
        title="Duration (sec)"
        defaultValue={time}
        value={time}
        admin
        placeholder="Duration"
        onChange={value => {
          const reg = /^-?\d*(\.\d*)?$/;
          if (!isNaN(value) && reg.test(value)) {
            setTime(value);
          }
        }}
      />
      <TextInputComponent
        title="Longitude"
        defaultValue={longitude}
        value={longitude}
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
        admin
        placeholder="Latitude"
        onChange={value => {
          const reg = /^-?\d*(\.\d*)?$/;
          if (!isNaN(value) && reg.test(value)) {
            setLatitude(value);
          }
        }}
      />
      <Row wrap={false}>
        <Label className="bodyBold white-text">Start & End Date</Label>
        <Col flex="auto">
          <Row justify="space-between">
            <DateTimePicker
              defaultValue={
                startDateTime
                  ? moment.utc(startDateTime, 'YYYY-MM-DD HH:mm:ss').local()
                  : undefined
              }
              className="bodyBold white-text"
              placeholder="Start Date & Time"
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value, dateString) => {
                setStartDateTime(dateString);
              }}
            />
            <DateTimePicker
              defaultValue={
                endDateTime
                  ? moment.utc(endDateTime, 'YYYY-MM-DD HH:mm:ss').local()
                  : undefined
              }
              className="bodyBold white-text"
              placeholder="End Date & Time"
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value, dateString) => {
                setEndDateTime(dateString);
              }}
            />
          </Row>
        </Col>
      </Row>

      <Row justify="center" style={{ width: '100%' }}>
        <PrimaryButtonComponent
          style={{
            margin: '10px 10px 0px',
          }}
          label="Update"
          onClick={() => {
            update();
          }}
          disabled={false}
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

ProgressEditFormComponent.propTypes = {
  selectedProgress: PropTypes.object,
  updateProgress: PropTypes.func,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
};

ProgressEditFormComponent.defaultProps = {
  selectedProgress: null,
};

export default ProgressEditFormComponent;

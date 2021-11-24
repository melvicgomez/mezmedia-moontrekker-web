/* eslint-disable no-restricted-globals */
/**
 *
 * BadWeatherFormComponent
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Modal, Radio, Col, DatePicker } from 'antd';
import { Colors } from 'theme/colors';
import moment from 'moment';
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

function BadWeatherFormComponent({
  selectedAttempt,
  updateAttemptList,
  visibility,
  dismissModal,
}) {
  const [attemptData, setAttemptData] = useState(null);
  const [mtPoint, setMtPoint] = useState('');
  const [distance, setDistance] = useState('');
  const [status, setStatus] = useState(0);
  const [time, setTime] = useState('');
  const [startDateTime, setStartDateTime] = useState(
    selectedAttempt && selectedAttempt.started_at
      ? moment.utc(selectedAttempt.started_at)
      : null,
  );
  const [endDateTime, setEndDateTime] = useState(
    selectedAttempt && selectedAttempt.ended_at
      ? moment.utc(selectedAttempt.ended_at)
      : null,
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedAttempt) {
      setAttemptData(selectedAttempt);
      setMtPoint(selectedAttempt.moontrekker_point);
      setDistance(selectedAttempt.total_distance);
      setStatus(selectedAttempt.status === 'complete' ? 1 : 0);
      setTime(selectedAttempt.total_time);
      setStartDateTime(
        selectedAttempt.started_at
          ? moment.utc(selectedAttempt.started_at)
          : null,
      );
      setEndDateTime(
        selectedAttempt.ended_at ? moment.utc(selectedAttempt.ended_at) : null,
      );

      setIsLoading(false);
    }
  }, [selectedAttempt]);

  const update = () => {
    if (!isLoading) {
      setIsLoading(true);

      const params = {
        attempt_id: selectedAttempt.attempt_id,
        total_distance: distance,
        moontrekker_point: mtPoint,
        total_time: time,
        status: status === 1 ? 'complete' : 'incomplete',
      };

      if (mtPoint && attemptData.moontrekker_point !== parseInt(mtPoint, 10)) {
        params.moontrekker_point = mtPoint;
      }

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
        .post('api/attempt?type=admin', params)
        .then(() => {
          setIsLoading(false);

          updateAttemptList();
          dismissModal();
        })
        .catch(() => {
          setIsLoading(false);
        });

      setIsLoading(false);
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
      <Row wrap={false} align="middle" style={{ margin: '-10px 0px 15px' }}>
        <Label className="bodyBold white-text">Challenge</Label>
        <div className="bodyBold white-text">
          {attemptData ? attemptData.challenge.title : ''}
        </div>
      </Row>
      <Row wrap={false} style={{ margin: '5px 0px 15px' }}>
        <Label className="bodyBold white-text">Status</Label>
        <Radio.Group
          onChange={async e => {
            setStatus(e.target.value === 'Complete' ? 1 : 0);
          }}
          value={status === 0 ? 'Incomplete' : 'Complete'}
        >
          <Row>
            {['Complete', 'Incomplete'].map((option, i) => (
              <div key={i} style={{ padding: '5px 10px' }}>
                <Radio
                  className="white-text bodyBold"
                  value={option}
                  style={{ padding: '5px' }}
                >
                  {option}
                </Radio>
              </div>
            ))}
          </Row>
        </Radio.Group>
      </Row>
      <TextInputComponent
        title="Total MT Point Gained"
        defaultValue={mtPoint}
        value={mtPoint}
        admin
        placeholder="Total MT Point Gained"
        onChange={value => {
          const reg = /^-?\d*(\.\d*)?$/;
          if (!isNaN(value) && reg.test(value)) {
            setMtPoint(value);
          }
        }}
      />
      <TextInputComponent
        title="Total Distance (km)"
        defaultValue={distance}
        value={distance}
        admin
        placeholder="Total Distance"
        onChange={value => {
          const reg = /^-?\d*(\.\d*)?$/;
          if (!isNaN(value) && reg.test(value)) {
            setDistance(value);
          }
        }}
      />
      <TextInputComponent
        title="Total Time (sec)"
        defaultValue={time}
        value={time}
        admin
        placeholder="Total Time Spent"
        onChange={value => {
          const reg = /^-?\d*(\.\d*)?$/;
          if (!isNaN(value) && reg.test(value)) {
            setTime(value);
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

BadWeatherFormComponent.propTypes = {
  selectedAttempt: PropTypes.object,
  updateAttemptList: PropTypes.func,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
};

BadWeatherFormComponent.defaultProps = {
  selectedAttempt: null,
};

export default BadWeatherFormComponent;

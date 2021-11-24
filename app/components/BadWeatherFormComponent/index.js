/**
 *
 * BadWeatherFormComponent
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Modal, Col, DatePicker } from 'antd';
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
  border: 2px solid ${props => (props.error ? Colors.warning : Colors.white)};
  border-radius: 8px;
  width: 100%;
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
  selectedWarning,
  updateWarningList,
  visibility,
  dismissModal,
  action,
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startDateTime, setStartDateTime] = useState(
    action === 'update' && selectedWarning.started_at
      ? moment.utc(selectedWarning.started_at).local()
      : null,
  );
  const [endDateTime, setEndDateTime] = useState(
    action === 'update' && selectedWarning.ended_at
      ? moment.utc(selectedWarning.ended_at).local()
      : null,
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedWarning) {
      setTitle(selectedWarning.title);
      setMessage(selectedWarning.message);
      setStartDateTime(
        selectedWarning.started_at
          ? moment.utc(selectedWarning.started_at).local()
          : null,
      );
      setEndDateTime(
        selectedWarning.ended_at
          ? moment.utc(selectedWarning.ended_at).local()
          : null,
      );
      setIsLoading(false);
    }
  }, [selectedWarning]);

  const update = () => {
    if (!isLoading) {
      setIsLoading(true);

      if (action === 'update') {
        const urlencoded = new URLSearchParams();
        urlencoded.append('title', title);
        urlencoded.append('message', message);
        urlencoded.append(
          'started_at',
          moment
            .utc(`${startDateTime}${moment().format('Z')}`)
            .format('YYYY-MM-DD HH:mm'),
        );
        urlencoded.append(
          'ended_at',
          moment
            .utc(`${endDateTime}${moment().format('Z')}`)
            .format('YYYY-MM-DD HH:mm'),
        );

        axiosInstance
          .put(
            `api/weather-warning/${selectedWarning.warning_id}`,
            urlencoded,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .then(res => {
            setIsLoading(false);
            updateWarningList(action, res.data);
            dismissModal();
          })
          .catch(() => {
            setIsLoading(false);
          });
      } else {
        axiosInstance
          .post('api/weather-warning', {
            title,
            message,
            started_at: moment
              .utc(`${startDateTime}${moment().format('Z')}`)
              .format('YYYY-MM-DD HH:mm'),
            ended_at: moment
              .utc(`${endDateTime}${moment().format('Z')}`)
              .format('YYYY-MM-DD HH:mm'),
          })
          .then(res => {
            setIsLoading(false);

            updateWarningList(action, res.data);
            dismissModal();
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
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
        title="Warning Title"
        defaultValue={title}
        value={title}
        type="text"
        admin
        placeholder="Warning Title"
        onChange={value => {
          setTitle(value);
        }}
      />
      <TextInputComponent
        title="Warning Message"
        defaultValue={message}
        value={message}
        type="text"
        admin
        placeholder="Warning Message"
        onChange={value => {
          setMessage(value);
        }}
      />
      <Row wrap={false}>
        <Label className="bodyBold white-text">Started At</Label>
        <Col flex="auto">
          <Row justify="space-between">
            <DateTimePicker
              defaultValue={
                startDateTime
                  ? moment.utc(startDateTime, 'YYYY-MM-DD HH:mm').local()
                  : null
              }
              className="bodyBold white-text"
              placeholder="Started At"
              showNow={false}
              disabledDate={current =>
                current && current < moment().startOf('day')
              }
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              onChange={(value, dateString) => {
                setStartDateTime(dateString);
              }}
            />
          </Row>
        </Col>
      </Row>
      <Row wrap={false}>
        <Label className="bodyBold white-text">Ended At</Label>
        <Col flex="auto">
          <Row justify="space-between">
            <DateTimePicker
              defaultValue={
                endDateTime
                  ? moment.utc(endDateTime, 'YYYY-MM-DD HH:mm').local()
                  : null
              }
              className="bodyBold white-text"
              placeholder="Ended At"
              showNow={false}
              disabledDate={current =>
                current && current < moment().startOf('day')
              }
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
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
          label={action[0].toUpperCase() + action.substring(1)}
          onClick={() => {
            update();
          }}
          disabled={!title || !title.trim().length}
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
  selectedWarning: PropTypes.object,
  updateWarningList: PropTypes.func,
  visibility: PropTypes.bool,
  dismissModal: PropTypes.func,
  action: PropTypes.string,
};

BadWeatherFormComponent.defaultProps = {
  selectedWarning: null,
  action: 'update',
};

export default BadWeatherFormComponent;

/**
 *
 * AddBcoinComponent
 *
 */

import React, { memo, useState } from 'react';
import { Modal, Row, Input } from 'antd';
// import PropTypes from 'prop-types';
import api from 'services';
import styled from 'styled-components';
import { Colors } from 'theme/colors';
import TextInputComponent from 'components/TextInputComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
const { TextArea } = Input;

const Popup = styled(Modal)`
  background-color: ${Colors.darkGrey} !important;
  border-radius: 16px;
  padding-bottom: 0px;
  width: auto !important;
  overflow: hidden;

  > div {
    background-color: ${Colors.darkGrey};
  }

  > .ant-modal-content {
    box-shadow: 0px !important;
    padding: 25px 10px 10px;
    width: 400px;

    > div > div {
      margin-bottom: 15px;
    }
    > button {
      top: -5px;
    }

    .ant-modal-close-x {
      color: ${Colors.white};
    }
  }

  .text-input {
    text-align: left;
  }
`;

const CommentInputSection = styled(Row)`
  border-radius: 8px;
  height: auto !important;
  box-shadow: inset 0px 1px 2px 0px #00000035;
  background-color: ${Colors.shadow};
  border: 2px solid ${Colors.white};
  padding: 10px 15px;

  > textarea {
    width: 100%;
    color: ${Colors.white};
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;

    ::-webkit-scrollbar {
      display: none;
    }
  }
`;
function AddBcoinComponent({ visibility, onCancel, userId }) {
  const [isFocused, setIsFocused] = useState(0);
  const [mtPoint, setMtPoint] = useState(0);
  const [desc, setDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <Popup centered visible={visibility} onCancel={onCancel} footer={null}>
        <TextInputComponent
          type="number"
          title="MT Point Amount"
          defaultValue={mtPoint}
          value={mtPoint}
          placeholder="Enter MT Point Amount"
          onChange={value => {
            setMtPoint(value);
          }}
        />

        <p
          className="bodyBold white-text input-title"
          style={{ marginBottom: 6 }}
        >
          Description
        </p>
        <CommentInputSection align="middle" className="white-text">
          <TextArea
            value={desc}
            onChange={({ target: { value } }) => {
              setDesc(value);
            }}
            placeholder={isFocused ? '' : 'Enter Description'}
            className="bodyBold"
            bordered={false}
            autoSize={{ minRows: 3, maxRows: 3 }}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
          />
        </CommentInputSection>

        <Row justify="center">
          <PrimaryButtonComponent
            loading={isLoading}
            iconRight
            label="Submit"
            onClick={() => {
              setIsLoading(true);
              api
                .post(`api/moontrekker-points`, {
                  user_id: userId,
                  amount: mtPoint,
                  description: desc,
                })
                .finally(() => {
                  setIsLoading(false);
                  onCancel();
                });
            }}
          />
        </Row>
      </Popup>
    </div>
  );
}

AddBcoinComponent.propTypes = {};

export default memo(AddBcoinComponent);

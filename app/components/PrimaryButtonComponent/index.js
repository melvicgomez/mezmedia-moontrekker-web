/**
 *
 * PrimaryButtonComponent
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'antd';
import { Colors } from 'theme/colors';

const ParticipateButton = styled(Button)`
  background: ${props =>
    props.disabled ? Colors.disabled : Colors.primary} !important;
  padding-left: 25px;
  padding-right: 25px;
  border-radius: 8px;
  border: 0px;
  outline: 0px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: ${Colors.shadow} 0px 2px 2px 0px;

  &:hover,
  :focus {
    background: ${Colors.primary};
    color: ${Colors.white};
  }

  > .ant-btn-loading-icon {
    margin: 0px 5px 5px 0px;
  }

  :disabled {
    background-color: ${Colors.lightGrey} !important;
    color: ${Colors.white};

    :hover {
      color: ${Colors.white};
    }
  }
`;

function PrimaryButtonComponent({ label, onClick, loading, disabled, style }) {
  return (
    <ParticipateButton
      style={style}
      className="bodyBold white-text"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </ParticipateButton>
  );
}

PrimaryButtonComponent.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

PrimaryButtonComponent.defaultProps = {
  loading: false,
  disabled: false,
};

export default PrimaryButtonComponent;

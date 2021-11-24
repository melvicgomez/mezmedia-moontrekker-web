/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * AppBarComponent
 *
 */

import React, { memo, useState } from 'react';
import { Layout, Row } from 'antd';
import styled from 'styled-components';
// import PropTypes from 'prop-types';
import { Colors } from 'theme/colors';
import { connect } from 'react-redux';
import axiosInstance from 'services';
import { compose } from 'redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';
import { replace } from 'connected-react-router';

const { Header } = Layout;

const HeaderBar = styled(Header)`
  z-index: 10;
  background: ${Colors.primary};
  height: 68px;
  align-items: center;
  padding-left: 25px;
  position: fixed;
  top: 0;
  width: 100vw;
  display: flex;
  flex-direction: row;
`;

function AppBarComponent({ dispatch }) {
  const user = reactLocalStorage.getObject('user');

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const userLogout = () => {
    if (!logoutLoading)
      axiosInstance
        .delete('api/logout')
        .then(async () => {
          reactLocalStorage.remove('user');
          reactLocalStorage.remove('token');
          setConfirmLogout(false);
          dispatch(replace(''));
        })
        .catch(() => {
          setLogoutLoading(false);
        });
  };

  return (
    <HeaderBar>
      <div
        style={{
          minWidth: 1336,
          width: '100%',
          margin: 'auto',
        }}
      >
        <Row justify="space-between">
          <div className="white-text h3">MOONTREKKER CMS</div>
          {user ? (
            <div
              className="white-text bodyBold"
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setConfirmLogout(true)}
            >
              LOGOUT
            </div>
          ) : null}
          <ConfirmationPopupComponent
            visibility={confirmLogout}
            dismissModal={() => setConfirmLogout(false)}
            title="Confirm Logout"
            message="You will be logged out of MoonTrekker and will be required to sign back in. Are you sure you want to proceed?"
            leftAction={userLogout}
            rightAction={() => setConfirmLogout(false)}
          />
        </Row>
      </div>
    </HeaderBar>
  );
}

AppBarComponent.propTypes = {};

const mapStateToProps = () => ({});

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
)(AppBarComponent);

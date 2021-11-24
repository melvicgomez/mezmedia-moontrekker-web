/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * SendNotificationPage
 *
 */

import React, { memo, useState } from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Colors } from 'theme/colors';
import axiosInstance from 'services';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import TextAreaComponent from 'components/TextAreaComponent';
import TextInputComponent from 'components/TextInputComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';

import { Row } from 'antd';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectSendNotificationPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const PageWrapperStyled = styled.div`
  padding: 10px;
`;

const StyledWrapper = styled.div`
  .text-input {
    text-align: left;
    padding: 10px 26px;
  }
`;

const RightContentStyled = styled.div`
  position: sticky;
  top: 148px;
  height: calc(100vh - 148px);
  overflow-y: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }
`;

export function SendNotificationPage({ match }) {
  useInjectReducer({ key: 'sendNotificationPage', reducer });
  useInjectSaga({ key: 'sendNotificationPage', saga });

  const [title, setTitle] = useState('');
  const [bodyMessage, setBodyMessage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent match={match}>
        <PageWrapperStyled className="white-text">
          <div
            className="h3 cyan-text"
            style={{
              margin: '20px 0px 10px',
              borderBottom: `2px solid ${Colors.primary}`,
              width: 'fit-content',
            }}
          >
            Send to All User
          </div>
          <Row
            justify="space-between"
            wrap={false}
            style={{ marginTop: '20px' }}
          >
            <div style={{ width: '645px' }}>
              <StyledWrapper>
                <ConfirmationPopupComponent
                  actionRequire={false}
                  visibility={showAlertPopup}
                  dismissModal={() => {
                    setShowAlertPopup(false);
                  }}
                  title="Notification Sent!"
                  message="You successfully sent a messge to all users in MoonTrekker."
                />

                <Row justify="space-between" wrap={false}>
                  <div style={{ width: '645px', marginTop: '5px' }}>
                    <TextInputComponent
                      title="Title"
                      defaultValue={title}
                      value={title}
                      admin
                      placeholder="Title of Notifcation"
                      onChange={value => {
                        setTitle(value);
                      }}
                    />
                    <TextAreaComponent
                      value={bodyMessage}
                      onChange={setBodyMessage}
                      placeholder="Notification Message"
                      label="Message"
                    />

                    <TextInputComponent
                      title="Deeplink"
                      defaultValue={deepLink}
                      value={deepLink}
                      admin
                      placeholder="Deeplink e.g. challenges/13"
                      onChange={value => {
                        setDeepLink(value);
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ minWidth: 250 }} />
                      <div
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <PrimaryButtonComponent
                          disabled={!title.trim() || !bodyMessage.trim()}
                          loading={isLoading}
                          iconRight
                          label="SEND"
                          onClick={() => {
                            if (!isLoading) {
                              setIsLoading(true);
                              axiosInstance
                                .post(`/api/message-all-users`, {
                                  title,
                                  message: bodyMessage,
                                  deep_link: deepLink,
                                })
                                .finally(() => {
                                  setShowAlertPopup(true);
                                  setIsLoading(false);
                                  setTitle('');
                                  setBodyMessage('');
                                  setDeepLink('');
                                });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Row>
              </StyledWrapper>
            </div>
            <RightContentStyled>
              <div style={{ padding: '0px 20px' }}>
                <div className="h3">Deeplinking</div>
                <ul>
                  <li className="bodyBold">
                    To deep link, enter the correct category and ID
                  </li>
                  <li className="bodyBold">
                    To test of the deeplink is correct, send one to yourself
                    first.
                  </li>
                </ul>
                <div className="h3">Links</div>
                <ul className="bodyBold">
                  <li>
                    announcement/
                    <span className="bodyBold cyan-text">announcementID</span>
                  </li>
                  <li>
                    challenges/
                    <span className="bodyBold cyan-text">challengeID</span>
                  </li>
                  <li>race/1</li>
                  <li>training/2</li>

                  <li>leaderboards</li>
                  <li>my-profile</li>
                  <li>sponsors</li>
                  <li>settings</li>
                </ul>
              </div>
            </RightContentStyled>
          </Row>
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

SendNotificationPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  sendNotificationPage: makeSelectSendNotificationPage(),
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
)(SendNotificationPage);

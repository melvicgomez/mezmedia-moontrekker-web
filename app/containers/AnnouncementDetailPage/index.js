/**
 *
 * AnnouncementDetailPage
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axiosInstance from 'services';
import { Helmet } from 'react-helmet';
import { Row, Spin } from 'antd';
import { push, replace } from 'connected-react-router';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectAnnouncementDetailPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const LoadingSpinner = styled(Spin)`
  margin-top: 30px;
`;

const ContentWrapper = styled(Row)`
  > div:first-child {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;

    ::-webkit-scrollbar {
      display: none;
    }
  }
`;

const AnnouncementImage = styled.img`
  height: 274px;
  width: 100%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  object-fit: cover;
  overflow: hidden;
`;

const Description = styled.div`
  padding: 20px 20px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const HtmlDescription = styled.div`
  margin-bottom: 25px;
  padding-top: 10px;

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
`;

const InfoSection = styled.div`
  margin-top: 20px;
  margin-left: 30px;
  max-width: 500px;

  > div {
    margin-top: 5px;
  }

  .label {
    width: 200px;
    min-width: 200px;
  }

  a:hover {
    color: ${Colors.white};
  }

  .divider {
    height: 2px;
    background-color: ${Colors.white};
    margin: 20px 0px;
  }
`;

export function AnnouncementDetailPage({ dispatch, match }) {
  useInjectReducer({ key: 'announcementDetailPage', reducer });
  useInjectSaga({ key: 'announcementDetailPage', saga });

  const announcementId = match.params.id;

  // for clean up unmount
  const unmounted = useRef(false);

  const [loading, setLoading] = useState(true);
  const [announcementData, setAnnouncementData] = useState();

  const [publishLoading, setPublishLoading] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`api/announcement/${announcementId}`)
      .then(res => {
        if (!unmounted.current) {
          setAnnouncementData(res.data.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      unmounted.current = true;
    };
  }, []);

  const deleteAnnouncement = () => {
    axiosInstance
      .delete(`api/announcement/${announcementId}`)
      .then(() => {
        setDeleteModalVisible(false);
        dispatch(replace('../../../announcements'));
      })
      .catch(() => {
        setDeleteModalVisible(false);
      });
  };

  const publish = () => {
    if (!publishLoading) {
      axiosInstance
        .post(`api/announcement/publish/${announcementId}?action=publish`)
        .then(res => {
          announcementData.published_at = res.data.data.published_at;
          setConfirmModalVisible(false);
          // setPublishModalVisible(true);
          setPublishLoading(false);
          dispatch(push('../../../announcements'));
        })
        .catch(() => {
          setConfirmModalVisible(false);
          setPublishLoading(false);
        });
    }
  };

  const unpublish = () => {
    if (!publishLoading) {
      axiosInstance
        .post(`api/announcement/publish/${announcementId}?action=unpublish`)
        .then(() => {
          announcementData.published_at = null;
          setUnpublishModalVisible(false);
          setPublishLoading(false);
        })
        .catch(() => {
          setUnpublishModalVisible(false);
          setPublishLoading(false);
        });
    }
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent match={match} location={null} topTab={null}>
        <ContentWrapper flex={1} wrap={false}>
          {!loading ? (
            <Row wrap={false} style={{ padding: '30px 20px 10px 10px' }}>
              <div style={{ width: '458px' }}>
                <AnnouncementImage
                  src={`${process.env.IMAGE_URL_PREFIX}announcement/${
                    announcementData.announcement_id
                  }/${announcementData.cover_image}`}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = Images.imagePlaceholder;
                  }}
                />
                <Description>
                  <div className="h3 cyan-text">{announcementData.title}</div>
                  <HtmlDescription
                    className="body white-text"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(announcementData.html_content),
                    }}
                  />
                </Description>
              </div>
              <InfoSection className="white-text bodyBold">
                <Row>
                  <div className="label">Announcement ID</div>
                  <div>{announcementData.announcement_id}</div>
                </Row>
                <Row>
                  <div className="label">Created Date</div>
                  <div>
                    {moment
                      .utc(announcementData.created_at)
                      .local()
                      .format('DD/MM/yyyy HH:mm')}
                  </div>
                </Row>

                <Row>
                  <div className="label">Schedule Date</div>
                  <div className="orange-text">
                    {announcementData.scheduled_at
                      ? moment
                          .utc(announcementData.scheduled_at)
                          .local()
                          .format('DD/MM/yyyy HH:mm')
                      : '-'}
                  </div>
                </Row>
                <Row>
                  <div className="label">Published Date</div>
                  <div
                    className={
                      announcementData.published_at
                        ? 'green-text'
                        : 'error-text'
                    }
                  >
                    {announcementData.published_at
                      ? moment
                          .utc(announcementData.published_at)
                          .local()
                          .format('DD/MM/yyyy HH:mm')
                      : 'Unpublished'}
                  </div>
                </Row>
                <Row>
                  <div className="label">Pinned</div>
                  <div>{announcementData.pin_post === 1 ? 'Yes' : 'No'}</div>
                </Row>
                <Row wrap={false}>
                  <div className="label">Notification Message</div>
                  <div>
                    {announcementData.notification_message
                      ? announcementData.notification_message
                      : '-'}
                  </div>
                </Row>

                {!announcementData.deleted_at && (
                  <>
                    <Row wrap={false} justify="space-between">
                      <PrimaryButtonComponent
                        style={{
                          padding: '0px 30px',
                          marginTop: '25px',
                          marginRight: '10px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                        label="Edit Announcement"
                        onClick={() =>
                          dispatch(
                            push(
                              `../../announcements/${
                                announcementData.announcement_id
                              }/edit`,
                            ),
                          )
                        }
                        iconRight={false}
                      />
                      <PrimaryButtonComponent
                        style={{
                          padding: '0px 30px',
                          marginTop: '25px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                        label="Delete Announcement"
                        onClick={() => setDeleteModalVisible(true)}
                        iconRight={false}
                      />
                    </Row>
                    <PrimaryButtonComponent
                      style={{
                        padding: '0px 30px',
                        marginTop: '15px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                      label={
                        announcementData.published_at
                          ? 'Unpublish Announcement'
                          : 'Publish Announcement Now'
                      }
                      onClick={() => {
                        if (!announcementData.published_at) {
                          setConfirmModalVisible(true);
                        } else {
                          setUnpublishModalVisible(true);
                        }
                      }}
                      loading={publishLoading}
                      iconRight={false}
                    />
                  </>
                )}
                <ConfirmationPopupComponent
                  visibility={deleteModalVisible}
                  dismissModal={() => {
                    setDeleteModalVisible(false);
                  }}
                  title="Delete Announcement"
                  message="This action cannot be undone. Do you wish to delete this announcement?"
                  leftAction={deleteAnnouncement}
                  rightAction={() => setDeleteModalVisible(false)}
                />
                <ConfirmationPopupComponent
                  visibility={unpublishModalVisible}
                  dismissModal={() => {
                    setUnpublishModalVisible(false);
                  }}
                  title="Unpublish Announcement"
                  message="Do you wish to unpublish this announcement?"
                  leftAction={() => {
                    unpublish();
                    setPublishLoading(true);
                    setUnpublishModalVisible(false);
                  }}
                  rightAction={() => setUnpublishModalVisible(false)}
                />
                <ConfirmationPopupComponent
                  visibility={confirmModalVisible}
                  dismissModal={() => {
                    setConfirmModalVisible(false);
                  }}
                  title="Publish Announcement"
                  message="This will be posted on the Announcement Section which can be viewed by all MoonTrekker users"
                  rightAction={() => setConfirmModalVisible(false)}
                  rightLabel="Cancel"
                  leftAction={() => {
                    publish();
                    setPublishLoading(true);
                    setConfirmModalVisible(false);
                  }}
                  leftLabel="Confirm"
                />
                <ConfirmationPopupComponent
                  visibility={publishModalVisible}
                  dismissModal={() => {
                    setPublishModalVisible(false);
                    dispatch(push('../../../announcements'));
                  }}
                  title="Publish Successful"
                  message="The announcement has been published!"
                  actionRequire={false}
                />
              </InfoSection>
            </Row>
          ) : (
            <Row justify="center" style={{ flex: 1 }}>
              <LoadingSpinner size="large" />
            </Row>
          )}
        </ContentWrapper>
      </NavigationWrapperComponent>
    </div>
  );
}

AnnouncementDetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  announcementDetailPage: makeSelectAnnouncementDetailPage(),
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
)(AnnouncementDetailPage);

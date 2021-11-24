/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * ChallengeDetailPage
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
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
import TrailDetailComponent from 'components/Challenge/TrailDetailComponent';
import AttemptListComponent from 'components/Challenge/AttemptListComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectChallengeDetailPage from './selectors';
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

const SelectionBar = styled(Row)`
  margin-left: 40px;

  > div {
    margin-right: 50px;
    cursor: pointer;
    height: fit-content;
  }
`;

const ChallengeImage = styled.img`
  height: 285px;
  width: 100%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  object-fit: cover;
  overflow: hidden;
`;

const ChallengeInfoSection = styled.div`
  background-color: ${Colors.white};
  padding: 10px 20px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  .title {
    margin-bottom: 3px;
  }

  .desc {
    margin-bottom: 10px;
  }

  .icon {
    height: 20px;
    width: 20px;
    object-fit: contain;
    margin-right: 5px;
  }
`;

const HtmlDescription = styled.div`
  margin-bottom: 25px;
  padding: 20px 20px 0px 20px;

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
  margin-top: 30px;
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

export function ChallengeDetailPage({ match, location, dispatch }) {
  useInjectReducer({ key: 'challengeDetailPage', reducer });
  useInjectSaga({ key: 'challengeDetailPage', saga });

  const challengeId = match.params.id;

  const [selectedTab, setSelectedTab] = useState(1);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  useEffect(() => {
    let tab = '';

    if (location && location.state) {
      tab =
        location.state.tab === 'info'
          ? 1
          : location.state.tab === 'trail'
          ? 2
          : 3;
    } else {
      tab = 1;
    }

    setSelectedTab(tab);
  }, [location, match]);

  const ChallengeInfo = () => {
    const [challengeLoading, setChallengeLoading] = useState(true);
    const [challengeData, setChallengeData] = useState();

    const [publishLoading, setPublishLoading] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [publishModalVisible, setPublishModalVisible] = useState(false);
    const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);

    const challengeType = {
      challenge_standard: 'Standard Challenge',
      challenge_either_end: 'Either End Challenge',
      challenge_single: 'Single Challenge',
      challenge_training: 'Training Challenge',
    };

    useEffect(() => {
      axiosInstance
        .get(`api/challenge/${challengeId}`)
        .then(res => {
          if (!unmounted.current) {
            setChallengeData(res.data.data);
          }
        })
        .finally(() => {
          setChallengeLoading(false);
        });
    }, []);

    const deleteChallenge = () => {
      axiosInstance
        .delete(`api/challenge/${challengeId}`)
        .then(() => {
          setDeleteModalVisible(false);
          dispatch(replace('../../../challenges'));
        })
        .catch(() => {
          setDeleteModalVisible(false);
        });
    };

    const publish = () => {
      if (!publishLoading) {
        axiosInstance
          .post(`api/challenge/publish/${challengeId}?action=publish`)
          .then(res => {
            challengeData.published_at = res.data.data.published_at;
            setConfirmModalVisible(false);
            // setPublishModalVisible(true);
            setPublishLoading(false);
            dispatch(push('../../../challenges'));
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
          .post(`api/challenge/publish/${challengeId}?action=unpublish`)
          .then(() => {
            challengeData.published_at = null;
            setUnpublishModalVisible(false);
            setPublishLoading(false);
          })
          .catch(() => {
            setUnpublishModalVisible(false);
            setPublishLoading(false);
          });
      }
    };

    return !challengeLoading ? (
      <Row wrap={false} style={{ padding: '20px 20px 10px 10px' }}>
        <div style={{ width: '458px' }}>
          <ChallengeImage
            src={`${process.env.IMAGE_URL_PREFIX}challenge/${
              challengeData.challenge_id
            }/${challengeData.challenge_cover_image}`}
            onError={e => {
              e.target.onerror = null;
              e.target.src = Images.imagePlaceholder;
            }}
          />
          <ChallengeInfoSection>
            <div className="h3 cyan-text title">{challengeData.title}</div>
            <div className="body grey-text desc">
              {challengeData.description}
            </div>
            {challengeData.type !== 'challenge_training' &&
            (challengeData.reward_count ||
              challengeData.is_distance_required) ? (
              <Row align="middle" style={{ marginBottom: '10px' }}>
                {challengeData.reward_count ? (
                  <Row
                    align="middle"
                    className="body grey-text"
                    style={{ marginRight: '30px' }}
                  >
                    <img
                      className="icon"
                      src={Images.rewardIcon}
                      alt="reward"
                    />
                    {challengeData.reward_count -
                      challengeData.total_reward_claimed >
                    0
                      ? challengeData.reward_count -
                        challengeData.total_reward_claimed
                      : 0}{' '}
                    Remaining
                  </Row>
                ) : null}
                {challengeData.is_distance_required ? (
                  <Row align="middle" className="bodyBold grey-text">
                    <img className="icon" src={Images.locationIcon} alt="gps" />
                    {challengeData.distance}km
                  </Row>
                ) : null}
              </Row>
            ) : null}
            <div style={{ marginBottom: '10px' }}>
              <Row align="middle" className="body grey-text">
                <img className="icon" src={Images.dateIcon} alt="reward" />
                {moment.utc(challengeData.ended_at) < moment.utc()
                  ? 'Ended'
                  : `Ends on ${moment
                      .utc(challengeData.ended_at)
                      .local()
                      .format('DD MMM HH:mm')}`}
              </Row>
            </div>
          </ChallengeInfoSection>
          <HtmlDescription
            className="body white-text"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(challengeData.html_content),
            }}
          />
        </div>
        <InfoSection className="white-text bodyBold">
          <Row>
            <div className="label">Challenge ID</div>
            <div>{challengeData.challenge_id}</div>
          </Row>
          <Row>
            <div className="label">Type</div>
            <div>{challengeType[challengeData.type]}</div>
          </Row>
          <Row>
            <div className="label">Difficulty</div>
            <div className="white-text">{challengeData.difficulty}</div>
          </Row>
          <Row>
            <div className="label">Total Reward</div>
            <div className="white-text">{challengeData.reward_count}</div>
          </Row>
          <Row>
            <div className="label">Time Required?</div>
            <div className="white-text">
              {challengeData.is_time_required ? 'Yes' : 'No'}
            </div>
          </Row>
          <Row>
            <div className="label">Distance Required?</div>
            <div className="white-text">
              {challengeData.is_distance_required ? 'Yes' : 'No'}
            </div>
          </Row>
          <Row>
            <div className="label">Start Date</div>
            <div className="white-text">
              {challengeData.started_at
                ? moment
                    .utc(challengeData.started_at)
                    .local()
                    .format('DD/MM/yyyy HH:mm')
                : '-'}
            </div>
          </Row>
          <Row>
            <div className="label">End Date</div>
            <div className="white-text">
              {challengeData.ended_at
                ? moment
                    .utc(challengeData.ended_at)
                    .local()
                    .format('DD/MM/yyyy HH:mm')
                : '-'}
            </div>
          </Row>
          <div className="divider" />
          <Row>
            <div className="label">Created Date</div>
            <div>
              {moment
                .utc(challengeData.created_at)
                .local()
                .format('DD/MM/yyyy HH:mm')}
            </div>
          </Row>
          <Row>
            <div className="label">Published Date</div>
            <div
              className={
                challengeData.published_at ? 'green-text' : 'error-text'
              }
            >
              {challengeData.published_at
                ? moment
                    .utc(challengeData.published_at)
                    .local()
                    .format('DD/MM/yyyy HH:mm')
                : 'Unpublished'}
            </div>
          </Row>
          <Row>
            <div className="label">Schedule Date</div>
            <div className="orange-text">
              {challengeData.schedule_at
                ? moment
                    .utc(challengeData.schedule_at)
                    .local()
                    .format('DD/MM/yyyy HH:mm')
                : '-'}
            </div>
          </Row>

          {!challengeData.deleted_at && (
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
                  label="Edit Challenge"
                  onClick={() =>
                    dispatch(
                      push(
                        `../../challenges/${challengeData.challenge_id}/edit`,
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
                  label="Delete Challenge"
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
                  challengeData.published_at
                    ? 'Unpublish Challenge'
                    : 'Publish Challenge Now'
                }
                onClick={() => {
                  if (!challengeData.published_at) {
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
            title="Delete Challenge"
            message="This action cannot be undone. Do you wish to delete this challenge?"
            leftAction={deleteChallenge}
            rightAction={() => setDeleteModalVisible(false)}
          />
          <ConfirmationPopupComponent
            visibility={unpublishModalVisible}
            dismissModal={() => {
              setUnpublishModalVisible(false);
            }}
            title="Unpublish Challenge"
            message="Do you wish to unpublish this challenge?"
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
            title="Publish Challenge"
            message="This will be posted on the Challenge List which can be viewed by all MoonTrekker users"
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
              // dispatch(push('../../../admin/challenges'));
            }}
            title="Publish Successful"
            message="The challenge has been published!"
            actionRequire={false}
          />
        </InfoSection>
      </Row>
    ) : (
      <Row justify="center" style={{ flex: 1 }}>
        <LoadingSpinner size="large" />
      </Row>
    );
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent
        match={match}
        location={location}
        topTab={
          <Row align="bottom">
            <SelectionBar className="h3">
              <div
                className={selectedTab === 1 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 1 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  dispatch(
                    push({
                      pathname: `/challenges/${challengeId}`,
                      state: { tab: 'info' },
                    }),
                  );
                }}
              >
                Challenge Info
              </div>
              <div
                className={selectedTab === 2 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 2 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  dispatch(
                    push({
                      pathname: `/challenges/${challengeId}`,
                      state: { tab: 'trail' },
                    }),
                  );
                }}
              >
                Trails
              </div>
              <div
                className={selectedTab === 3 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 3 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  dispatch(
                    push({
                      pathname: `/challenges/${challengeId}`,
                      state: { tab: 'attempt' },
                    }),
                  );
                }}
              >
                User Attempts
              </div>
            </SelectionBar>
            {selectedTab === 2 ? (
              <PrimaryButtonComponent
                style={{
                  padding: '0px 20px',
                  marginLeft: '30px',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Create Trail"
                onClick={() =>
                  dispatch(push(`../../challenges/${challengeId}/trail/create`))
                }
                iconRight={false}
              />
            ) : null}
          </Row>
        }
      >
        <ContentWrapper flex={1} wrap={false}>
          {selectedTab === 1 ? (
            <ChallengeInfo />
          ) : selectedTab === 2 ? (
            <TrailDetailComponent
              dispatch={dispatch}
              challengeId={challengeId}
            />
          ) : (
            <AttemptListComponent challengeId={challengeId} type="challenge" />
          )}
        </ContentWrapper>
      </NavigationWrapperComponent>
    </div>
  );
}

ChallengeDetailPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  challengeDetailPage: makeSelectChallengeDetailPage(),
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
)(ChallengeDetailPage);

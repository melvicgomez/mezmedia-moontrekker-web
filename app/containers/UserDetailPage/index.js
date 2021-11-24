/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * UserDetailPage
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
import { push, replace } from 'connected-react-router';
import { Row, Spin, Table, Col } from 'antd';
import moment from 'moment';
import { Images } from 'images/index';
import { Colors } from 'theme/colors';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import SendNotifUserComponent from 'components/SendNotifUserComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';
import ProgressEditFormComponent from 'components/User/ProgressEditFormComponent';
import AttemptEditFormComponent from 'components/User/AttemptEditFormComponent';
import MtPointLogComponent from 'components/User/MtPointLogComponent';
import AddPointComponent from 'components/User/AddPointComponent';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectUserDetailPage from './selectors';
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

const List = styled(Table)`
  .ant-table {
    font-size: 13px !important;
  }

  table,
  tr,
  tbody,
  td,
  thead,
  th,
  .ant-table-container {
    color: ${Colors.white} !important;
    background-color: ${Colors.background} !important;
    border-color: transparent !important;
  }

  tr:not(:nth-child(1)) {
    > td {
      border-top: 2px solid ${Colors.bodyText} !important;
    }
  }

  thead,
  th {
    border-bottom: 2px solid ${Colors.bodyText} !important;
    font-weight: bold !important;
    font-family: Montserrat-Bold !important;
  }

  .ant-table-row-expand-icon {
    background-color: transparent !important;
  }

  .ant-pagination-item-link,
  .ant-table-pagination.ant-pagination {
    color: ${Colors.white};
    margin-bottom: 30px;

    input {
      background-color: ${Colors.background} !important;
    }
  }

  .ant-table-row-expand-icon-cell {
    padding-right: 0px !important;
  }

  .ant-table-sticky-header {
    top: 148px !important;
  }

  .ant-empty-description {
    color: ${Colors.white};
  }

  .ant-table-cell-scrollbar {
    box-shadow: none;
  }

  .ant-table-expanded-row {
    td,
    th {
      color: #8dbbe0 !important;
    }

    .action {
      color: ${Colors.green} !important;
      cursor: pointer;
    }
  }
`;

const MoontrekkerPoint = styled(Row)`
  background-color: ${Colors.white};
  padding: 3px 10px 3px 15px;
  border-radius: 8px;

  > img {
    height: 17px;
    width: 17px;
    object-fit: contain;
    margin-left: 5px;
  }
`;

const TeamTypeCard = styled(Row)`
  background-color: ${Colors.bodyText};
  position: relative;
  box-shadow: 0px 2px 2px 0px #00000025;
  margin-top: 25px;

  > div:first-child {
    padding: 10px 0px 10px 15px;
  }

  .white-bg {
    height: -webkit-fill-available;
    height: -moz-available; /* WebKit-based browsers will ignore this. */
    height: fill-available;
    object-fit: stretch;
    position: absolute;
    width: 110px;
  }

  .corporate {
    height: 45px;
    width: 75px;
    margin-right: 10px;
    object-fit: contain;
    z-index: 2;
  }
`;

const BadgeCard = styled.div`
  background-color: ${Colors.bodyText};
  position: relative;
  box-shadow: 0px 2px 2px 0px #00000025;
  margin-top: 25px;
  padding: 15px;
  border-radius: 8px;
`;

const TeamMemberCard = styled.div`
  background-color: ${Colors.bodyText};
  position: relative;
  box-shadow: 0px 2px 2px 0px #00000025;
  margin-top: 25px;
  padding: 15px;
  border-radius: 8px;
`;

const InfoButton = styled.div`
  border-radius: 50px;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${Colors.primary};
`;

const ProgressBar = styled.div`
  height: 10px;
  flex: 1;
  margin: 0px 10px 0px 5px;
  background-color: ${Colors.disabled};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0px 2px 2px 0px #00000025;
`;

const Progress = styled.div`
  height: 100%;
  background-color: ${Colors.primary};
  width: ${props => props.width};
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const SelectionBar = styled(Row)`
  margin-left: 40px;

  > div {
    margin-right: 50px;
    cursor: pointer;
    height: fit-content;
  }
`;

// TODO: direct notification, gps range

export function UserDetailPage({ match, location, dispatch }) {
  useInjectReducer({ key: 'UserDetailPage', reducer });
  useInjectSaga({ key: 'UserDetailPage', saga });

  const userId = match.params.id;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      key: 'id',
    },
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: text => (
        <div className={text === 'Incomplete' ? 'error-text' : 'white-text'}>
          {text}
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 90,
      key: 'startDate',
    },
    {
      title: 'End Date',
      width: 90,
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'MT Point',
      dataIndex: 'mtPoint',
      align: 'center',
      key: 'mtPoint',
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      align: 'center',
      key: 'distance',
    },
    {
      title: 'GPS',
      dataIndex: 'gps',
      align: 'center',
      key: 'gps',
    },
    {
      title: 'Image',
      dataIndex: 'hasImage',
      align: 'center',
      key: 'hasImage',
      render: text => (
        <div className={text ? 'error-text' : 'white-text'}>
          {text ? 'Yes' : 'No'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 65,
      align: 'center',
      render: (_, record) => (
        <div
          onClick={() => {
            const { data } = attempts.find(
              a => a.data.attempt_id === record.id,
            );
            setSelectedAttempt(data);
          }}
          style={{ color: Colors.primary, cursor: 'pointer' }}
        >
          Edit
        </div>
      ),
    },
  ];

  const [userData, setUserData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [suspendAcctLoading, setSuspendAcctLoading] = useState(false);
  const [confimSuspendAcct, setConfimSuspendAcct] = useState(false);

  const [attempts, setAttempts] = useState([]);

  const [selectedTab, setSelectedTab] = useState(1);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 100,
    showSizeChanger: false,
    simple: true,
  });

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(false);

  const [updateProgressModalVisible, setUpdateProgressModalVisible] = useState(
    false,
  );
  const [selectedProgress, setSelectedProgress] = useState(false);

  const [addPointModalVisible, setAddPointModalVisible] = useState(false);
  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    axiosInstance.get(`api/users/${userId}`).then(res => {
      if (!unmounted.current) {
        setUserData(res.data);
        setIsLoading(false);
      }
    });

    getAttempt(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    let tab = '';

    if (location && location.state) {
      tab =
        location.state.tab === 'notification'
          ? 3
          : location.state.tab === 'history'
          ? 2
          : 1;
    } else {
      tab = 1;
    }

    setSelectedTab(tab);
  }, [location, match]);

  useEffect(() => {
    if (selectedAttempt) {
      setUpdateModalVisible(true);
    }
  }, [selectedAttempt]);

  useEffect(() => {
    if (selectedProgress) {
      setUpdateProgressModalVisible(true);
    }
  }, [selectedProgress]);

  const getAttempt = page => {
    axiosInstance
      .get(`api/user-attempt/${userId}?page=${page}&per_page=100`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.attempt_id,
            id: d.attempt_id,
            name: d.challenge.title,
            status: d.status[0].toUpperCase() + d.status.substring(1),
            time: d.total_time
              ? moment.utc(d.total_time * 1000).format('HH:mm:ss')
              : '-',
            mtPoint: d.moontrekker_point,
            distance: d.total_distance,
            startDate: d.started_at
              ? moment
                  .utc(d.started_at)
                  .local()
                  .format('DD/MM/YY HH:mm:ss')
              : '-',
            endDate: d.ended_at
              ? moment
                  .utc(d.ended_at)
                  .local()
                  .format('DD/MM/YY HH:mm:ss')
              : '-',
            gps: 'OK', // to be replaced
            hasImage: !!d.progress.filter(p => !!p.submitted_image).length,
            data: d,
          }));
          setAttempts(newList);

          setCustomPagination({
            ...customPagination,
            current: page,
            total: res.data.total,
          });
        }
      });
  };

  const handleTableChange = pagination => {
    window.scrollTo(0, 0);
    getAttempt(pagination.current);
  };

  const UserProfile = () => {
    const badgeRankNames = [
      'None',
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
    ];

    const getBadge = point => {
      const badgeProgress = [0, 30, 60, 90, 120, 150];

      let rankIndex = 0;
      badgeProgress.forEach((progress, i) => {
        if ((point || 0) > progress) {
          rankIndex = i;
        }
      });

      return {
        rankIndex,
        point:
          badgeProgress[
            rankIndex === badgeProgress.length - 1 ? rankIndex : rankIndex + 1
          ],
      };
    };

    const getMPProgress = point => ((point || 0) / getBadge(point).point) * 100;

    return (
      <div>
        <Row wrap={false} justify="space-between" style={{ marginBottom: 20 }}>
          <div className="h3 cyan-text">
            {userData.first_name} {userData.last_name}
          </div>
          <MoontrekkerPoint align="middle" className="bodyBold cyan-text">
            {userData.mp_total || 0}
            <img src={Images.pointIcon} alt="point" />
          </MoontrekkerPoint>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Email</Col>
          <Col flex="auto">{userData.email}</Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Team Type</Col>
          <Col flex="auto">
            {userData.team_id
              ? userData.team.team_type[0].toUpperCase() +
                userData.team.team_type.substring(1)
              : 'Solo'}
          </Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Team Name</Col>
          <Col flex="auto">
            {userData.team_id ? userData.team.team_name : '-'}
          </Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Corpoarte Team</Col>
          <Col flex="auto">
            {userData.team_id && userData.team.corporate_id
              ? userData.team.corporate.business_name
              : '-'}
          </Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">App Reg. Date</Col>
          <Col flex="auto">
            {userData.register_date
              ? moment
                  .utc(userData.register_date)
                  .local()
                  .format('DD/MM/YY')
              : '-'}
          </Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">MT Points</Col>
          <Col flex="auto">{userData.mp_total || 0}</Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Races Completed</Col>
          <Col flex="auto">{userData.race_attempt_count}</Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Personal B. Race Time</Col>
          <Col flex="auto">
            {userData.race_best_time_attempts
              ? moment
                  .utc(userData.race_best_time_attempts.total_time * 1000)
                  .format('HH:mm:ss')
              : '-'}
          </Col>
        </Row>
        <Row
          className="bodyBold white-text"
          wrap={false}
          style={{ marginBottom: 10 }}
        >
          <Col flex="170px">Challenges Completed</Col>
          <Col flex="auto">{userData.challenge_attempts_count}</Col>
        </Row>
        <TeamTypeCard wrap={false}>
          <Col flex="auto">
            <div className="bodyBold white-text">
              {userData.first_name} {userData.last_name}
            </div>
            <div className="bodyBold white-text">
              {userData.team_id
                ? userData.team.team_type === 'duo'
                  ? 'Duo '
                  : userData.team.team_type === 'team'
                  ? 'Team '
                  : 'Corporate Team '
                : 'Solo'}{' '}
              Participant
            </div>
          </Col>
          {userData.team_id && userData.team.corporate_id ? (
            <Col flex="110px">
              <img src={Images.corporateBG} className="white-bg" alt="bg" />
              <Row
                flex={1}
                justify="end"
                align="middle"
                style={{ height: '100%' }}
              >
                <img
                  className="corporate"
                  src={`${process.env.IMAGE_URL_PREFIX}corporate/${
                    userData.team.corporate_id
                  }/${userData.team.corporate.logo_filename}`}
                  alt="corporate"
                />
              </Row>
            </Col>
          ) : null}
        </TeamTypeCard>
        <BadgeCard>
          <Row align="middle" className="bodyBold white-text">
            <InfoButton className="caption white-text">𝙞</InfoButton>
            Current Badge:{' '}
            {badgeRankNames[getBadge(userData.mp_total || 0).rankIndex]}
          </Row>
          <Row wrap={false} align="middle" style={{ marginTop: '5px' }}>
            {!!getBadge(userData.mp_total || 0).rankIndex && (
              <img
                style={{ height: 25, width: 25 }}
                src={
                  Images.badges[getBadge(userData.mp_total || 0).rankIndex - 1]
                }
                alt="badge"
              />
            )}
            <ProgressBar>
              <Progress
                width={`${
                  getMPProgress(userData.mp_total || 0) > 100
                    ? 100
                    : getMPProgress(userData.mp_total || 0)
                }%`}
              />
            </ProgressBar>
            <Row align="middle" wrap={false} className="white-text bodyBold">
              {`${userData.mp_total || 0}`.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ',',
              )}
              /
              {getBadge(userData.mp_total || 0)
                .point.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              <img
                src={Images.pointIcon}
                alt="point"
                style={{
                  height: '17px',
                  width: '17px',
                  objectFit: 'contain',
                  marginLeft: '5px',
                }}
              />
            </Row>
          </Row>
          <Row
            align="middle"
            justify="space-between"
            className="bodyBold white-text"
            style={{ marginTop: '15px' }}
          >
            <Row align="middle" className="bodyBold white-text">
              Personal Best Race Time
              <InfoButton
                className="caption white-text"
                style={{ marginLeft: '5px' }}
              >
                𝙞
              </InfoButton>
            </Row>
            {userData.race_best_time_attempts
              ? moment
                  .utc(userData.race_best_time_attempts.total_time * 1000)
                  .format('HH:mm:ss')
              : '-'}
          </Row>
        </BadgeCard>
        {userData.team_id ? (
          <TeamMemberCard>
            <div className="h3 cyan-text">
              {userData.team.team_name.toUpperCase()}
            </div>
            <Row
              align="middle"
              justify="space-between"
              className="bodyBold white-text"
              style={{ marginTop: '5px', marginBottom: '15px' }}
            >
              <Row align="middle" className="bodyBold white-text">
                Best Team Average Time
                <InfoButton
                  className="caption white-text"
                  style={{ marginLeft: '5px' }}
                >
                  𝙞
                </InfoButton>
              </Row>
              {userData.team.team_race_best_time > 0
                ? moment
                    .utc(userData.team.team_race_best_time * 1000)
                    .format('HH:mm:ss')
                : '-'}
            </Row>
            {userData.team.participants.map((p, i) => (
              <Row
                key={i}
                wrap={false}
                justify="space-between"
                style={{ marginBottom: '10px' }}
              >
                <div className="bodyBold white-text">
                  {p.first_name} {p.last_name}
                </div>
                <div className="bodyBold white-text">
                  {p.total_time > 0
                    ? moment.utc(p.total_time * 1000).format('HH:mm:ss')
                    : '-'}
                </div>
              </Row>
            ))}
          </TeamMemberCard>
        ) : null}
      </div>
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
                  window.scrollTo(0, 0);
                  dispatch(
                    push({
                      pathname: `/users/${userId}`,
                      state: { tab: 'info' },
                    }),
                  );
                }}
              >
                Info
              </div>
              <div
                className={selectedTab === 2 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 2 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  window.scrollTo(0, 0);
                  dispatch(
                    push({
                      pathname: `/users/${userId}`,
                      state: { tab: 'history' },
                    }),
                  );
                }}
              >
                Point History
              </div>
              <div
                className={selectedTab === 3 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 3 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  window.scrollTo(0, 0);
                  dispatch(
                    push({
                      pathname: `/users/${userId}`,
                      state: { tab: 'notification' },
                    }),
                  );
                }}
              >
                Send Notification
              </div>
            </SelectionBar>
          </Row>
        }
      >
        {!isLoading ? (
          <ContentWrapper wrap={false}>
            {selectedTab === 1 ? (
              <>
                <div
                  style={{
                    minWidth: '360px',
                    width: '360px',
                    padding: '30px 20px 30px 0px',
                  }}
                >
                  <UserProfile />
                  <div style={{ padding: '0px 20px' }}>
                    <Row justify="space-between" style={{ marginTop: '20px' }}>
                      <PrimaryButtonComponent
                        onClick={() => {
                          dispatch(push(`../../users/${userId}/edit`));
                        }}
                        label="Edit Info"
                        iconRight={false}
                        style={{ width: '100%' }}
                      />
                    </Row>
                    <Row justify="center" style={{ marginTop: '20px' }}>
                      <PrimaryButtonComponent
                        onClick={() => {
                          setAddPointModalVisible(true);
                        }}
                        label="Add MoonTrekker Point"
                        iconRight={false}
                        style={{ width: '100%' }}
                      />
                      {addPointModalVisible ? (
                        <AddPointComponent
                          userId={userId}
                          visibility={addPointModalVisible}
                          onCancel={() => {
                            setAddPointModalVisible(false);
                          }}
                        />
                      ) : null}
                    </Row>
                    <Row justify="space-between" style={{ marginTop: '20px' }}>
                      <PrimaryButtonComponent
                        disabled={
                          userData ? userData.privilege === 'suspended' : false
                        }
                        onClick={() => {
                          setConfimSuspendAcct(true);
                        }}
                        label={
                          userData
                            ? userData.privilege === 'suspended'
                              ? 'Suspended'
                              : 'Suspend Account'
                            : false
                        }
                        iconRight={false}
                        style={{ width: '100%' }}
                      />
                    </Row>
                  </div>

                  <ConfirmationPopupComponent
                    actionRequire
                    visibility={confimSuspendAcct}
                    dismissModal={() => {
                      setConfimSuspendAcct(false);
                    }}
                    title="Suspend Account"
                    message="Do you wish to suspend this user account?"
                    leftAction={() => {
                      if (!suspendAcctLoading) {
                        setSuspendAcctLoading(true);
                        axiosInstance
                          .delete(`api/users/${userId}`)
                          .finally(() => {
                            setConfimSuspendAcct(false);
                            dispatch(replace('../../../users'));
                            setSuspendAcctLoading(false);
                          });
                      }
                    }}
                    rightAction={() => {
                      setConfimSuspendAcct(false);
                    }}
                  />
                </div>
                <div style={{ paddingTop: '40px' }}>
                  <List
                    size="middle"
                    className="body white-text"
                    columns={columns}
                    dataSource={attempts}
                    onChange={handleTableChange}
                    pagination={customPagination}
                    bordered={false}
                    expandable={{
                      columnWidth: 20,
                      rowExpandable: record => record.data.progress.length > 0,
                      expandedRowRender: record => (
                        <div style={{ padding: '10px' }}>
                          {record.data.progress.length > 0 && (
                            <table>
                              <thead>
                                <tr>
                                  <th colSpan={2}>CHECKPOINT TIMINGS</th>
                                  <th>START TIME</th>
                                  <th>END TIME</th>
                                  <th colSpan={2}>GPS (LONG | LAT)</th>
                                  <th colSpan={2}>CORRECT GPS</th>
                                  <th>SUBMITTED IMAGE</th>
                                  <th>ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.data.progress.map((p, i) => (
                                  <tr key={i}>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.description}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.distance}km
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.started_at
                                        ? moment
                                            .utc(p.started_at)
                                            .local()
                                            .format('HH:mm:ss')
                                        : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.ended_at
                                        ? moment
                                            .utc(p.ended_at)
                                            .local()
                                            .format('HH:mm:ss')
                                        : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.longitude
                                        ? p.longitude.toFixed(4)
                                        : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.latitude ? p.latitude.toFixed(4) : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {record.data.challenge.trails.find(
                                        t => t.trail_index === p.end_trail_id,
                                      ) &&
                                      record.data.challenge.trails.find(
                                        t => t.trail_index === p.end_trail_id,
                                      ).longitude
                                        ? JSON.parse(
                                            record.data.challenge.trails.find(
                                              t =>
                                                t.trail_index ===
                                                p.end_trail_id,
                                            ).longitude,
                                          )
                                        : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {record.data.challenge.trails.find(
                                        t => t.trail_index === p.end_trail_id,
                                      ) &&
                                      record.data.challenge.trails.find(
                                        t => t.trail_index === p.end_trail_id,
                                      ).latitude
                                        ? JSON.parse(
                                            record.data.challenge.trails.find(
                                              t =>
                                                t.trail_index ===
                                                p.end_trail_id,
                                            ).latitude,
                                          )
                                        : '-'}
                                    </td>
                                    <td style={{ paddingTop: '5px' }}>
                                      {p.submitted_image ? (
                                        <img
                                          src={`${
                                            process.env.IMAGE_URL_PREFIX
                                          }attempt/${p.progress_id}/${
                                            p.submitted_image
                                          }`}
                                          alt="submitted_image"
                                          style={{
                                            height: '120px',
                                            width: '120px',
                                            objectFit: 'contain',
                                          }}
                                        />
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                    <td
                                      className="action"
                                      style={{ paddingTop: '5px' }}
                                      onClick={() => {
                                        setSelectedProgress(p);
                                      }}
                                    >
                                      Edit
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ),
                    }}
                  />
                  {updateModalVisible ? (
                    <AttemptEditFormComponent
                      selectedAttempt={selectedAttempt}
                      updateAttemptList={() => getAttempt(1)}
                      visibility={updateModalVisible}
                      dismissModal={() => {
                        setUpdateModalVisible(false);
                        setSelectedAttempt(null);
                      }}
                    />
                  ) : null}
                  {updateProgressModalVisible ? (
                    <ProgressEditFormComponent
                      selectedProgress={selectedProgress}
                      updateProgress={() => getAttempt(1)}
                      visibility={updateProgressModalVisible}
                      dismissModal={() => {
                        setUpdateProgressModalVisible(false);
                        setSelectedProgress(null);
                      }}
                    />
                  ) : null}
                </div>
              </>
            ) : selectedTab === 2 ? (
              <MtPointLogComponent userId={userId} />
            ) : (
              <SendNotifUserComponent userId={userId} />
            )}
          </ContentWrapper>
        ) : (
          <Row justify="center">
            <LoadingSpinner size="large" />
          </Row>
        )}
      </NavigationWrapperComponent>
    </div>
  );
}

UserDetailPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  UserDetailPage: makeSelectUserDetailPage(),
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
)(UserDetailPage);

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * TeamListPage
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { push } from 'connected-react-router';
import { Row, Table, Input } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Colors } from 'theme/colors';
import axiosInstance from 'services';
import { Images } from 'images/index';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';
import CorporateListComponent from 'components/CorporateListComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectTeamListPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const List = styled(Table)`
  table,
  tr,
  tbody,
  td,
  thead,
  th {
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

  .ant-pagination-item-link,
  .ant-table-pagination.ant-pagination {
    color: ${Colors.white};
    margin-bottom: 30px;

    input {
      background-color: ${Colors.background} !important;
    }
  }

  .ant-table-sticky-header {
    top: 148px !important;
  }

  .ant-empty-description {
    color: ${Colors.white};
  }

  .ant-typography.ant-typography-disabled {
    color: ${Colors.grey} !important;
  }

  .ant-table-row-expand-icon {
    background-color: transparent !important;
  }

  .ant-table-expanded-row {
    td,
    th {
      color: #8dbbe0 !important;
    }

    .action {
      color: ${Colors.warning} !important;
      cursor: pointer;
    }
  }
`;

const SearchBar = styled(Row)`
  position: relative;

  input {
    background-color: transparent !important;
    border: none;
    color: ${Colors.white};
  }

  .ant-input-group-addon {
    background-color: transparent !important;
    border: none;
  }
`;

const SelectionBar = styled(Row)`
  margin-left: 40px;

  > div {
    margin-right: 50px;
    cursor: pointer;
  }
`;

export function TeamListPage({ match, location, dispatch }) {
  useInjectReducer({ key: 'teamListPage', reducer });
  useInjectSaga({ key: 'teamListPage', saga });

  const teamColumns = [
    {
      title: 'ID',
      dataIndex: 'teamId',
      align: 'center',
      width: 90,
      key: 'teamId',
    },
    {
      title: 'Team Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Corporate',
      dataIndex: 'corporate',
      key: 'corporate',
    },
    {
      title: '#Members',
      dataIndex: 'totalMember',
      key: 'totalMember',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
      render: (_, record) => (
        <Row>
          <div
            onClick={() => {
              dispatch(push(`../../teams/${record.teamId}/edit`));
            }}
            style={{ color: Colors.primary, cursor: 'pointer' }}
          >
            Edit
          </div>
          <div
            onClick={() => {
              setDeleteModalVisible(true);
              setSelectedTeam(record.teamId);
            }}
            style={{ color: Colors.primary, cursor: 'pointer', marginLeft: 15 }}
          >
            Delete
          </div>
        </Row>
      ),
    },
  ];

  const [teamList, setTeamList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 200,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteMemberModalVisible, setDeleteMemberModalVisible] = useState(
    false,
  );
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const [selectedTab, setSelectedTab] = useState(1);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    let tab = '';

    if (location && location.state) {
      tab = location.state.tab === 'corporate' ? 2 : 1;
    } else {
      tab = 1;
    }

    setSelectedTab(tab);
  }, [location, match]);

  const getList = (page, search = '') => {
    axiosInstance.get(`api/team?page=${page}&search=${search}`).then(res => {
      if (!unmounted.current) {
        const details = res.data.data;
        const newList = details.map(d => ({
          key: d.team_id,
          teamId: d.team_id,
          name: d.team_name,
          type: d.team_type[0].toUpperCase() + d.team_type.substring(1),
          corporate: d.corporate_id ? d.corporate.business_name : '-',
          totalMember: d.participants.length,
          data: d,
        }));
        setTeamList(newList);

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
    getList(pagination.current, keyword.trim());
  };

  // const updateTeamList = (action, data = null) => {
  //   if (action === 'update' && data) {
  //     const newData = {
  //       corporateId: data.corporate_id,
  //       corporateName: data.business_name,
  //       logo: data.logo_filename,
  //     };
  //     const newList = [...teamList];
  //     const index = newList.findIndex(item => item.key === data.corporate_id);
  //     const item = newList[index];
  //     newList.splice(index, 1, {
  //       ...item,
  //       ...newData,
  //     });
  //     setTeamList(newList);
  //   } else {
  //     getList(1, '');
  //   }
  // };

  const deleteTeam = () => {
    axiosInstance.delete(`api/team/${selectedTeam}`).then(() => {
      setDeleteModalVisible(false);
      getList(customPagination.current, keyword);
    });
  };

  const removeMember = () => {
    axiosInstance
      .post(`api/user-team`, {
        team_id: selectedTeam.team_id,
        user_id: selectedMember.user_id,
        status: 'leave',
      })
      .then(() => {
        setDeleteMemberModalVisible(false);
        getList(customPagination.current, keyword);
      });
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent
        match={match}
        topTab={
          <Row
            style={{
              width: '100%',
              paddingRight: '50px',
              marginTop: '10px',
              height: '40px',
            }}
            align="bottom"
            justify="space-between"
          >
            <Row align="middle">
              <SelectionBar className="h3">
                <div
                  className={selectedTab === 1 ? 'cyan-text' : 'white-text'}
                  onClick={() => {
                    dispatch(
                      push({
                        pathname: `/teams`,
                        state: { tab: 'team' },
                      }),
                    );
                  }}
                >
                  Team
                </div>
                <div
                  className={selectedTab === 2 ? 'cyan-text' : 'white-text'}
                  onClick={() => {
                    dispatch(
                      push({
                        pathname: `/teams`,
                        state: { tab: 'corporate' },
                      }),
                    );
                  }}
                >
                  Corporate
                </div>
              </SelectionBar>
            </Row>
          </Row>
        }
      >
        {selectedTab === 1 ? (
          <div style={{ padding: '10px 20px 20px 10px' }}>
            <Row
              justify="space-between"
              style={{ flex: 1, marginBottom: '10px' }}
            >
              <SearchBar align="middle" justify="space-between">
                <div>
                  <Input
                    className="bodyBold white-text"
                    placeholder="Search Team"
                    style={{ width: '250px' }}
                    value={keyword}
                    addonBefore={
                      <Icon
                        onClick={() => {
                          getList(1, keyword);
                        }}
                        component={() => (
                          <img
                            src={Images.searchIcon}
                            style={{ height: '24px', width: '24px' }}
                            alt="search"
                          />
                        )}
                      />
                    }
                    onPressEnter={() => {
                      getList(1, keyword);
                    }}
                    onChange={e => {
                      setKeyword(e.target.value);
                    }}
                  />
                  {!!keyword && (
                    <CloseOutlined
                      style={{
                        fontSize: '20px',
                        marginLeft: '5px',
                        color: Colors.white,
                      }}
                      onClick={() => {
                        setKeyword('');
                        getList(1, '');
                      }}
                    />
                  )}
                </div>
              </SearchBar>
              <PrimaryButtonComponent
                style={{
                  padding: '0px 20px',
                  marginiRght: '10px',
                  marginTop: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Create Team"
                onClick={() => {
                  dispatch(push('/team/create'));
                }}
                iconRight={false}
              />
            </Row>

            <List
              size="middle"
              className="body white-text"
              columns={teamColumns}
              dataSource={teamList}
              sticky
              onChange={handleTableChange}
              pagination={customPagination}
              bordered={false}
              expandable={{
                columnWidth: 30,
                rowExpandable: record => record.data.participants.length > 0,
                expandedRowRender: record => (
                  <div style={{ padding: '10px 20px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>USER ID</th>
                          <th>NAME</th>
                          <th>EMAIL</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.data.participants.map((p, i) => (
                          <tr key={i}>
                            <td style={{ padding: '10px 0px' }}>{p.user_id}</td>
                            <td style={{ padding: '10px 0px' }}>
                              {p.first_name} {p.last_name}
                            </td>
                            <td style={{ padding: '10px 0px' }}>{p.email}</td>
                            <td
                              className="action"
                              style={{
                                padding: '10px 0px',
                              }}
                              onClick={() => {
                                setSelectedMember(p);
                                setSelectedTeam(record.data);
                                setDeleteMemberModalVisible(true);
                              }}
                            >
                              Remove
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              }}
            />
            <ConfirmationPopupComponent
              visibility={deleteModalVisible || deleteMemberModalVisible}
              dismissModal={() => {
                setDeleteModalVisible(false);
                setDeleteMemberModalVisible(false);
                setSelectedTeam(null);
                setSelectedMember(null);
              }}
              title={deleteModalVisible ? 'Delete Team' : 'Remove Member'}
              message={`This action cannot be undone. Do you wish to ${
                deleteModalVisible
                  ? 'delete this team'
                  : 'remove this member from team'
              }?`}
              leftAction={deleteModalVisible ? deleteTeam : removeMember}
              rightAction={() => {
                setDeleteModalVisible(false);
                setDeleteMemberModalVisible(false);
                setSelectedTeam(null);
                setSelectedMember(null);
              }}
            />
          </div>
        ) : (
          <CorporateListComponent />
        )}
      </NavigationWrapperComponent>
    </div>
  );
}

TeamListPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  teamListPage: makeSelectTeamListPage(),
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
)(TeamListPage);

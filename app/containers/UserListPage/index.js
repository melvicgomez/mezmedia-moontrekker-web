/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 *
 * UserListPage
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axiosInstance from 'services';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { Row, Table, Input } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Colors } from 'theme/colors';
import moment from 'moment';
import { Images } from 'images/index';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectUserListPage from './selectors';
import reducer from './reducer';
import saga from './saga';

/**
 * TODO: replace gps flag
 */

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

  tr:not(:nth-child(1)):not(:nth-child(2)) {
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
`;

const SearchBar = styled(Row)`
  position: relative;
  margin-right: 40px;

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

const FilterBar = styled(Row)`
  margin-left: 40px;

  > div {
    margin-right: 50px;
    cursor: pointer;
  }
`;

export function UserListPage({ match, dispatch }) {
  useInjectReducer({ key: 'userListPage', reducer });
  useInjectSaga({ key: 'userListPage', saga });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'userId',
      align: 'center',
      width: 90,
      key: 'userId',
      render: text => (
        <a className="white-text" href={`/users/${text}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 130,
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: text => (
        <div
          className={
            text === 'pending'
              ? 'orange-text'
              : text === 'suspended'
              ? 'error-text'
              : 'white-text'
          }
        >
          {text[0].toUpperCase() + text.substring(1)}
        </div>
      ),
    },
    {
      title: 'Team Type',
      dataIndex: 'teamType',
      key: 'teamType',
    },
    {
      title: 'Team Name',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: 'App Reg. Date',
      dataIndex: 'dateJoined',
      align: 'center',
      key: 'dateJoined',
    },
    {
      title: 'MT Points',
      dataIndex: 'mpTotal',
      align: 'center',
      key: 'mpTotal',
    },
    {
      title: 'Races Completed',
      dataIndex: 'raceCompleted',
      align: 'center',
      key: 'raceCompleted',
    },
    {
      title: 'Personal B. Race Time',
      dataIndex: 'raceBestTime',
      align: 'center',
      key: 'raceBestTime',
    },
    {
      title: 'Challenges Completed',
      dataIndex: 'challengeCompleted',
      align: 'center',
      key: 'challengeCompleted',
    },
    {
      title: 'GPS Flags',
      dataIndex: 'gpsFlag',
      width: 70,
      align: 'center',
      key: 'gpsFlag',
      render: text => (
        <div className={text > 0 ? 'error-text' : 'white-text'}>{text}</div>
      ),
    },
  ];

  const [userList, setUserList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 200,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(1);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getList = (page, search = '', filter = 1) => {
    axiosInstance
      .get(
        `api/users?page=${page}&search=${search}&show_status=${
          filter === 1
            ? 'all'
            : filter === 2
            ? 'solo'
            : filter === 3
            ? 'duo'
            : filter === 4
            ? 'team'
            : 'corporate'
        }`,
      )
      .then(res => {
        if (!unmounted.current) {
          setSelectedFilter(filter);
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.user_id,
            userId: d.user_id,
            name: `${d.first_name} ${d.last_name}`,
            email: d.email,
            status: d.privilege,
            teamType: d.team_id
              ? d.team.team_type[0].toUpperCase() +
                d.team.team_type.substring(1)
              : 'Solo',
            teamName: d.team_id ? d.team.team_name : '-',
            mpTotal: d.mp_total || 0,
            raceCompleted: d.challenge_attempts_count,
            challengeCompleted: d.race_attempt_count,
            raceBestTime: d.race_best_time_attempts
              ? moment
                  .utc(d.race_best_time_attempts.total_time * 1000)
                  .format('HH:mm:ss')
              : '-',
            dateJoined: d.register_date
              ? moment
                  .utc(d.register_date)
                  .local()
                  .format('DD/MM/YY')
              : '-',
            gpsFlag: 0, // to be replaced
          }));
          setUserList(newList);

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
    getList(pagination.current, keyword.trim(), selectedFilter);
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
            wrap={false}
            style={{
              flex: 1,
              height: '60px',
              marginTop: '10px',
              paddingRight: '30px',
            }}
            align="middle"
            justify="space-between"
          >
            <Row align="middle">
              <SearchBar align="middle" justify="space-between">
                <div>
                  <Input
                    className="bodyBold white-text"
                    placeholder="Search"
                    style={{ width: '150px' }}
                    value={keyword}
                    addonBefore={
                      <Icon
                        onClick={() => {
                          getList(1, keyword, selectedFilter);
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
                      getList(1, keyword, selectedFilter);
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
                        getList(1, '', selectedFilter);
                      }}
                    />
                  )}
                </div>
              </SearchBar>
              <FilterBar className="h3">
                <div
                  className={selectedFilter === 1 ? 'cyan-text' : 'white-text'}
                  onClick={() => getList(1, keyword, 1)}
                >
                  All
                </div>
                <div
                  className={selectedFilter === 2 ? 'cyan-text' : 'white-text'}
                  onClick={() => getList(1, keyword, 2)}
                >
                  Solo
                </div>
                <div
                  className={selectedFilter === 3 ? 'cyan-text' : 'white-text'}
                  onClick={() => getList(1, keyword, 3)}
                >
                  Duo
                </div>
                <div
                  className={selectedFilter === 4 ? 'cyan-text' : 'white-text'}
                  onClick={() => getList(1, keyword, 4)}
                >
                  Team
                </div>
                <div
                  className={selectedFilter === 5 ? 'cyan-text' : 'white-text'}
                  onClick={() => getList(1, keyword, 5)}
                >
                  Corporate
                </div>
              </FilterBar>
            </Row>
            <PrimaryButtonComponent
              style={{
                padding: '0px 20px',
                marginiRght: '10px',
                marginTop: '5px',
                display: 'flex',
                justifyContent: 'center',
              }}
              label="Create User"
              onClick={() => {
                dispatch(push('/user/create'));
              }}
              iconRight={false}
            />
          </Row>
        }
      >
        <div style={{ paddingRight: '20px' }}>
          <List
            size="small"
            className="body white-text"
            columns={columns}
            dataSource={userList}
            sticky
            onChange={handleTableChange}
            pagination={customPagination}
            bordered={false}
            // onRow={r => ({
            //   onClick: () => dispatch(push(`users/${r.userId}`)),
            // })}
          />
        </div>
      </NavigationWrapperComponent>
    </div>
  );
}

UserListPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userListPage: makeSelectUserListPage(),
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
)(UserListPage);

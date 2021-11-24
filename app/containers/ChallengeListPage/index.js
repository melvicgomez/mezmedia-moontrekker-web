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
import styled from 'styled-components';
import { Row, Table, Input } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { createStructuredSelector } from 'reselect';
import { push } from 'connected-react-router';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Colors } from 'theme/colors';
import moment from 'moment';
import { Images } from 'images/index';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectChallengeListPage from './selectors';
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

export function ChallengeListPage({ match, dispatch }) {
  useInjectReducer({ key: 'challengeListPage', reducer });
  useInjectSaga({ key: 'challengeListPage', saga });

  const challengeType = {
    race: 'Race',
    training: 'Training',
    challenge_standard: 'Standard Challenge',
    challenge_either_end: 'Either End Challenge',
    challenge_single: 'Single Challenge',
    challenge_training: 'Training Challenge',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'challengeId',
      align: 'center',
      width: 90,
      key: 'challengeId',
      render: text => (
        <a className="white-text" href={`/challenges/${text}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'Publish Date',
      dataIndex: 'postedDate',
      key: 'postedDate',
      width: 110,
      render: text => (
        <div
          className={
            text.startsWith('Scheduled at')
              ? 'orange-text'
              : text === 'Unpublished'
              ? 'error-text'
              : 'green-text'
          }
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 150,
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 220,
      key: 'description',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      align: 'center',
      key: 'difficulty',
    },
    {
      title: '#Trails',
      dataIndex: 'totalTrail',
      align: 'center',
      key: 'totalTrail',
    },
    {
      title: 'MT Point',
      dataIndex: 'mtPoint',
      align: 'center',
      key: 'mtPoint',
    },
    {
      title: '#Reward',
      dataIndex: 'reward',
      align: 'center',
      key: 'reward',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
  ];

  const [challengeList, setChallengeList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 200,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getList = (page, search = '') => {
    axiosInstance
      .get(
        `api/challenge?order_by=challenge_id&type=admin&show_status=challenge&page=${page}&search=${search}`,
      )
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.challenge_id,
            challengeId: d.challenge_id,
            postedDate: d.schedule_at
              ? `Scheduled at ${moment
                  .utc(d.schedule_at)
                  .local()
                  .format('DD/MM/yyyy HH:mm')}`
              : d.published_at
              ? moment
                  .utc(d.published_at)
                  .local()
                  .format('DD/MM/yyyy HH:mm')
              : 'Unpublished',
            title: d.title,
            description: d.description,
            type: challengeType[d.type],
            totalTrail: d.total_trails,
            difficulty: d.difficulty,
            mtPoint: d.moontrekker_point,
            reward: d.reward_count,
            startDate: d.started_at
              ? moment
                  .utc(d.started_at)
                  .local()
                  .format('DD/MM/yyyy HH:mm')
              : '-',
            endDate: d.ended_at
              ? moment
                  .utc(d.ended_at)
                  .local()
                  .format('DD/MM/yyyy HH:mm')
              : '-',
          }));
          setChallengeList(newList);

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
            style={{ flex: 1, height: '60px', marginTop: '10px' }}
            justify="space-between"
          >
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
                marginRight: '30px',
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'center',
              }}
              label="Create Challenge"
              onClick={() => dispatch(push(`../../challenge/create`))}
              iconRight={false}
            />
          </Row>
        }
      >
        <div style={{ paddingRight: '20px' }}>
          <List
            size="middle"
            className="body white-text"
            columns={columns}
            dataSource={challengeList}
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

ChallengeListPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userListPage: makeSelectChallengeListPage(),
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
)(ChallengeListPage);

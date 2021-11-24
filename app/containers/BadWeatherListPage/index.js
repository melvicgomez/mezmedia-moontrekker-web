/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * BadWeatherListPage
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
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Colors } from 'theme/colors';
import moment from 'moment';
import { Images } from 'images/index';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';
import BadWeatherFormComponent from 'components/BadWeatherFormComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectBadWeatherListPage from './selectors';
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

  .ant-table-row-expand-icon {
    background-color: transparent !important;
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

export function BadWeatherListPage({ match }) {
  useInjectReducer({ key: 'badWeatherListPage', reducer });
  useInjectSaga({ key: 'badWeatherListPage', saga });

  const columns = [
    {
      title: 'ID',
      width: 80,
      dataIndex: 'warningId',
      align: 'center',
      key: 'warningId',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 170,
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      width: 170,
      key: 'endDate',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
      key: 'title',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: text => <div className="white-text fix-line">{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
      render: (_, record) => (
        <Row>
          <div
            onClick={() => {
              const data = warningList.find(
                t => t.warningId === record.warningId,
              );
              setSelectedWarning(data.data);
            }}
            style={{ color: Colors.primary, cursor: 'pointer' }}
          >
            Edit
          </div>
          <div
            onClick={() => {
              setDeleteModalVisible(true);
              setSelectedDeleteWarning(record.warningId);
            }}
            style={{ color: Colors.primary, cursor: 'pointer', marginLeft: 15 }}
          >
            Delete
          </div>
        </Row>
      ),
    },
  ];

  const [warningList, setWarningList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 200,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [selectedDeleteWarning, setSelectedDeleteWarning] = useState(null);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (selectedWarning) {
      setUpdateModalVisible(true);
    }
  }, [selectedWarning]);

  const getList = (page, search = '') => {
    axiosInstance
      .get(`api/weather-warning?type=admin&page=${page}&search=${search}`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.warning_id,
            warningId: d.warning_id,
            title: d.title,
            message: d.message,
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
            data: d,
          }));
          setWarningList(newList);

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

  const deleteWarning = () => {
    axiosInstance
      .delete(`api/weather-warning/${selectedDeleteWarning}`)
      .then(() => {
        setDeleteModalVisible(false);
        getList(customPagination.current, keyword);
      });
  };

  const updateWarningList = (action, data = null) => {
    if (action === 'update' && data) {
      const newData = {
        warningId: data.warning_id,
        title: data.title,
        message: data.message,
        startDate: moment
          .utc(data.started_at)
          .local()
          .format('DD/MM/yyyy HH:mm'),
        endDate: moment
          .utc(data.ended_at)
          .local()
          .format('DD/MM/yyyy HH:mm'),
      };

      const newList = [...warningList];
      const index = newList.findIndex(item => item.key === data.warning_id);
      const item = newList[index];
      newList.splice(index, 1, {
        ...item,
        ...newData,
      });
      setWarningList(newList);
    } else {
      getList(1, '');
    }
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
              label="Create Warning"
              onClick={() => setCreateModalVisible(true)}
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
            dataSource={warningList}
            sticky
            onChange={handleTableChange}
            pagination={customPagination}
            bordered={false}
          />
          {updateModalVisible || createModalVisible ? (
            <BadWeatherFormComponent
              selectedWarning={selectedWarning}
              updateWarningList={updateWarningList}
              visibility={updateModalVisible || createModalVisible}
              dismissModal={() => {
                if (updateModalVisible) {
                  setUpdateModalVisible(false);
                  setSelectedWarning(null);
                }

                if (createModalVisible) {
                  setCreateModalVisible(false);
                }
              }}
              action={createModalVisible ? 'create' : 'update'}
            />
          ) : null}
          <ConfirmationPopupComponent
            visibility={deleteModalVisible}
            dismissModal={() => {
              setDeleteModalVisible(false);
              setSelectedDeleteWarning(null);
            }}
            title="Delete Corporate"
            message="This action cannot be undone. Do you wish to delete this warning?"
            leftAction={deleteWarning}
            rightAction={() => {
              setDeleteModalVisible(false);
              setSelectedDeleteWarning(null);
            }}
          />
        </div>
      </NavigationWrapperComponent>
    </div>
  );
}

BadWeatherListPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  badWeatherListPage: makeSelectBadWeatherListPage(),
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
)(BadWeatherListPage);

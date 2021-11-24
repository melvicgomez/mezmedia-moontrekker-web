/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-danger */
import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Input } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import axiosInstance from 'services';
import moment from 'moment';
import SwiperCore, { Navigation, Pagination } from 'swiper';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';

import 'swiper/swiper-bundle.css';

SwiperCore.use([Navigation, Pagination]);

const SearchBar = styled(Row)`
  position: relative;
  margin: 10px 40px 20px 0px;

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

  .ant-table-sticky-header {
    top: 148px !important;
  }

  .ant-empty-description {
    color: ${Colors.white};
  }

  .ant-table-expanded-row {
    td,
    th {
      color: #8dbbe0 !important;
    }
  }
`;

function AttemptListComponent({ challengeId, type }) {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      key: 'id',
    },
    {
      title: 'Participant',
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
      title: 'Last Checkpoint',
      dataIndex: 'lastCheckpoint',
      key: 'lastCheckpoint',
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
      render: (_, record) => (
        <Row>
          <div
            onClick={() => {
              setDeleteModalVisible(true);
              setSelectedDeleteRecord(record.id);
            }}
            style={{ color: Colors.primary, cursor: 'pointer' }}
          >
            Delete
          </div>
        </Row>
      ),
    },
  ];

  const raceColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      key: 'id',
    },
    {
      title: 'Participant',
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
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
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
      render: (_, record) => (
        <Row>
          <div
            onClick={() => {
              setDeleteModalVisible(true);
              setSelectedDeleteRecord(record.id);
            }}
            style={{ color: Colors.primary, cursor: 'pointer' }}
          >
            Delete
          </div>
        </Row>
      ),
    },
  ];

  const [challenge, setChallenge] = useState(null);
  const [attemptList, setAttemptList] = useState([]);
  const [keyword, setKeyword] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState(null);

  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 100,
    showSizeChanger: false,
    simple: true,
  });

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getAttempt();

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getAttempt = (page, search = '') => {
    axiosInstance
      .get(
        `api/attempt?challenge_id=${challengeId}&search=${search}&page=${page}&per_page=100&order_by=attempt_id`,
      )
      .then(res => {
        if (!unmounted.current) {
          setChallenge(res.data.challenge);

          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.attempt_id,
            id: d.attempt_id,
            status: d.status[0].toUpperCase() + d.status.substring(1),
            name: `${d.user.first_name} ${d.user.last_name}`,
            time: d.total_time
              ? moment.utc(d.total_time * 1000).format('HH:mm:ss')
              : '-',
            lastCheckpoint: d.progress.length
              ? `Checkpoint ${d.progress[d.progress.length - 1].end_trail_id}`
              : '-',
            startDate: d.started_at
              ? moment
                  .utc(d.started_at)
                  .local()
                  .format('DD/MM/YY HH:mm')
              : '-',
            endDate: d.ended_at
              ? moment
                  .utc(d.ended_at)
                  .local()
                  .format('DD/MM/YY HH:mm')
              : '-',
            gps: 'OK', // to be replaced
            hasImage: !!d.progress.filter(p => !!p.submitted_image).length,
            data: d,
          }));
          setAttemptList(newList);

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
    getAttempt(pagination.current, keyword.trim());
  };

  const deleteRecord = () => {
    axiosInstance.delete(`api/attempt/${selectedDeleteRecord}`).then(() => {
      setDeleteModalVisible(false);
      getAttempt(customPagination.current, keyword);
    });
  };

  return (
    <div style={{ padding: '10px 20px 20px 10px' }}>
      <SearchBar align="middle" justify="space-between">
        <div>
          <Input
            className="bodyBold white-text"
            placeholder="Search Participant"
            style={{ width: '250px' }}
            value={keyword}
            addonBefore={
              <Icon
                onClick={() => {
                  getAttempt(1, keyword);
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
              getAttempt(1, keyword);
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
                getAttempt(1, '');
              }}
            />
          )}
        </div>
      </SearchBar>

      <List
        size="middle"
        className="body white-text"
        columns={type === 'race' ? raceColumns : columns}
        dataSource={attemptList}
        sticky
        onChange={handleTableChange}
        pagination={customPagination}
        bordered={false}
        expandable={{
          columnWidth: 30,
          rowExpandable: record => record.data.progress.length > 0,
          expandedRowRender: record => (
            <div style={{ padding: '10px' }}>
              <table>
                <thead>
                  <tr>
                    <th className="grey-text" colSpan={3}>
                      CHECKPOINT TIMINGS
                    </th>
                    <th>START TIME</th>
                    <th>END TIME</th>
                    <th colSpan={2}>GPS</th>
                    <th colSpan={2}>CORRECT GPS</th>
                    <th colSpan={2}>SUBMITTED IMAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {record.data.progress.map((p, i) => (
                    <tr key={i}>
                      <td style={{ paddingTop: '5px' }}>{p.description}</td>
                      <td style={{ paddingTop: '5px' }}>{p.distance}km</td>
                      <td style={{ paddingTop: '5px' }}>
                        {challenge.is_time_required && p.duration
                          ? moment.utc(p.duration * 1000).format('HH:mm:ss')
                          : '00:00:00'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {p.started_at
                          ? moment
                              .utc(p.started_at)
                              .local()
                              .format('DD MMM HH:mm:ss')
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {p.ended_at
                          ? moment
                              .utc(p.ended_at)
                              .local()
                              .format('DD MMM HH:mm:ss')
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {p.location_data
                          ? JSON.parse(p.location_data).longitude.toFixed(4)
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {p.location_data
                          ? JSON.parse(p.location_data).latitude.toFixed(4)
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {challenge.trails.find(
                          t => t.trail_index === p.end_trail_id,
                        ) &&
                        challenge.trails.find(
                          t => t.trail_index === p.end_trail_id,
                        ).longitude
                          ? JSON.parse(
                              challenge.trails.find(
                                t => t.trail_index === p.end_trail_id,
                              ).longitude,
                            )
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {challenge.trails.find(
                          t => t.trail_index === p.end_trail_id,
                        ) &&
                        challenge.trails.find(
                          t => t.trail_index === p.end_trail_id,
                        ).latitude
                          ? JSON.parse(
                              challenge.trails.find(
                                t => t.trail_index === p.end_trail_id,
                              ).latitude,
                            )
                          : '-'}
                      </td>
                      <td style={{ paddingTop: '5px' }}>
                        {p.submitted_image ? (
                          <img
                            src={`${process.env.IMAGE_URL_PREFIX}attempt/${
                              p.progress_id
                            }/${p.submitted_image}`}
                            alt="submitted_image"
                            style={{
                              height: '140px',
                              width: '140px',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
          // rowExpandable: record => record.name !== 'Not Expandable',
        }}
      />
      <ConfirmationPopupComponent
        visibility={deleteModalVisible}
        dismissModal={() => {
          setDeleteModalVisible(false);
          setSelectedDeleteRecord(null);
        }}
        title="Delete Corporate"
        message="This action cannot be undone. Do you wish to delete this record?"
        leftAction={deleteRecord}
        rightAction={() => {
          setDeleteModalVisible(false);
          setSelectedDeleteRecord(null);
        }}
      />
    </div>
  );
}

export default AttemptListComponent;

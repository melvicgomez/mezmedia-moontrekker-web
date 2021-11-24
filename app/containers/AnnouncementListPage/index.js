/**
 *
 * AnnouncementListPage
 *
 */
import React, { memo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
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
import makeSelectAnnouncementListPage from './selectors';
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

export function AnnouncementListPage({ dispatch, match }) {
  useInjectReducer({ key: 'announcementListPage', reducer });
  useInjectSaga({ key: 'announcementListPage', saga });

  const columns = [
    {
      title: 'ID',
      width: 80,
      dataIndex: 'announcementId',
      align: 'center',
      key: 'announcementId',
      render: text => (
        <a className="white-text" href={`/announcements/${text}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'Publish Date',
      dataIndex: 'postedDate',
      key: 'postedDate',
      width: 120,
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
      width: 220,
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: text => <div className="white-text fix-line">{text}</div>,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 190,
      render: image =>
        image.length ? (
          <img
            src={`${process.env.IMAGE_URL_PREFIX}announcement/${image[0]}/${
              image[1]
            }`}
            style={{
              height: '110px',
              width: '190px',
              objectFit: 'contain',
              backgroundColor: Colors.transparent,
            }}
            alt="post"
            onError={e => {
              e.target.onerror = null;
              e.target.src = Images.imagePlaceholder;
            }}
          />
        ) : (
          <div className="white-text">-</div>
        ),
    },
    {
      title: 'Pinned',
      dataIndex: 'pinned',
      align: 'center',
      width: 130,
      key: 'pinned',
    },
  ];

  const [announcements, setAnnouncements] = useState([]);
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
      .get(`api/announcement?type=admin&page=${page}&search=${search}`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.announcement_id,
            announcementId: d.announcement_id,
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
            content: d.description,
            htmlContent: d.html_content,
            image: d.cover_image ? [d.announcement_id, d.cover_image] : [],
            pinned: d.pin_post ? 'Yes' : 'No',
          }));
          setAnnouncements(newList);

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
              label="Create Announcement"
              onClick={() => dispatch(push(`../../announcement/create`))}
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
            dataSource={announcements}
            sticky
            onChange={handleTableChange}
            pagination={customPagination}
            bordered={false}
            expandable={{
              columnWidth: 30,
              expandedRowRender: record => (
                <div style={{ padding: '5px 20px' }}>
                  <div className="bodyLink">HTML Content:</div>
                  <p
                    className="body"
                    style={{
                      margin: '10px 10px 5px',
                      whiteSpace: 'pre-line',
                      wordWrap: 'break-word',
                    }}
                  >
                    {record.htmlContent}
                  </p>
                </div>
              ),
            }}
          />
        </div>
      </NavigationWrapperComponent>
    </div>
  );
}

AnnouncementListPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  announcementListPage: makeSelectAnnouncementListPage(),
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
)(AnnouncementListPage);

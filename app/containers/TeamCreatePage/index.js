/* eslint-disable no-restricted-globals */
/**
 *
 * TeamCreatePage
 *
 */

import React, { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axiosInstance from 'services';
import { Helmet } from 'react-helmet';
import { Row, Select, Table, Input } from 'antd';
import { replace } from 'connected-react-router';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import Icon, { CloseOutlined } from '@ant-design/icons';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectTeamCreatePage from './selectors';
import reducer from './reducer';
import saga from './saga';

const { Option } = Select;

const PageWrapperStyled = styled(Row)`
  margin: 50px 30px 20px;

  > div:first-child {
    width: 100%;
    padding-right: 50px;
    border-right: 1px solid ${Colors.disabled};
  }
  > div:last-child {
    width: 500px;
    min-width: 500px;
    margin-left: 50px;
  }
`;

const Label = styled.p`
  margin-bottom: 6px;
  width: 250px;
  min-width: 250px;
  padding-top: 10px;
`;

const TypeSelector = styled(Select)`
  width: 100% !important;
  margin-bottom: 25px;
  border: 2px solid ${Colors.white} !important;
  border-radius: 8px !important;

  > .ant-select-selector {
    height: 48px !important;
    background-color: ${Colors.shadow} !important;
    border-radius: 8px !important;
    border: none !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
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

export function TeamCreatePage({ dispatch, match }) {
  useInjectReducer({ key: 'teamCreatePage', reducer });
  useInjectSaga({ key: 'teamCreatePage', saga });

  const columns = [
    {
      title: 'Corporate ID',
      dataIndex: 'corporateId',
      align: 'center',
      width: 120,
      key: 'corporateId',
    },
    {
      title: 'Corporate Name',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  const typeList = [
    { name: 'Duo', type: 'duo' },
    { name: 'Team', type: 'team' },
    { name: 'Corporate Team', type: 'corporate' },
  ];

  const [name, setName] = useState('');
  const [type, setType] = useState('Select Team Type');
  const [corporate, setCorporate] = useState('');

  const [corporateList, setCorporateList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 50,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  const [loading, setLoading] = useState(false);

  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getList = (page, search = '') => {
    axiosInstance
      .get(`api/corporate?page=${page}&search=${search}&per_page=50`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.corporate_id,
            corporateId: d.corporate_id,
            name: d.business_name,
          }));
          setCorporateList(newList);

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

  const submit = () => {
    if (!loading) {
      setLoading(true);

      const params = {
        team_name: name,
        team_type: typeList.find(i => i.name.includes(type)).type,
      };

      if (corporate) {
        params.corporate_id = corporate;
      }

      axiosInstance
        .post('api/team', params)
        .then(() => {
          setLoading(false);
          dispatch(
            replace({
              pathname: '../../../teams',
              state: { tab: 'team' },
            }),
          );
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent match={match} topTab={null}>
        <PageWrapperStyled wrap={false}>
          <div className="white-text">
            <p className="h2 white-text" style={{ marginBottom: '30px' }}>
              Create Team
            </p>
            <Row wrap={false}>
              <Label className="bodyBold white-text">Team Type</Label>
              <TypeSelector
                defaultValue={type}
                showArrow={false}
                className="bodyBold"
                style={{
                  width: 120,
                  color:
                    type === 'Select Team Type'
                      ? Colors.placeholderTextColor
                      : Colors.white,
                }}
                onChange={value => {
                  setType(value);
                }}
                dropdownStyle={{ zIndex: 999999 }}
              >
                {typeList.map((option, index) => (
                  <Option
                    key={index}
                    value={option.name}
                    className="bodyBold grey-text"
                  >
                    {option.name}
                  </Option>
                ))}
              </TypeSelector>
            </Row>
            <TextInputComponent
              title="Team Name"
              defaultValue={name}
              value={name}
              admin
              placeholder="Team Name"
              onChange={value => {
                setName(value);
              }}
            />
            <TextInputComponent
              title="Corporate ID (Optional)"
              defaultValue={corporate}
              value={corporate}
              admin
              placeholder="Corporate ID for Corporate Team"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setCorporate(value);
                }
              }}
            />

            <Row justify="center" style={{ margin: '50px 0px 40px' }}>
              <PrimaryButtonComponent
                style={{
                  width: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Save and Preview"
                loading={loading}
                disabled={
                  !name || !name.trim().length || type === 'Select Team Type'
                }
                onClick={() => submit()}
              />
            </Row>
          </div>
          <div style={{ padding: '10px 20px 20px 10px' }}>
            <Row
              justify="space-between"
              style={{ flex: 1, marginBottom: '10px' }}
            >
              <SearchBar align="middle">
                <div>
                  <Input
                    className="bodyBold white-text"
                    placeholder="Search Corporate"
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
            </Row>
            <List
              size="small"
              className="body white-text"
              columns={columns}
              dataSource={corporateList}
              sticky
              onChange={handleTableChange}
              pagination={customPagination}
              bordered={false}
            />
          </div>
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

TeamCreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  teamCreatePage: makeSelectTeamCreatePage(),
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
)(TeamCreatePage);

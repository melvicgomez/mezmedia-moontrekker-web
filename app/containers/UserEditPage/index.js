/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-globals */
/**
 *
 * UserEditPage
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
import { Row, Table, Input, Spin } from 'antd';
import { replace } from 'connected-react-router';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import Icon, { CloseOutlined } from '@ant-design/icons';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectUserEditPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const LoadingSpinner = styled(Spin)`
  margin-top: 30px;
`;

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

export function UserEditPage({ dispatch, match }) {
  useInjectReducer({ key: 'userEditPage', reducer });
  useInjectSaga({ key: 'userEditPage', saga });

  const userId = match.params.id;
  const [loadData, setLoadData] = useState(true);

  const columns = [
    {
      title: 'Team ID',
      dataIndex: 'teamId',
      align: 'center',
      width: 90,
      key: 'teamId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 150,
      key: 'type',
    },
  ];

  const typeList = [
    { name: 'Duo', type: 'duo' },
    { name: 'Team', type: 'team' },
    { name: 'Corporate Team', type: 'corporate' },
  ];

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');

  const [teamList, setTeamList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 50,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  const [loading, setLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const unmounted = useRef(false);

  useEffect(() => {
    getUserData();
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getUserData = () => {
    axiosInstance
      .get(`api/users/${userId}`)
      .then(res => {
        const userData = res.data;
        setFName(userData.first_name);
        setLName(userData.last_name);
        setEmail(userData.email);
        setTeam(userData.team_id.toString() || '');
        setLoadData(false);
      })
      .catch(() => {
        setLoadData(false);
      });
  };

  const getList = (page, search = '') => {
    axiosInstance
      .get(`api/team?page=${page}&search=${search}&per_page=50`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.team_id,
            teamId: d.team_id,
            name: d.team_name,
            type: typeList.find(i => i.type === d.team_type).name,
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

  const submit = () => {
    if (!loading) {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

      if (!emailRegex.test(email)) {
        setIsValidEmail(false);
      } else {
        setLoading(true);
        const params = {
          user_id: userId,
          first_name: fName,
          last_name: lName,
          email,
        };

        if (team) {
          params.team_id = team;
        }

        axiosInstance
          .post('api/users', params)
          .then(() => {
            setLoading(false);
            dispatch(replace(`../../../users/${userId}`));
          })
          .catch(() => {
            setLoading(false);
          });
      }
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
              Edit User
            </p>
            {loadData ? (
              <Row justify="center">
                <LoadingSpinner size="large" />
              </Row>
            ) : (
              <>
                <TextInputComponent
                  title="First Name"
                  defaultValue={fName}
                  value={fName}
                  admin
                  placeholder="First Name"
                  onChange={value => {
                    setFName(value);
                  }}
                />
                <TextInputComponent
                  title="Last Name"
                  defaultValue={lName}
                  value={lName}
                  admin
                  placeholder="Last Name"
                  onChange={value => {
                    setLName(value);
                  }}
                />
                <TextInputComponent
                  title="Email"
                  defaultValue={email}
                  value={email}
                  admin
                  placeholder="Email"
                  hasError={!isValidEmail}
                  onChange={value => {
                    setIsValidEmail(true);
                    setEmail(value);
                  }}
                />
                <TextInputComponent
                  title="Team ID (Optional)"
                  defaultValue={team}
                  value={team}
                  admin
                  placeholder="Team ID for Duo/Team/Corporate Team"
                  onChange={value => {
                    const reg = /^-?\d*(\.\d*)?$/;
                    if (!isNaN(value) && reg.test(value)) {
                      setTeam(value);
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
                      !fName ||
                      !fName.trim().length ||
                      !lName ||
                      !lName.trim().length ||
                      !email ||
                      !email.trim().length
                    }
                    onClick={() => submit()}
                  />
                </Row>
              </>
            )}
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
            </Row>
            <List
              size="small"
              className="body white-text"
              columns={columns}
              dataSource={teamList}
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

UserEditPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userEditPage: makeSelectUserEditPage(),
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
)(UserEditPage);

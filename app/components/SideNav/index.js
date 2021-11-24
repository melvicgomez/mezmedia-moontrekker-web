/**
 *
 * SideNav
 *
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import { Colors } from 'theme/colors';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';

const { Sider } = Layout;

const SideBar = styled(Sider)`
  top: 68px !important;
  position: fixed;
  left: 0;
  background: ${Colors.sideBar} !important;
  flex: 0 0 300px !important;
  max-width: 200px !important;
  min-width: 200px !important;
  width: 300px !important;
  overflow-y: auto;
  height: calc(100vh - 68px);
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  z-index: 9;

  &::-webkit-scrollbar {
    display: none;
  }

  > div {
    height: calc(100vh - 68px);
    width: 100%;
    padding: 20px 15px;
    overflow-y: auto;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;
    background: ${Colors.sideBar} !important;

    & > div {
      height: 100%;
    }
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SideBarContent = styled.div`
  display: flex;
  flex-direction: column;
  /* 
  80px is based on TabHeaderWrapperStyled's height 
  inside app\components\NavigationWrapperComponent\index.js
  */
`;

const SideBarMenu = styled(Menu)`
  background: ${Colors.sideBar} !important;
  width: 100%;

  li {
    padding: 3px 0px !important;
    height: auto !important;
    color: ${Colors.white} !important;
    padding-left: 10px !important;
  }

  .ant-menu-item-selected {
    background: ${Colors.sideBar} !important;
  }

  .ant-menu-item > span {
    color: ${Colors.white} !important;
  }

  .ant-menu-item-selected {
    color: ${Colors.primary} !important;

    > span {
      color: ${Colors.primary} !important;
    }
  }
`;

function SideNav({ match, dispatch }) {
  const navigationOption = [
    {
      id: 0,
      title: 'Users',
      name: 'users',
      slug: '/users',
    },
    {
      id: 1,
      title: 'Team/Corporate',
      name: 'teams',
      slug: '/teams',
    },
    {
      id: 2,
      title: 'Challenges',
      name: 'challenges',
      slug: '/challenges',
    },
    {
      id: 3,
      title: 'Race',
      name: 'race',
      slug: '/race',
    },
    {
      id: 4,
      title: 'Training',
      name: 'training',
      slug: '/training',
    },
    {
      id: 5,
      title: 'Announcements',
      name: 'announcements',
      slug: '/announcements',
    },
    {
      id: 6,
      title: 'Weather Warning',
      name: 'bad-weather',
      slug: '/bad-weather',
    },
    {
      id: 7,
      title: 'Notifications',
      name: 'notifications',
      slug: '/notifications',
    },
  ];

  return (
    <SideBar className="white-text">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <SideBarContent>
          {!!match.path.startsWith('trail')}
          <SideBarMenu
            theme="dark"
            className="bodyBold"
            mode="inline"
            defaultSelectedKeys={[
              `${
                navigationOption.find(v =>
                  (match ? match.path : '/').startsWith(v.slug.slice(0, -1)),
                )
                  ? match.path.startsWith('trail')
                    ? '2'
                    : navigationOption.find(v =>
                        (match ? match.path : '/').startsWith(
                          v.slug.slice(0, -1),
                        ),
                      ).id
                  : '0'
              }`,
            ]}
          >
            {navigationOption.map(option => (
              <Menu.Item
                key={option.id}
                className="h3"
                onClick={() => {
                  dispatch(push(option.slug));
                }}
              >
                {option.title}
              </Menu.Item>
            ))}
          </SideBarMenu>
        </SideBarContent>
      </div>
    </SideBar>
  );
}

SideNav.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

SideNav.defaultProps = {};

const mapStateToProps = () => ({});
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
)(SideNav);

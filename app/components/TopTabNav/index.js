/**
 *
 * TopTabNav
 *
 */

import React, { useState, useEffect } from 'react';
import { Menu, Row } from 'antd';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Colors } from 'theme/colors';
import PropTypes from 'prop-types';

const MenuBar = styled(Menu)`
  background-color: ${Colors.background};
  border-bottom: 0px !important;

  & > .ant-menu-item-selected,
  .ant-menu-item-active {
    border-bottom: 3px solid ${Colors.primary} !important;
    color: ${Colors.primary} !important;
  }
`;

function TopTabNav({ match, location, getCurrentActiveTab }) {
  const [current, setCurrent] = useState('feeds');

  const handleClick = e => {
    setCurrent(e.key);
    getCurrentActiveTab(e.key);
  };

  useEffect(() => {
    let tab = '';

    if (match.path.startsWith('/admin/users')) {
      if (location && location.state) {
        tab =
          location.state.tab === 'posts'
            ? 'user-posts'
            : location.state.tab === 'comments'
            ? 'user-comments'
            : location.state.tab === 'challenges'
            ? 'user-challenges'
            : location.state.tab === 'lives'
            ? 'user-lives'
            : location.state.tab === 'meetups'
            ? 'user-meetups'
            : location.state.tab === 'history'
            ? 'user-history'
            : location.state.tab === 'user-notification'
            ? 'user-notification'
            : 'user-details';
      } else {
        tab = 'user-details';
      }
    }

    if (match.path.startsWith('/admin/notifications')) {
      if (location && location.state) {
        tab =
          location.state.tab === 'all-users-notif'
            ? 'all-users-notif'
            : 'club-users-notif';
      } else {
        tab = 'club-users-notif';
      }
    }
    setCurrent(tab);
  }, [location, match]);

  return (
    <Row
      wrap={false}
      justify="space-between"
      align="middle"
      style={{ width: '100%' }}
    >
      <MenuBar
        className="white-text"
        onClick={handleClick}
        selectedKeys={[current]}
        mode="horizontal"
      />
    </Row>
  );
}

TopTabNav.propTypes = {
  match: PropTypes.object,
  getCurrentActiveTab: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(TopTabNav);

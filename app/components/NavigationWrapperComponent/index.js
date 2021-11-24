/**
 *
 * AdminNavigationWrapperComponent
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled, { css } from 'styled-components';
import { Layout, Row, Col } from 'antd';
import { Colors } from 'theme/colors';
import AppBarComponent from 'components/AppBarComponent';
import SideNav from 'components/SideNav/Loadable';

const { Content } = Layout;

const MainLayout = styled(Layout)`
  background-color: ${Colors.background};

  ${props =>
    props.primary &&
    css`
      height: 100vh;
    `}
`;

const TabHeaderWrapperStyled = styled.div`
  min-height: 60px;
  display: flex;
  align-items: ${props => (props.searchBar ? 'flex-end' : 'center')};
  position: sticky;
  top: ${props => (props.searchBar ? '68px' : '0px')};
  z-index: 5;
  background-color: ${Colors.background};
  box-shadow: 0 0 8px 8px ${Colors.background};

  ${props =>
    props.searchBar &&
    css`
      padding-bottom: 10px;
    `}

  > div > img {
    cursor: pointer;
  }
`;

function NavigationWrapperComponent({ match, children, topTab }) {
  // const [activeTab, setActiveTab] = useState('feeds');

  // useEffect(() => {
  //   let tab = '';

  //   setActiveTab(tab);
  // }, [location]);

  return (
    <div style={{ backgroundColor: Colors.background }}>
      <AppBarComponent />
      <div
        style={{
          margin: 'auto',
          minWidth: 1366,
          paddingTop: 68,
        }}
      >
        <MainLayout>
          <SideNav match={match} />
          <Layout
            style={{
              marginLeft: '220px',
              backgroundColor: Colors.background,
              // marginRight: '20px',
            }}
          >
            <Content>
              {topTab ? (
                <TabHeaderWrapperStyled searchBar>
                  {topTab}
                </TabHeaderWrapperStyled>
              ) : null}

              <Row>
                <Col span={24}>{children}</Col>
              </Row>
            </Content>
          </Layout>
        </MainLayout>
      </div>
    </div>
  );
}

NavigationWrapperComponent.propTypes = {
  // dispatch: PropTypes.func.isRequired,
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

export default compose(withConnect)(NavigationWrapperComponent);

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * RaceDetailPage
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import { Row } from 'antd';
import { push } from 'connected-react-router';
import { Colors } from 'theme/colors';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TrailDetailComponent from 'components/Challenge/TrailDetailComponent';
import AttemptListComponent from 'components/Challenge/AttemptListComponent';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectRaceDetailPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const ContentWrapper = styled(Row)`
  padding-right: 30px;

  > div:first-child {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;

    ::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SelectionBar = styled(Row)`
  margin-left: 40px;

  > div {
    margin-right: 50px;
    cursor: pointer;
    height: fit-content;
  }
`;

export function RaceDetailPage({ match, location, dispatch }) {
  useInjectReducer({ key: 'raceDetailPage', reducer });
  useInjectSaga({ key: 'raceDetailPage', saga });

  const [selectedTab, setSelectedTab] = useState(1);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  useEffect(() => {
    let tab = '';

    if (location && location.state) {
      tab = location.state.tab === 'info' ? 1 : 2;
    } else {
      tab = 1;
    }

    setSelectedTab(tab);
  }, [location, match]);

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent
        match={match}
        location={location}
        topTab={
          <Row align="bottom">
            <SelectionBar className="h3">
              <div
                className={selectedTab === 1 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 1 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  dispatch(
                    push({
                      pathname: `/race`,
                      state: { tab: 'info' },
                    }),
                  );
                }}
              >
                Race Info
              </div>
              <div
                className={selectedTab === 2 ? 'cyan-text' : 'white-text'}
                style={{
                  borderBottom:
                    (selectedTab === 2 ? '2px solid ' : '0px solid ') +
                    Colors.primary,
                }}
                onClick={() => {
                  dispatch(
                    push({
                      pathname: `/race`,
                      state: { tab: 'attempt' },
                    }),
                  );
                }}
              >
                User Attempts
              </div>
            </SelectionBar>
            {selectedTab === 1 ? (
              <PrimaryButtonComponent
                style={{
                  padding: '0px 20px',
                  marginLeft: '30px',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Create Trail"
                onClick={() => dispatch(push(`../../race/1/trail/create`))}
                iconRight={false}
              />
            ) : null}
          </Row>
        }
      >
        <ContentWrapper flex={1} wrap={false}>
          {selectedTab === 1 ? (
            <TrailDetailComponent dispatch={dispatch} challengeId={1} />
          ) : (
            <AttemptListComponent challengeId={1} type="race" />
          )}
        </ContentWrapper>
      </NavigationWrapperComponent>
    </div>
  );
}

RaceDetailPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  raceDetailPage: makeSelectRaceDetailPage(),
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
)(RaceDetailPage);

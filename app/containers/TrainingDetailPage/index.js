/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * TrainingDetailPage
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
import makeSelectTrainingDetailPage from './selectors';
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

export function TrainingDetailPage({ match, location, dispatch }) {
  useInjectReducer({ key: 'trainingDetailPage', reducer });
  useInjectSaga({ key: 'trainingDetailPage', saga });

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
                      pathname: `/training`,
                      state: { tab: 'info' },
                    }),
                  );
                }}
              >
                Training Info
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
                      pathname: `/training`,
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
                onClick={() => dispatch(push(`../../training/2/trail/create`))}
                iconRight={false}
              />
            ) : null}
          </Row>
        }
      >
        <ContentWrapper flex={1} wrap={false}>
          {selectedTab === 1 ? (
            <TrailDetailComponent dispatch={dispatch} challengeId={2} />
          ) : (
            <AttemptListComponent challengeId={2} type="training" />
          )}
        </ContentWrapper>
      </NavigationWrapperComponent>
    </div>
  );
}

TrainingDetailPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  trainingDetailPage: makeSelectTrainingDetailPage(),
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
)(TrainingDetailPage);

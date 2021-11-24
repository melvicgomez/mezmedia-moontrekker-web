import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the challengeListPage state domain
 */

const selectChallengeListPageDomain = state =>
  state.challengeListPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by ChallengeListPage
 */

const makeSelectChallengeListPage = () =>
  createSelector(
    selectChallengeListPageDomain,
    substate => substate,
  );

export default makeSelectChallengeListPage;
export { selectChallengeListPageDomain };

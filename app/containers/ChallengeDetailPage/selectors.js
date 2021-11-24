import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the challengeDetailPage state domain
 */

const selectChallengeDetailPageDomain = state =>
  state.challengeDetailPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by ChallengeDetailPage
 */

const makeSelectChallengeDetailPage = () =>
  createSelector(
    selectChallengeDetailPageDomain,
    substate => substate,
  );

export default makeSelectChallengeDetailPage;
export { selectChallengeDetailPageDomain };

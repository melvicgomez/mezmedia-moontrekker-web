import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the trailCreatePage state domain
 */

const selectTrailCreatePageDomain = state =>
  state.trailCreatePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by TrailCreatePage
 */

const makeSelectTrailCreatePage = () =>
  createSelector(
    selectTrailCreatePageDomain,
    substate => substate,
  );

export default makeSelectTrailCreatePage;
export { selectTrailCreatePageDomain };

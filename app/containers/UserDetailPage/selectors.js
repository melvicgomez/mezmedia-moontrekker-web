import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the userDetailPage state domain
 */

const selectUserDetailPageDomain = state =>
  state.userDetailPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by UserDetailPage
 */

const makeSelectUserDetailPage = () =>
  createSelector(
    selectUserDetailPageDomain,
    substate => substate,
  );

export default makeSelectUserDetailPage;
export { selectUserDetailPageDomain };

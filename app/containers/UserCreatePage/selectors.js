import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the userCreatePage state domain
 */

const selectUserCreatePageDomain = state =>
  state.userCreatePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by UserCreatePage
 */

const makeSelectUserCreatePage = () =>
  createSelector(
    selectUserCreatePageDomain,
    substate => substate,
  );

export default makeSelectUserCreatePage;
export { selectUserCreatePageDomain };

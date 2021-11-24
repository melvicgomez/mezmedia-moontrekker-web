import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the userEditPage state domain
 */

const selectUserEditPageDomain = state => state.userEditPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by UserEditPage
 */

const makeSelectUserEditPage = () =>
  createSelector(
    selectUserEditPageDomain,
    substate => substate,
  );

export default makeSelectUserEditPage;
export { selectUserEditPageDomain };

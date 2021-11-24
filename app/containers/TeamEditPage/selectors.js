import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the teamEditPage state domain
 */

const selectTeamEditPageDomain = state => state.teamEditPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by TeamEditPage
 */

const makeSelectTeamEditPage = () =>
  createSelector(
    selectTeamEditPageDomain,
    substate => substate,
  );

export default makeSelectTeamEditPage;
export { selectTeamEditPageDomain };

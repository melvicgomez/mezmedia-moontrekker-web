import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the teamCreatePage state domain
 */

const selectTeamCreatePageDomain = state =>
  state.teamCreatePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by TeamCreatePage
 */

const makeSelectTeamCreatePage = () =>
  createSelector(
    selectTeamCreatePageDomain,
    substate => substate,
  );

export default makeSelectTeamCreatePage;
export { selectTeamCreatePageDomain };

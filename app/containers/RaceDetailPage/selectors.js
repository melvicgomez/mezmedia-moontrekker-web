import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the raceDetailPage state domain
 */

const selectRaceDetailPageDomain = state =>
  state.raceDetailPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by RaceDetailPage
 */

const makeSelectRaceDetailPage = () =>
  createSelector(
    selectRaceDetailPageDomain,
    substate => substate,
  );

export default makeSelectRaceDetailPage;
export { selectRaceDetailPageDomain };

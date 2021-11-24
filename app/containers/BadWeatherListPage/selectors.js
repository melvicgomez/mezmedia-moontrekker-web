import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the badWeatherListPage state domain
 */

const selectBadWeatherListPageDomain = state =>
  state.badWeatherListPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by BadWeatherListPage
 */

const makeSelectBadWeatherListPage = () =>
  createSelector(
    selectBadWeatherListPageDomain,
    substate => substate,
  );

export default makeSelectBadWeatherListPage;
export { selectBadWeatherListPageDomain };

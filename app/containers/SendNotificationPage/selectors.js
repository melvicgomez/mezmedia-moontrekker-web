import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the sendNotificationPage state domain
 */

const selectSendNotificationPageDomain = state =>
  state.sendNotificationPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by SendNotificationPage
 */

const makeSelectSendNotificationPage = () =>
  createSelector(
    selectSendNotificationPageDomain,
    substate => substate,
  );

export default makeSelectSendNotificationPage;
export { selectSendNotificationPageDomain };

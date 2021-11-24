import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the announcementListPage state domain
 */

const selectAnnouncementListPageDomain = state =>
  state.announcementListPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by AnnouncementListPage
 */

const makeSelectAnnouncementListPage = () =>
  createSelector(
    selectAnnouncementListPageDomain,
    substate => substate,
  );

export default makeSelectAnnouncementListPage;
export { selectAnnouncementListPageDomain };

import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the announcementCreatePage state domain
 */

const selectAnnouncementCreatePageDomain = state =>
  state.announcementCreatePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by AnnouncementCreatePage
 */

const makeSelectAnnouncementCreatePage = () =>
  createSelector(
    selectAnnouncementCreatePageDomain,
    substate => substate,
  );

export default makeSelectAnnouncementCreatePage;
export { selectAnnouncementCreatePageDomain };

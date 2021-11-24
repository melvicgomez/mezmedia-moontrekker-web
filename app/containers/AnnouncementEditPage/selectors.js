import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the announcementEditPage state domain
 */

const selectAnnouncementEditPageDomain = state =>
  state.announcementEditPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by AnnouncementEditPage
 */

const makeSelectAnnouncementEditPage = () =>
  createSelector(
    selectAnnouncementEditPageDomain,
    substate => substate,
  );

export default makeSelectAnnouncementEditPage;
export { selectAnnouncementEditPageDomain };

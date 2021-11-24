import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the announcementDetailPage state domain
 */

const selectAnnouncementDetailPageDomain = state =>
  state.announcementDetailPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by AnnouncementDetailPage
 */

const makeSelectAnnouncementDetailPage = () =>
  createSelector(
    selectAnnouncementDetailPageDomain,
    substate => substate,
  );

export default makeSelectAnnouncementDetailPage;
export { selectAnnouncementDetailPageDomain };

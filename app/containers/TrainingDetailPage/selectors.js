import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the trainingDetailPage state domain
 */

const selectTrainingDetailPageDomain = state =>
  state.trainingDetailPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by TrainingDetailPage
 */

const makeSelectTrainingDetailPage = () =>
  createSelector(
    selectTrainingDetailPageDomain,
    substate => substate,
  );

export default makeSelectTrainingDetailPage;
export { selectTrainingDetailPageDomain };

/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import UserListPage from 'containers/UserListPage/Loadable';
import UserDetailPage from 'containers/UserDetailPage/Loadable';
import UserCreatePage from 'containers/UserCreatePage/Loadable';
import UserEditPage from 'containers/UserEditPage/Loadable';
import TeamListPage from 'containers/TeamListPage/Loadable';
import TeamCreatePage from 'containers/TeamCreatePage/Loadable';
import TeamEditPage from 'containers/TeamEditPage/Loadable';
import ChallengeListPage from 'containers/ChallengeListPage/Loadable';
import ChallengeDetailPage from 'containers/ChallengeDetailPage/Loadable';
import ChallengeEditPage from 'containers/ChallengeEditPage/Loadable';
import ChallengeCreatePage from 'containers/ChallengeCreatePage/Loadable';
import TrailCreatePage from 'containers/TrailCreatePage/Loadable';
import RaceDetailPage from 'containers/RaceDetailPage/Loadable';
import TrainingDetailPage from 'containers/TrainingDetailPage/Loadable';
import AnnouncementListPage from 'containers/AnnouncementListPage/Loadable';
import AnnouncementDetailPage from 'containers/AnnouncementDetailPage/Loadable';
import AnnouncementCreatePage from 'containers/AnnouncementCreatePage/Loadable';
import AnnouncementEditPage from 'containers/AnnouncementEditPage/Loadable';
import SendNotificationPage from 'containers/SendNotificationPage/Loadable';
import BadWeatherListPage from 'containers/BadWeatherListPage/Loadable';

import PrivacyPolicyPage from 'containers/PrivacyPolicyPage/Loadable';

import { reactLocalStorage } from 'reactjs-localstorage';

import GlobalStyle from '../../global-styles';
import 'swiper/swiper-bundle.css';

export default function App() {
  const user = reactLocalStorage.getObject('user');

  return (
    <div>
      <Switch>
        <Route exact path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route exact path="/" component={HomePage} />
        {user.privilege === 'moderator' && (
          <>
            <Route exact path="/users" component={UserListPage} />
            <Route exact path="/user/create" component={UserCreatePage} />
            <Route exact path="/users/:id" component={UserDetailPage} />
            <Route exact path="/users/:id/edit" component={UserEditPage} />
            <Route exact path="/teams" component={TeamListPage} />
            <Route exact path="/team/create" component={TeamCreatePage} />
            <Route exact path="/teams/:id/edit" component={TeamEditPage} />
            <Route exact path="/challenges" component={ChallengeListPage} />
            <Route
              exact
              path="/challenge/create"
              component={ChallengeCreatePage}
            />
            <Route
              exact
              path="/challenges/:id"
              component={ChallengeDetailPage}
            />
            <Route
              exact
              path="/challenges/:id/edit"
              component={ChallengeEditPage}
            />
            <Route
              exact
              path="/challenges/:id/trail/create"
              component={TrailCreatePage}
            />
            <Route exact path="/race" component={RaceDetailPage} />
            <Route
              exact
              path="/race/:id/trail/create"
              component={TrailCreatePage}
            />
            <Route exact path="/training" component={TrainingDetailPage} />
            <Route
              exact
              path="/training/:id/trail/create"
              component={TrailCreatePage}
            />
            <Route
              exact
              path="/announcements"
              component={AnnouncementListPage}
            />
            <Route
              exact
              path="/announcement/create"
              component={AnnouncementCreatePage}
            />
            <Route
              exact
              path="/announcements/:id"
              component={AnnouncementDetailPage}
            />
            <Route
              exact
              path="/announcements/:id/edit"
              component={AnnouncementEditPage}
            />
            <Route
              exact
              path="/notifications"
              component={SendNotificationPage}
            />
            <Route exact path="/bad-weather" component={BadWeatherListPage} />
          </>
        )}
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </div>
  );
}

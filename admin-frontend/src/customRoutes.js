import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn/checkIn';
import CheckInStatisticsView from './components/checkInStatistics';
import CheckInLogView from './components/checkInLog';
import ChangePasswordView from './components/changePassword';
import NewSeason from './components/newSeason';
import DeleteExpiredJuniors from './components/deleteExpiredJuniors';
import MiscFunctions from './components/miscFunctions';

export const routes = [
    <Route exact path="/checkIn/:youthClubId" component={CheckInView} noLayout />,
    <Route exact path="/statistics/:youthClubId" component={CheckInStatisticsView} />,
    <Route exact path="/log/:youthClubId" component={CheckInLogView} />,
    <Route path="/password" component={ChangePasswordView} />
];

export const adminRoutes = [
    <Route path="/newSeason" component={NewSeason} />,
    <Route path="/deleteExpiredJuniors" component={DeleteExpiredJuniors} />,
    <Route path="/miscFunctions" component={MiscFunctions} />
];

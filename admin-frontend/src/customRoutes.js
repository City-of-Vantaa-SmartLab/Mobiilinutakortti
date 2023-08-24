import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn/checkIn';
import LogBookView from './components/logbook';
import LogBookListView from './components/logbookList';
import ChangePasswordView from './components/changePassword';
import NewSeason from './components/newSeason';
import DeleteExpiredJuniors from './components/deleteExpiredJuniors';

export const routes = [
    <Route exact path="/checkIn/:youthClubId" component={CheckInView} noLayout />,
    <Route exact path="/logbook/:youthClubId" component={LogBookView} />,
    <Route exact path="/checkIns/:youthClubId" component={LogBookListView} />,
    <Route path="/password" component={ChangePasswordView} />
];

export const adminRoutes = [
    <Route path="/newSeason" component={NewSeason} />,
    <Route path="/deleteExpiredJuniors" component={DeleteExpiredJuniors} />
];

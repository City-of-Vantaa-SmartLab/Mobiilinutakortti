import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn/checkIn';
import LogBookView from './components/logbook';
import LogBookListView from './components/logbookList';
import ChangePasswordView from './components/changePassword';

export default [
    <Route exact path="/checkIn/:youthClubId" component={CheckInView} noLayout />,
    <Route exact path="/logbook/:youthClubId" component={LogBookView} />,
    <Route exact path="/checkIns/:youthClubId" component={LogBookListView} />,
    <Route path="/password" component={ChangePasswordView} />
];

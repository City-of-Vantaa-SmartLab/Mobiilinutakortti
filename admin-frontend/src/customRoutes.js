import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn';
import LogBookView from './components/logbook';
import LogBookListView from './components/logbookList';

export default [
    <Route exact path="/checkIn/:youthClubId" component={CheckInView} />,
    <Route exact path="/logbook/:youthClubId" component={LogBookView} />,
    <Route exact path="/checkIns/:youthClubId" component={LogBookListView} />
];

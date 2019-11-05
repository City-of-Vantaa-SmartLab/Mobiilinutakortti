import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn';

export default [
    <Route exact path="/checkIn/:youthClubId" component={ CheckInView } />
];

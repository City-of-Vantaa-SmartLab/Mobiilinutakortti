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
    <Route path="/checkIn" element={<CheckInView />} />,
    <Route path="/statistics/:youthClubId" element={<CheckInStatisticsView />} />,
    <Route path="/log/:youthClubId" element={<CheckInLogView />} />,
    <Route path="/password" element={<ChangePasswordView />} />
];

export const adminRoutes = [
    <Route path="/newSeason" element={<NewSeason />} />,
    <Route path="/deleteExpiredJuniors" element={<DeleteExpiredJuniors />} />,
    <Route path="/miscFunctions" element={<MiscFunctions />} />
];

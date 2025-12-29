import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ChangePasswordView from './components/changePassword';

const CheckInView = lazy(() => import('./components/checkIn/checkIn'));
const CheckInStatisticsView = lazy(() => import('./components/checkInStatistics'));
const CheckInLogView = lazy(() => import('./components/checkInLog'));

const NewSeason = lazy(() => import('./components/newSeason'));
const DeleteExpiredJuniors = lazy(() => import('./components/deleteExpiredJuniors'));
const MiscFunctions = lazy(() => import('./components/miscFunctions'));

const Loading = () => <div>Ladataan...</div>;

export const checkInRoute = [
    <Route path="/checkIn" element={<Suspense fallback={<Loading />}><CheckInView /></Suspense>} />
];

export const normalRoutes = [
    <Route path="/statistics/:youthClubId" element={<Suspense fallback={<Loading />}><CheckInStatisticsView /></Suspense>} />,
    <Route path="/log/:youthClubId" element={<Suspense fallback={<Loading />}><CheckInLogView /></Suspense>} />,
    <Route path="/password" element={<ChangePasswordView />} />
];

export const adminRoutes = [
    <Route path="/newSeason" element={<Suspense fallback={<Loading />}><NewSeason /></Suspense>} />,
    <Route path="/deleteExpiredJuniors" element={<Suspense fallback={<Loading />}><DeleteExpiredJuniors /></Suspense>} />,
    <Route path="/miscFunctions" element={<Suspense fallback={<Loading />}><MiscFunctions /></Suspense>} />
];

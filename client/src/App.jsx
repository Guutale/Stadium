
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StadiumList from './pages/StadiumList';
import StadiumDetails from './pages/StadiumDetails';
import MatchDetails from './pages/MatchDetails';
import SeatSelection from './pages/SeatSelection';
import MyBookings from './pages/MyBookings';
// Lazy load Payment to prevent Stripe from loading on other pages
const Payment = React.lazy(() => import('./pages/Payment'));

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStadiums from './pages/admin/AdminStadiums';
import AdminMatches from './pages/admin/AdminMatches';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminSeatView from './pages/admin/AdminSeatView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />

            {/* Public route - anyone can view match details */}
            <Route path="matches/:id" element={<MatchDetails />} />

            {/* Protected User Routes - require login */}
            <Route element={<ProtectedRoute />}>
              <Route path="stadiums" element={<StadiumList />} />
              <Route path="stadiums/:id" element={<StadiumDetails />} />
              <Route path="matches/:id/book" element={<SeatSelection />} />
              <Route path="payment/:id" element={
                <Suspense fallback={<div>Loading Payment...</div>}>
                  <Payment />
                </Suspense>
              } />
              <Route path="my-bookings" element={<MyBookings />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Admin Routes - AdminLayout usually handles role checks */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="stadiums" element={<AdminStadiums />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="matches/:id/seats" element={<AdminSeatView />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

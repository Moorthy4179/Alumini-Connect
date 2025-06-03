import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Home from './Home';
import Stories from './Stories';
import Community from './community';
import Events from './events';
import Donate from './donate';
import FriendsPage from './group';
import CareerCenter from './CareerCenter';
import AlumniNeeds from './AlumniNeeds';
import Reunion from './Reunion';
import VirtualSection from './VirtualSection';

// Admin Pages
import AdminDashboard from './Admin/AdminDashboard';
import ManageUsers from './Admin/ManageUsers';
import AdminReunion from './Admin/AdminReunion';
import AdminDonation from './Admin/AdminDonation';
import AdminVirtual from './Admin/AdminVirtual';
import AdminHomeImages from './Admin/AdminHomeImages';
import ManageStories from './Admin/ManageStories';
import AdminAlumniNeeds from './Admin/AdminAlumniNeeds';
import Admincareer from './Admin/Admincareer';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Protected User Routes */}
          <Route path="/stories" element={
            <ProtectedRoute>
              <Stories />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/donate" element={
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          } />
          <Route path="/group" element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />
          <Route path="/careercenter" element={
            <ProtectedRoute>
              <CareerCenter />
            </ProtectedRoute>
          } />
          <Route path="/alumnineeds" element={
            <ProtectedRoute>
              <AlumniNeeds />
            </ProtectedRoute>
          } />
          <Route path="/reunion" element={
            <ProtectedRoute>
              <Reunion />
            </ProtectedRoute>
          } />
          <Route path="/virtualsection" element={
            <ProtectedRoute>
              <VirtualSection />
            </ProtectedRoute>
          } />
          {/* <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } /> */}

          {/* Protected Admin Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute adminRequired>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manage-users" element={
            <ProtectedRoute adminRequired>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin-careercenter" element={
            <ProtectedRoute adminRequired>
              <Admincareer />
            </ProtectedRoute>
          } />
          <Route path="/admin-alumnineeds" element={
            <ProtectedRoute adminRequired>
              <AdminAlumniNeeds />
            </ProtectedRoute>
          } />
          <Route path="/adminreunion" element={
            <ProtectedRoute adminRequired>
              <AdminReunion />
            </ProtectedRoute>
          } />
          <Route path="/adminvirtual" element={
            <ProtectedRoute adminRequired>
              <AdminVirtual />
            </ProtectedRoute>
          } />
          <Route path="/admindonation" element={
            <ProtectedRoute adminRequired>
              <AdminDonation />
            </ProtectedRoute>
          } />
          <Route path="/admin-home-images" element={
            <ProtectedRoute adminRequired>
              <AdminHomeImages />
            </ProtectedRoute>
          } />
          <Route path="/managestories" element={
            <ProtectedRoute adminRequired>
              <ManageStories />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
export default App;
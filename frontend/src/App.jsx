import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage, AboutPage, ContactPage } from './pages/PublicPages';
import { LoginPage, PatientRegisterPage, DoctorRegisterPage } from './pages/AuthPages';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { VideoConsultationRoom } from './pages/VideoConsultationRoom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <div className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register/patient" element={<PatientRegisterPage />} />
              <Route path="/register/doctor" element={<DoctorRegisterPage />} />

              {/* Patient Routes */}
              <Route
                path="/patient/*"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/*"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Video Consultation */}
              <Route
                path="/consultation/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                    <VideoConsultationRoom />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

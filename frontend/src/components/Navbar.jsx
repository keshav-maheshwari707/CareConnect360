import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, LogOut, Video, Calendar, FileText, MessageSquare, CreditCard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <Activity size={26} className="text-info" />
          <span>CareConnect<span className="text-info">360</span></span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#careNavbar"
          aria-controls="careNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="careNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
            {user?.role === 'PATIENT' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/patient">Patient Portal</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/patient/find-doctors">Find Doctors</Link>
                </li>
              </>
            )}
            {user?.role === 'DOCTOR' && (
              <li className="nav-item">
                <Link className="nav-link" to="/doctor">Doctor Workspace</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 py-1 px-3"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <User size={18} />
                  <span>{user.username} ({user.role})</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={user.role === 'PATIENT' ? '/patient/profile' : '/doctor/profile'}
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={user.role === 'PATIENT' ? '/patient' : '/doctor'}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">Login</Link>
                <Link to="/register/patient" className="btn btn-info btn-sm text-white px-3">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-4 pb-3 mt-auto">
      <div className="container">
        <div className="row gy-3">
          <div className="col-md-5">
            <h5 className="fw-bold d-flex align-items-center gap-2">
              <Activity size={20} className="text-info" /> CareConnect360
            </h5>
            <p className="text-secondary small">
              VirtualCare Telemedicine Platform providing seamless doctor consultations, video appointments, digital prescriptions, and health billing management.
            </p>
          </div>
          <div className="col-md-3">
            <h6>Quick Links</h6>
            <ul className="list-unstyled small">
              <li><Link to="/about" className="text-secondary text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none">Support & Help</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">Patient / Doctor Login</Link></li>
              <li><a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none">Django Administration</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Academic Major Project</h6>
            <p className="text-secondary small mb-1">Master of Computer Applications (MCA)</p>
            <p className="text-secondary small">Secure, Scalable & HIPAA-oriented Telemedicine Architecture.</p>
          </div>
        </div>
        <hr className="border-secondary my-3" />
        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} CareConnect360 Telemedicine Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark">Sign In</h3>
              <p className="text-muted small">Access your CareConnect360 healthcare portal</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top small">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register/patient" className="text-decoration-none fw-semibold">Register as Patient</Link>
              <div className="mt-1">
                <Link to="/register/doctor" className="text-muted small">Register as Doctor</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PatientRegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerPatient(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const msg = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join(' | ');
        setError(msg);
      } else {
        setError('Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card border-0 shadow rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark">Patient Registration</h3>
              <p className="text-muted small">Create your account to consult doctors</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">{error}</div>
            )}
            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 small" role="alert">
                <CheckCircle2 size={18} />
                <span>Account created! Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="e.g. rahul_kumar"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password (min 8 chars, 1 special char)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="SecurePassword123!"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register as Patient'}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top small">
              <span className="text-muted">Already registered? </span>
              <Link to="/login" className="text-decoration-none fw-semibold">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DoctorRegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    license_number: '',
    experience_years: 5,
    consultation_fee: 500,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerDoctor(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const msg = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join(' | ');
        setError(msg);
      } else {
        setError('Doctor registration failed. Please verify all details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
                <Stethoscope className="text-primary" size={28} />
                Doctor Registration
              </h3>
              <p className="text-muted small">Join CareConnect360 Verified Medical Provider Network</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">{error}</div>
            )}
            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 small" role="alert">
                <CheckCircle2 size={18} />
                <span>Doctor registered successfully! Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="e.g. dr_arun"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Password (min 8 chars)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    className="form-control"
                    placeholder="+91 9988776655"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Medical Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-control"
                    placeholder="Cardiology / Dermatology / General Medicine"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Medical Qualifications</label>
                  <input
                    type="text"
                    name="qualification"
                    className="form-control"
                    placeholder="MBBS, MD, MS"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Medical License No.</label>
                  <input
                    type="text"
                    name="license_number"
                    className="form-control"
                    placeholder="MCI-48291"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Years of Experience</label>
                  <input
                    type="number"
                    name="experience_years"
                    min="0"
                    className="form-control"
                    value={formData.experience_years}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Consultation Fee (INR)</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    min="0"
                    className="form-control"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 mt-4 fw-semibold" disabled={loading}>
                {loading ? 'Submitting Details...' : 'Register as Doctor'}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top small">
              <span className="text-muted">Already registered as Doctor? </span>
              <Link to="/login" className="text-decoration-none fw-semibold">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

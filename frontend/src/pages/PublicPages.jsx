import React from 'react';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, Calendar, FileText, MessageSquare, Clock, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-light py-5 border-bottom">
        <div className="container py-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2 rounded-pill fw-semibold">
                Healthcare Reimagined 24/7
              </span>
              <h1 className="display-4 fw-bold text-dark lh-sm mb-3">
                Expert Medical Consultations <span className="text-primary">From Anywhere</span>
              </h1>
              <p className="lead text-muted mb-4">
                Connect with verified board-certified physicians, schedule video consultations, manage your digital prescriptions, and handle medical payments effortlessly.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register/patient" className="btn btn-primary btn-lg px-4 shadow-sm">
                  Consult a Doctor Now <ArrowRight size={18} className="ms-1" />
                </Link>
                <Link to="/register/doctor" className="btn btn-outline-secondary btn-lg px-4">
                  Join as Doctor
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow border-0 rounded-4 overflow-hidden bg-white p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="bg-primary text-white p-3 rounded-circle">
                    <Video size={28} />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Live HD Video Consultations</h5>
                    <small className="text-muted">Powered by secure WebRTC & Jitsi Meet</small>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <h4 className="fw-bold text-primary mb-0">100%</h4>
                      <small className="text-muted">Verified Doctors</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <h4 className="fw-bold text-info mb-0">Instant</h4>
                      <small className="text-muted">Digital Rx & Billing</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Comprehensive Telehealth Modules</h2>
            <p className="text-muted">Built for patients, medical professionals, and clinical administrators.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-3 rounded-4">
                <div className="text-primary mb-3">
                  <Calendar size={36} />
                </div>
                <h5 className="fw-bold">Smart Appointments</h5>
                <p className="text-muted small">
                  Filter doctors by specialization, choose convenient time slots, and track real-time confirmation.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-3 rounded-4">
                <div className="text-info mb-3">
                  <Video size={36} />
                </div>
                <h5 className="fw-bold">Encrypted Video Rooms</h5>
                <p className="text-muted small">
                  Private one-click telemedicine consultations with authenticated doctor-patient access controls.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-3 rounded-4">
                <div className="text-success mb-3">
                  <FileText size={36} />
                </div>
                <h5 className="fw-bold">Digital Prescriptions</h5>
                <p className="text-muted small">
                  Standardized prescriptions with dosage schedules, frequency, duration, and printable receipts.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-3 rounded-4">
                <div className="text-warning mb-3">
                  <MessageSquare size={36} />
                </div>
                <h5 className="fw-bold">Direct Messaging</h5>
                <p className="text-muted small">
                  Follow-up messaging between doctors and registered patients with conversation history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const AboutPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-3">About CareConnect360</h2>
          <p className="lead text-muted mb-4">
            CareConnect360 is an enterprise-grade VirtualCare Telemedicine platform designed to bridge the gap between healthcare seekers and medical specialists.
          </p>
          <div className="card p-4 shadow-sm border-0 rounded-4 mb-4">
            <h5 className="fw-bold text-primary mb-3">Our Mission</h5>
            <p className="text-muted">
              To deliver accessible, reliable, and secure remote healthcare solutions using modern web architectures, real-time video streaming, electronic prescriptions, and automated consultation invoicing.
            </p>
            <h5 className="fw-bold text-primary mb-3 mt-2">Architecture Highlights</h5>
            <ul className="text-muted">
              <li>Role-based access control protecting medical confidentiality.</li>
              <li>RESTful API backends powered by Django and MySQL.</li>
              <li>Jitsi Meet WebRTC integration for dynamic telemedicine rooms.</li>
              <li>Simulated PCI-compliant billing and invoice workflows.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h2 className="fw-bold mb-3">Contact Support</h2>
          <p className="text-muted mb-4">Have questions about your account or consultations? Reach out to us.</p>
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our support team will get back to you shortly.'); }}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Your Name</label>
                <input type="text" className="form-control" required placeholder="John Doe" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input type="email" className="form-control" required placeholder="john@example.com" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Subject</label>
                <input type="text" className="form-control" required placeholder="Appointment inquiry..." />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                <textarea className="form-control" rows="4" required placeholder="Describe your issue..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary px-4">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Video, FileText, MessageSquare, CreditCard, User, 
  Search, Clock, Stethoscope, CheckCircle, XCircle, AlertCircle, Printer
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/patient', label: 'Overview', icon: <User size={18} /> },
    { to: '/patient/find-doctors', label: 'Find Doctors', icon: <Search size={18} /> },
    { to: '/patient/appointments', label: 'My Appointments', icon: <Calendar size={18} /> },
    { to: '/patient/prescriptions', label: 'My Prescriptions', icon: <FileText size={18} /> },
    { to: '/patient/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { to: '/patient/billing', label: 'Billing & Invoices', icon: <CreditCard size={18} /> },
    { to: '/patient/profile', label: 'Medical Profile', icon: <User size={18} /> },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style={{ top: '80px' }}>
            <div className="text-center p-3 border-bottom mb-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 50, height: 50 }}>
                <User size={24} />
              </div>
              <h6 className="fw-bold mb-0">{user?.username}</h6>
              <span className="badge bg-info-subtle text-info text-uppercase font-monospace small">Patient</span>
            </div>

            <nav className="nav flex-column nav-pills gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link d-flex align-items-center gap-2 py-2 px-3 rounded-3 ${
                    location.pathname === link.to ? 'active bg-primary text-white' : 'text-secondary'
                  }`}
                >
                  {link.icon}
                  <span className="small fw-semibold">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9 col-xl-10">
          <Routes>
            <Route index element={<PatientOverview />} />
            <Route path="find-doctors" element={<FindDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route path="billing" element={<PatientBilling />} />
            <Route path="profile" element={<PatientProfileView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Overview
const PatientOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get('/appointments/').then((res) => setAppointments(res.data)).catch(() => {});
    api.get('/prescriptions/').then((res) => setPrescriptions(res.data)).catch(() => {});
    api.get('/billing/invoices/').then((res) => setInvoices(res.data)).catch(() => {});
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING');
  const upcomingAppointments = appointments.filter((a) => a.status === 'ACCEPTED' || a.status === 'PENDING');

  return (
    <div>
      <h4 className="fw-bold mb-4">Patient Dashboard</h4>
      
      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-semibold">Active Appointments</small>
                <h3 className="fw-bold mb-0 text-primary">{upcomingAppointments.length}</h3>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <Calendar size={24} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-semibold">Prescriptions Received</small>
                <h3 className="fw-bold mb-0 text-success">{prescriptions.length}</h3>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-semibold">Pending Invoices</small>
                <h3 className="fw-bold mb-0 text-warning">{pendingInvoices.length}</h3>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <CreditCard size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h5 className="fw-bold mb-1">Need a Consultation Today?</h5>
            <p className="mb-0 text-white-50">Browse our certified medical professionals across Cardiology, Dermatology, and more.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/patient/find-doctors" className="btn btn-info text-white fw-semibold">Find a Doctor</Link>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <h5 className="fw-bold mb-3">Upcoming Consultations</h5>
        {upcomingAppointments.length === 0 ? (
          <p className="text-muted small">No upcoming appointments scheduled.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="fw-semibold">Dr. {appt.doctor_details?.full_name}</div>
                      <small className="text-muted">{appt.doctor_details?.specialization || 'Physician'}</small>
                    </td>
                    <td>{appt.appointment_date} at {appt.appointment_time}</td>
                    <td>
                      <span className={`badge ${appt.status === 'ACCEPTED' ? 'bg-success' : 'bg-warning'} text-white`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      {appt.status === 'ACCEPTED' && (
                        <Link to={`/consultation/${appt.id}`} className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                          <Video size={14} /> Join Call
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Find & Book Doctors
const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00:00');
  const [symptoms, setSymptoms] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = (query = '') => {
    api.get(`/accounts/doctors/?search=${encodeURIComponent(query)}`).then((res) => {
      setDoctors(res.data);
    });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    try {
      await api.post('/appointments/', {
        doctor: selectedDoctor.id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        symptoms: symptoms,
      });
      setMessage('Appointment booked successfully! Invoices generated.');
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 1500);
    } catch (err) {
      alert('Error booking appointment. Please check details.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Browse Verified Doctors</h4>
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="row g-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="col-md-6 col-xl-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-column">
              <div className="d-flex gap-3 align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">{doc.name}</h6>
                  <span className="badge bg-info-subtle text-info small">{doc.specialization}</span>
                </div>
              </div>
              <div className="small text-muted mb-2">
                <div><strong>Qualification:</strong> {doc.qualification}</div>
                <div><strong>Experience:</strong> {doc.experience_years} years</div>
                <div><strong>License:</strong> {doc.license_number}</div>
              </div>
              <p className="text-secondary small flex-grow-1">{doc.bio || 'Available for telemedicine consultations and prescriptions.'}</p>
              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                <span className="fw-bold text-primary">₹{doc.consultation_fee}</span>
                <button
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setBookingDate(new Date().toISOString().split('T')[0]);
                  }}
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Book with {selectedDoctor.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDoctor(null)}></button>
              </div>
              <form onSubmit={handleBook}>
                <div className="modal-body">
                  <div className="alert alert-info py-2 small">
                    Consultation Fee: <strong>₹{selectedDoctor.consultation_fee}</strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Consultation Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Preferred Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Symptoms & Health Concerns</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Briefly describe what you're experiencing..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedDoctor(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Booking</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Appointments
const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppts = () => {
    api.get('/appointments/').then((res) => setAppointments(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAppts();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/status/`, { status: 'CANCELLED' });
      fetchAppts();
    } catch (err) {
      alert('Could not cancel appointment.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h4 className="fw-bold mb-4">My Appointment Bookings</h4>
      {appointments.length === 0 ? (
        <div className="text-center py-5 text-muted">No appointments found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>
                    <div className="fw-semibold">Dr. {a.doctor_details?.full_name}</div>
                    <small className="text-muted">{a.doctor_details?.specialization}</small>
                  </td>
                  <td>{a.appointment_date} <br/><small className="text-muted">{a.appointment_time}</small></td>
                  <td><span className="small text-truncate d-inline-block" style={{ maxWidth: 200 }}>{a.symptoms || 'General checkup'}</span></td>
                  <td>
                    <span className={`badge ${
                      a.status === 'ACCEPTED' ? 'bg-success' :
                      a.status === 'PENDING' ? 'bg-warning' :
                      a.status === 'COMPLETED' ? 'bg-info' : 'bg-secondary'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {a.status === 'ACCEPTED' && (
                        <Link to={`/consultation/${a.id}`} className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                          <Video size={14} /> Join
                        </Link>
                      )}
                      {(a.status === 'PENDING' || a.status === 'ACCEPTED') && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(a.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Prescriptions
const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    api.get('/prescriptions/').then((res) => setPrescriptions(res.data)).catch(() => {});
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h4 className="fw-bold mb-4">My Medical Prescriptions</h4>
      {prescriptions.length === 0 ? (
        <div className="text-center py-5 text-muted">No prescriptions issued yet.</div>
      ) : (
        <div className="row g-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="col-md-6">
              <div className="card p-3 border rounded-3 shadow-none">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary">Prescription #{rx.id}</span>
                  <small className="text-muted">{new Date(rx.created_at).toLocaleDateString()}</small>
                </div>
                <h6 className="fw-bold mb-1">Prescribed by Dr. {rx.doctor_details?.full_name}</h6>
                <p className="text-muted small mb-2"><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                <div className="mb-3">
                  <small className="fw-semibold">Medicines ({rx.medicines?.length}):</small>
                  <ul className="small text-muted mb-0 ps-3">
                    {rx.medicines?.map((m, idx) => (
                      <li key={idx}>{m.medicine_name} - {m.dosage} ({m.frequency})</li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-1" onClick={() => setSelectedRx(rx)}>
                  <Printer size={14} /> View & Print Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Prescription Modal */}
      {selectedRx && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" id="printable-rx">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <h4 className="fw-bold text-primary mb-0">CareConnect360</h4>
                  <small className="text-muted">Digital Telemedicine Prescription</small>
                </div>
                <div className="text-end">
                  <div className="fw-bold">Rx #{selectedRx.id}</div>
                  <small className="text-muted">Date: {new Date(selectedRx.created_at).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="row mb-3 small">
                <div className="col-6">
                  <strong>Doctor:</strong> Dr. {selectedRx.doctor_details?.full_name}<br />
                  <strong>Specialization:</strong> {selectedRx.doctor_details?.specialization || 'Clinical Specialist'}
                </div>
                <div className="col-6 text-end">
                  <strong>Patient:</strong> {selectedRx.patient_details?.full_name}<br />
                  <strong>Patient Email:</strong> {selectedRx.patient_details?.email}
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 mb-3">
                <h6 className="fw-bold mb-1">Diagnosis:</h6>
                <p className="mb-0 small">{selectedRx.diagnosis}</p>
              </div>

              <h6 className="fw-bold mb-2">Prescribed Medicines:</h6>
              <div className="table-responsive mb-3">
                <table className="table table-bordered small">
                  <thead className="table-light">
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines?.map((m, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{m.medicine_name}</td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                        <td>{m.instructions || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRx.general_advice && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-1">Doctor's Advice:</h6>
                  <p className="small text-muted">{selectedRx.general_advice}</p>
                </div>
              )}

              <div className="d-flex justify-content-between border-top pt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRx(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Messages
const PatientMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const { user } = useAuth();

  const fetchConversations = () => {
    api.get('/communication/conversations/').then((res) => {
      setConversations(res.data);
      if (!activeConv && res.data.length > 0) {
        setActiveConv(res.data[0]);
      }
    });
  };

  const fetchMessages = (convId) => {
    if (!convId) return;
    api.get(`/communication/conversations/${convId}/`).then((res) => {
      setMessages(res.data.messages);
    });
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (activeConv) fetchMessages(activeConv.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConv]);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv.id);
  }, [activeConv]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    try {
      await api.post(`/communication/conversations/${activeConv.id}/`, { content: newMsg });
      setNewMsg('');
      fetchMessages(activeConv.id);
    } catch (err) {
      alert('Could not send message.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div className="row g-0" style={{ height: '600px' }}>
        {/* Chat List */}
        <div className="col-md-4 border-end h-100 overflow-auto p-3">
          <h5 className="fw-bold mb-3">Messages</h5>
          {conversations.length === 0 ? (
            <p className="text-muted small">No conversations started yet.</p>
          ) : (
            <div className="list-group list-group-flush">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 p-2 text-start ${
                    activeConv?.id === c.id ? 'bg-primary-subtle' : ''
                  }`}
                >
                  <div className="fw-bold small">Dr. {c.doctor_details?.full_name}</div>
                  <div className="text-muted small text-truncate">{c.last_message?.content || 'Started consultation'}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="col-md-8 h-100 d-flex flex-column">
          {activeConv ? (
            <>
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                <div>
                  <h6 className="fw-bold mb-0">Dr. {activeConv.doctor_details?.full_name}</h6>
                  <small className="text-muted">{activeConv.doctor_details?.specialization || 'Consultant'}</small>
                </div>
              </div>

              <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-3 small ${
                      m.sender === user?.id
                        ? 'bg-primary text-white align-self-end text-end'
                        : 'bg-light text-dark align-self-start'
                    }`}
                    style={{ maxWidth: '75%' }}
                  >
                    <div>{m.content}</div>
                    <div className="text-white-50 small mt-1" style={{ fontSize: '0.7rem' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="p-3 border-top d-flex gap-2 bg-white">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-4">Send</button>
              </form>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Billing
const PatientBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);

  const fetchInvoices = () => {
    api.get('/billing/invoices/').then((res) => setInvoices(res.data));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await api.post(`/billing/invoices/${selectedInvoice.id}/pay/`, { payment_method: paymentMethod });
      alert('Payment successful!');
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert('Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h4 className="fw-bold mb-4">Invoices & Billing History</h4>
      {invoices.length === 0 ? (
        <div className="text-center py-5 text-muted">No invoices generated.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="fw-semibold">{inv.invoice_number}</td>
                  <td>{inv.doctor_details?.name}</td>
                  <td className="fw-bold">₹{inv.amount}</td>
                  <td>
                    <span className={`badge ${inv.status === 'PAID' ? 'bg-success' : 'bg-warning'} text-white`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td>
                    {inv.status === 'PENDING' ? (
                      <button className="btn btn-sm btn-success" onClick={() => setSelectedInvoice(inv)}>
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-success small fw-semibold">Paid in Full</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">CareConnect360 Payment Gateway</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
              </div>
              <form onSubmit={handlePay}>
                <div className="modal-body">
                  <div className="alert alert-secondary py-2 small">
                    Invoice: <strong>{selectedInvoice.invoice_number}</strong> | Amount: <strong>₹{selectedInvoice.amount}</strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Choose Payment Method</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="UPI">UPI / QR Code (Google Pay, PhonePe)</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="NETBANKING">Net Banking</option>
                      <option value="SIMULATED">Simulated Test Mode</option>
                    </select>
                  </div>
                  <div className="p-3 bg-light rounded-3 text-muted small">
                    This is an academic simulated payment gateway. Clicking proceed will securely authenticate and mark the invoice as PAID.
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={paying}>
                    {paying ? 'Processing...' : `Pay ₹${selectedInvoice.amount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile
const PatientProfileView = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [profile, setProfile] = useState({
    date_of_birth: '',
    gender: 'MALE',
    blood_group: 'O+',
    address: '',
    phone_number: user?.phone_number || '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.patient_profile) {
      setProfile({
        date_of_birth: user.patient_profile.date_of_birth || '',
        gender: user.patient_profile.gender || 'MALE',
        blood_group: user.patient_profile.blood_group || 'O+',
        address: user.patient_profile.address || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/accounts/me/', profile);
      await fetchCurrentUser();
      setMsg('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: 700 }}>
      <h4 className="fw-bold mb-3">Patient Health Profile</h4>
      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={profile.date_of_birth}
              onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Gender</label>
            <select
              className="form-select"
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Blood Group</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. O+, B+, A-"
              value={profile.blood_group}
              onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Phone Number</label>
            <input
              type="text"
              className="form-control"
              value={profile.phone_number}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold small">Residential Address</label>
            <textarea
              className="form-control"
              rows="3"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            ></textarea>
          </div>
        </div>
        <button type="submit" className="btn btn-primary px-4 mt-3">Save Profile</button>
      </form>
    </div>
  );
};

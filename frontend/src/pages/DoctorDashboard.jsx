import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Video, FileText, MessageSquare, CreditCard, User, 
  Stethoscope, CheckCircle, XCircle, AlertCircle, Plus, Trash2, Printer
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/doctor', label: 'Doctor Overview', icon: <Stethoscope size={18} /> },
    { to: '/doctor/appointments', label: 'Appointments & Schedule', icon: <Calendar size={18} /> },
    { to: '/doctor/create-prescription', label: 'New Prescription', icon: <Plus size={18} /> },
    { to: '/doctor/prescriptions', label: 'Prescription Records', icon: <FileText size={18} /> },
    { to: '/doctor/messages', label: 'Patient Messages', icon: <MessageSquare size={18} /> },
    { to: '/doctor/earnings', label: 'Billing & Earnings', icon: <CreditCard size={18} /> },
    { to: '/doctor/profile', label: 'Professional Profile', icon: <User size={18} /> },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style={{ top: '80px' }}>
            <div className="text-center p-3 border-bottom mb-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 50, height: 50 }}>
                <Stethoscope size={24} />
              </div>
              <h6 className="fw-bold mb-0">Dr. {user?.username}</h6>
              <span className="badge bg-success-subtle text-success text-uppercase font-monospace small">Physician</span>
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

        {/* Main Workspace Area */}
        <div className="col-lg-9 col-xl-10">
          <Routes>
            <Route index element={<DoctorOverview />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="create-prescription" element={<CreatePrescription />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="messages" element={<DoctorMessages />} />
            <Route path="earnings" element={<DoctorEarnings />} />
            <Route path="profile" element={<DoctorProfileView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Doctor Overview
const DoctorOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get('/appointments/').then((res) => setAppointments(res.data)).catch(() => {});
    api.get('/prescriptions/').then((res) => setPrescriptions(res.data)).catch(() => {});
    api.get('/billing/invoices/').then((res) => setInvoices(res.data)).catch(() => {});
  }, []);

  const pendingRequests = appointments.filter((a) => a.status === 'PENDING');
  const upcomingAppts = appointments.filter((a) => a.status === 'ACCEPTED');
  const totalEarned = invoices.filter((i) => i.status === 'PAID').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div>
      <h4 className="fw-bold mb-4">Doctor Clinical Workspace</h4>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-semibold">Pending Requests</small>
                <h3 className="fw-bold mb-0 text-warning">{pendingRequests.length}</h3>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-semibold">Confirmed Sessions</small>
                <h3 className="fw-bold mb-0 text-primary">{upcomingAppts.length}</h3>
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
                <small className="text-muted fw-semibold">Total Revenue (₹)</small>
                <h3 className="fw-bold mb-0 text-success">₹{totalEarned.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <CreditCard size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <h5 className="fw-bold mb-3">Pending Appointment Requests</h5>
        {pendingRequests.length === 0 ? (
          <p className="text-muted small">No pending requests awaiting your approval.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Symptoms</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="fw-semibold">{appt.patient_details?.full_name}</div>
                      <small className="text-muted">{appt.patient_details?.email}</small>
                    </td>
                    <td>{appt.appointment_date} at {appt.appointment_time}</td>
                    <td><span className="small text-truncate d-inline-block" style={{ maxWidth: 200 }}>{appt.symptoms || 'General consult'}</span></td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to="/doctor/appointments" className="btn btn-sm btn-primary">
                          Review in Schedule
                        </Link>
                      </div>
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

// Appointments
const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppts = () => {
    api.get('/appointments/').then((res) => setAppointments(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAppts();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status/`, { status });
      fetchAppts();
    } catch (err) {
      alert('Could not update appointment status.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h4 className="fw-bold mb-4">Consultation Appointments & Requests</h4>
      {appointments.length === 0 ? (
        <div className="text-center py-5 text-muted">No appointments found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Appt #</th>
                <th>Patient Name</th>
                <th>Contact</th>
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
                  <td><strong>{a.patient_details?.full_name}</strong></td>
                  <td>{a.patient_details?.phone_number || a.patient_details?.email}</td>
                  <td>{a.appointment_date} <br/><small className="text-muted">{a.appointment_time}</small></td>
                  <td><span className="small text-truncate d-inline-block" style={{ maxWidth: 200 }}>{a.symptoms || 'General'}</span></td>
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
                    <div className="d-flex flex-wrap gap-1">
                      {a.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(a.id, 'ACCEPTED')}>Accept</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(a.id, 'REJECTED')}>Reject</button>
                        </>
                      )}
                      {a.status === 'ACCEPTED' && (
                        <>
                          <Link to={`/consultation/${a.id}`} className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                            <Video size={14} /> Join Room
                          </Link>
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange(a.id, 'COMPLETED')}>
                            Mark Done
                          </button>
                        </>
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

// Create Digital Prescription
const CreatePrescription = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [generalAdvice, setGeneralAdvice] = useState('');
  const [medicines, setMedicines] = useState([
    { medicine_name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }
  ]);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/appointments/').then((res) => {
      // filter only accepted or completed
      const valid = res.data.filter((a) => a.status === 'ACCEPTED' || a.status === 'COMPLETED');
      setAppointments(valid);
      if (valid.length > 0) {
        setSelectedApptId(valid[0].id);
      }
    });
  }, []);

  const addMedicine = () => {
    setMedicines([...medicines, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      alert('Please select an appointment.');
      return;
    }
    const appt = appointments.find((a) => a.id === parseInt(selectedApptId));
    if (!appt) return;

    try {
      await api.post('/prescriptions/', {
        appointment: appt.id,
        patient: appt.patient,
        diagnosis,
        general_advice: generalAdvice,
        medicines,
      });
      setSuccess('Prescription created successfully!');
      setTimeout(() => navigate('/doctor/prescriptions'), 1500);
    } catch (err) {
      alert('Error creating prescription.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: 850 }}>
      <h4 className="fw-bold mb-3">Issue Digital Prescription</h4>
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold small">Select Patient / Consultation</label>
          <select
            className="form-select"
            value={selectedApptId}
            onChange={(e) => setSelectedApptId(e.target.value)}
            required
          >
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                Appt #{a.id} - Patient: {a.patient_details?.full_name} ({a.appointment_date})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Clinical Diagnosis</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="e.g. Acute Upper Respiratory Tract Infection"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-semibold small mb-0">Prescribed Medicines</label>
            <button type="button" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={addMedicine}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          {medicines.map((m, idx) => (
            <div key={idx} className="card p-3 mb-2 bg-light border-0 rounded-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={m.medicine_name}
                    onChange={(e) => updateMedicine(idx, 'medicine_name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Dosage (500mg)"
                    value={m.dosage}
                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Freq (1-0-1)"
                    value={m.frequency}
                    onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Duration (5 days)"
                    value={m.duration}
                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Instructions (After food)"
                    value={m.instructions}
                    onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                  />
                </div>
                <div className="col-md-1 text-end">
                  <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeMedicine(idx)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">General Advice & Lifestyle Recommendations</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="e.g. Drink plenty of warm fluids, rest for 3 days."
            value={generalAdvice}
            onChange={(e) => setGeneralAdvice(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary px-4">Save & Issue Prescription</button>
      </form>
    </div>
  );
};

// Prescription List
const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    api.get('/prescriptions/').then((res) => setPrescriptions(res.data)).catch(() => {});
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h4 className="fw-bold mb-4">Issued Prescriptions Log</h4>
      {prescriptions.length === 0 ? (
        <div className="text-center py-5 text-muted">No prescriptions issued yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Rx #</th>
                <th>Patient</th>
                <th>Diagnosis</th>
                <th>Medicines</th>
                <th>Date Issued</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">#{p.id}</td>
                  <td><strong>{p.patient_details?.full_name}</strong></td>
                  <td>{p.diagnosis}</td>
                  <td>
                    <small>
                      {p.medicines?.map((m) => m.medicine_name).join(', ')}
                    </small>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Messages
const DoctorMessages = () => {
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
        <div className="col-md-4 border-end h-100 overflow-auto p-3">
          <h5 className="fw-bold mb-3">Patient Inquiries</h5>
          {conversations.length === 0 ? (
            <p className="text-muted small">No patient messages yet.</p>
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
                  <div className="fw-bold small">{c.patient_details?.full_name}</div>
                  <div className="text-muted small text-truncate">{c.last_message?.content || 'No messages'}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-md-8 h-100 d-flex flex-column">
          {activeConv ? (
            <>
              <div className="p-3 border-bottom bg-light">
                <h6 className="fw-bold mb-0">Patient: {activeConv.patient_details?.full_name}</h6>
                <small className="text-muted">{activeConv.patient_details?.email}</small>
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
                  placeholder="Reply to patient..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-4">Send</button>
              </form>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Select a conversation to reply
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Earnings
const DoctorEarnings = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get('/billing/invoices/').then((res) => setInvoices(res.data));
  }, []);

  const total = invoices.filter((i) => i.status === 'PAID').reduce((sum, curr) => sum + parseFloat(curr.amount), 0);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Consultation Earnings</h4>
          <small className="text-muted">Invoiced telemedicine patient sessions</small>
        </div>
        <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 text-end">
          <small className="fw-semibold">Total Realized Revenue</small>
          <h4 className="fw-bold mb-0">₹{total.toFixed(2)}</h4>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Consultation Fee</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.patient_details?.full_name}</td>
                <td className="fw-bold">₹{inv.amount}</td>
                <td>
                  <span className={`badge ${inv.status === 'PAID' ? 'bg-success' : 'bg-warning'} text-white`}>
                    {inv.status}
                  </span>
                </td>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Profile
const DoctorProfileView = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [profile, setProfile] = useState({
    specialization: '',
    qualification: '',
    license_number: '',
    experience_years: 0,
    consultation_fee: 500,
    bio: '',
    phone_number: user?.phone_number || '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.doctor_profile) {
      setProfile({
        specialization: user.doctor_profile.specialization || '',
        qualification: user.doctor_profile.qualification || '',
        license_number: user.doctor_profile.license_number || '',
        experience_years: user.doctor_profile.experience_years || 0,
        consultation_fee: user.doctor_profile.consultation_fee || 500,
        bio: user.doctor_profile.bio || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/accounts/me/', profile);
      await fetchCurrentUser();
      setMsg('Professional profile updated!');
    } catch (err) {
      alert('Error updating profile.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: 750 }}>
      <h4 className="fw-bold mb-3">Doctor Professional Profile</h4>
      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Specialization</label>
            <input
              type="text"
              className="form-control"
              value={profile.specialization}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Qualification</label>
            <input
              type="text"
              className="form-control"
              value={profile.qualification}
              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Medical License Number</label>
            <input
              type="text"
              className="form-control"
              value={profile.license_number}
              disabled
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold small">Experience (Years)</label>
            <input
              type="number"
              className="form-control"
              value={profile.experience_years}
              onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold small">Consultation Fee (₹)</label>
            <input
              type="number"
              className="form-control"
              value={profile.consultation_fee}
              onChange={(e) => setProfile({ ...profile, consultation_fee: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold small">Professional Bio</label>
            <textarea
              className="form-control"
              rows="3"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            ></textarea>
          </div>
        </div>
        <button type="submit" className="btn btn-primary px-4 mt-3">Update Profile</button>
      </form>
    </div>
  );
};

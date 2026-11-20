import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const VideoConsultationRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const [roomData, setRoomData] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    let apiInstance = null;

    const initConsultation = async () => {
      try {
        const res = await api.post(`/appointments/${appointmentId}/join/`);
        setRoomData(res.data);

        // Load Jitsi Meet External API script dynamically if not present
        if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = () => loadJitsi(res.data);
          document.body.appendChild(script);
        } else {
          loadJitsi(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to enter video consultation room.');
      } finally {
        setLoading(false);
      }
    };

    const loadJitsi = (data) => {
      if (!jitsiContainerRef.current) return;
      jitsiContainerRef.current.innerHTML = '';

      const domain = 'meet.jit.si';
      const options = {
        roomName: data.room_name,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: data.user_display_name,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'raisehand',
            'videoquality', 'filmstrip', 'tileview'
          ],
        },
      };

      try {
        apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        apiInstance.addEventListeners({
          readyToClose: () => {
            navigate(-1);
          },
        });
      } catch (e) {
        console.error('Jitsi initialization error:', e);
      }
    };

    initConsultation();

    return () => {
      if (apiInstance) {
        apiInstance.dispose();
      }
    };
  }, [appointmentId, navigate]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="spinner-border text-info mb-3" role="status"></div>
        <h5>Connecting securely to consultation room...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm p-4 mx-auto border-danger" style={{ maxWidth: 500 }}>
          <ShieldAlert size={48} className="text-danger mx-auto mb-3" />
          <h4 className="fw-bold">Consultation Access Restricted</h4>
          <p className="text-muted">{error}</p>
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="me-1" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white">
      <div className="d-flex justify-content-between align-items-center px-4 py-2 bg-secondary bg-opacity-25 border-bottom border-secondary">
        <div className="d-flex align-items-center gap-2">
          <Video className="text-info" size={20} />
          <span className="fw-semibold">CareConnect360 Encrypted Telemedicine Session</span>
          <span className="badge bg-success ms-2">Live Session</span>
        </div>
        <button className="btn btn-outline-light btn-sm" onClick={() => navigate(-1)}>
          Leave Session
        </button>
      </div>

      <div className="flex-grow-1 position-relative" ref={jitsiContainerRef} style={{ minHeight: '500px' }}>
      </div>
    </div>
  );
};

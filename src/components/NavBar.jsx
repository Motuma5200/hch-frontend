import React, { useEffect, useState } from 'react';
import { Nav, Navbar, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getDoctors, getChatMessages } from '../services/Api';
import heartLogo from '../assets/heartimage.png'; 

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const role = localStorage.getItem('role') || (userStr ? JSON.parse(userStr).role : null);
  const [hasNewDoctorMessage, setHasNewDoctorMessage] = useState(false);

  const getDoctorLastSeen = (doctorId) => {
    const raw = localStorage.getItem(`client_chat_last_seen_${doctorId}`);
    return raw ? Number(raw) : 0;
  };

  const setHasNewDoctorMessageFlag = (value) => {
    if (value) {
      localStorage.setItem('client_has_new_doctor_message', '1');
    } else {
      localStorage.removeItem('client_has_new_doctor_message');
    }
    window.dispatchEvent(new CustomEvent('doctorMessageUpdate'));
  };

  useEffect(() => {
    const updateFlag = () => {
      setHasNewDoctorMessage(!!localStorage.getItem('client_has_new_doctor_message'));
    };

    updateFlag();
    window.addEventListener('storage', updateFlag);
    window.addEventListener('doctorMessageUpdate', updateFlag);

    return () => {
      window.removeEventListener('storage', updateFlag);
      window.removeEventListener('doctorMessageUpdate', updateFlag);
    };
  }, []);

  useEffect(() => {
    if (role !== 'client' || !token) return;

    let isMounted = true;
    let intervalId;

    const checkForNewDoctorMessages = async () => {
      try {
        const response = await getDoctors();
        const doctors = response.data || [];

        let anyNew = false;

        await Promise.all(doctors.map(async (doc) => {
          try {
            const res = await getChatMessages(doc.id);
            const msgs = res.data || [];
            const lastDocMsg = [...msgs].reverse().find((m) => m.sender_type === 'doctor');
            if (!lastDocMsg) return;

            const lastDocTs = new Date(lastDocMsg.created_at).getTime();
            const lastSeen = getDoctorLastSeen(doc.id);
            if (lastDocTs > lastSeen) {
              anyNew = true;
            }
          } catch {
            // ignore per-doctor failures
          }
        }));

        if (!isMounted) return;
        setHasNewDoctorMessage(anyNew);
        setHasNewDoctorMessageFlag(anyNew);
      } catch {
        // ignore
      }
    };

    checkForNewDoctorMessages();
    intervalId = setInterval(checkForNewDoctorMessages, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [role, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="mb-4">
      {/* Dynamic Keyframe Animation Styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
        .navbar-brand-logo {
          background-size: 300% 300% !important;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .navbar-brand-logo:hover {
          transform: scale(1.03);
          filter: drop-shadow(0 0 8px rgba(0, 245, 212, 0.6));
        }
      `}</style>

      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="fw-bold fs-4 d-flex align-items-center gap-2 navbar-brand navbar-brand-logo"
          style={{
            background: 'linear-gradient(90deg, #FFFFFF, #00F5D4, #7FF8E6, #FFFFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.8px',
            animation: 'shimmer 4s ease infinite',
            textTransform: 'uppercase', 
          }}
        >
          {/* UPDATED STYLE HERE: The image itself is visible, but the container border is gone */}
          <img 
            src={heartLogo} 
            alt="Health Hub Logo"
            style={{ 
              width: '40px',          
              height: '40px',         
              objectFit: 'contain',
              display: 'inline-block',
              animation: 'pulse 2.5s infinite',
              // Ensured no border, padding, or background on the img itself
              border: 'none',
              padding: '0',
              background: 'transparent',
            }} 
          />
          Health Hub
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-3">
            <Nav.Link as={NavLink} to="/" className="fs-5 text-white">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/learn" className="fs-5 text-white">Learn</Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="fs-5 text-white">About</Nav.Link>
            <Nav.Link as={NavLink} to="/ai" className="fs-5 text-white">AI</Nav.Link>
            <Nav.Link as={NavLink} to="/facilities" className="fs-5 text-white">Nearby clinics</Nav.Link>
            {token && <Nav.Link as={NavLink} to="/dashboard" className="fs-5 text-white">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {token ? (
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="fs-5 text-white px-3">Login</Nav.Link>
            )}
          </Nav>
          {!token && <Nav.Link as={NavLink} to="/signup" className="fs-5 text-white">Sign up</Nav.Link>}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
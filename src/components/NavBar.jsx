import React, { useEffect, useState } from 'react';
import { Nav, Navbar, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getDoctors, getChatMessages } from '../services/Api';

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
    window.location.reload(); // Ensures the navbar updates immediately
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">Health Hub</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-3">
            <Nav.Link as={NavLink} to="/" className="fs-5 text-white">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/learn" className="fs-5 text-white">Learn</Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="fs-5 text-white">About</Nav.Link>
            <Nav.Link as={NavLink} to="/ai" className="fs-5 text-white">AI</Nav.Link>
            <Nav.Link as={NavLink} to="/facilities" className="fs-5 text-white">Nearby clinics</Nav.Link>
            {token && <Nav.Link as={NavLink} to="/dashboard" className="fs-5 text-white">Dashboard</Nav.Link>}
            {token && role === 'client' && (
              <Nav.Link as={NavLink} to="/contact-doctor" className="fs-5 text-white">
                Contact Doctor
                {hasNewDoctorMessage && (
                  <Badge bg="danger" pill className="ms-2">
                    New
                  </Badge>
                )}
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {token ? (
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="fs-5 text-white">Login</Nav.Link>
            )}
          </Nav>
          {!token && <Nav.Link as={NavLink} to="/signup" className="fs-5 text-white">Sign up</Nav.Link>}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

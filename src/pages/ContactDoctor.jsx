import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { getDoctors, sendChatMessage, getChatMessages } from '../services/Api';
import WebSocketService from '../services/WebSocketService';

const ContactDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState('');
  const [unreadDoctors, setUnreadDoctors] = useState({});
  const [notification, setNotification] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const notificationTimer = useRef(null);
  const messageCallbackRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getDoctorLastSeen = (doctorId) => {
    const raw = localStorage.getItem(`client_chat_last_seen_${doctorId}`);
    return raw ? Number(raw) : 0;
  };

  const setDoctorLastSeen = (doctorId, timestamp = Date.now()) => {
    localStorage.setItem(`client_chat_last_seen_${doctorId}`, String(timestamp));
  };

  const setUnreadFlag = () => {
    localStorage.setItem('client_has_new_doctor_message', '1');
    window.dispatchEvent(new CustomEvent('doctorMessageUpdate'));
  };

  const clearUnreadFlag = () => {
    localStorage.removeItem('client_has_new_doctor_message');
    window.dispatchEvent(new CustomEvent('doctorMessageUpdate'));
  };

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setFetchingDoctors(true);
        const response = await getDoctors();
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again.');
        console.error('Error fetching doctors:', err);
      } finally {
        setFetchingDoctors(false);
      }
    };

    fetchDoctors();

    // Connect to WebSocket
    if (user.id) {
      WebSocketService.connect(user.id, 'client');

      // Handle connection status
      WebSocketService.onConnectionChange((connected) => {
        setIsConnected(connected);
      });

      // Handle incoming messages
      messageCallbackRef.current = (data) => {
        if (data.sender_type === 'doctor' && data.sender_id === selectedDoctor?.id) {
          // Add new message to chat
          const newMsg = {
            id: Date.now(),
            sender: 'Doctor',
            text: data.message,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, newMsg]);

          // Mark as read
          setDoctorLastSeen(selectedDoctor.id);
          setUnreadDoctors(prev => ({ ...prev, [selectedDoctor.id]: false }));
          clearUnreadFlag();
        }
      };

      WebSocketService.onMessage(messageCallbackRef.current);
    }

    return () => {
      if (messageCallbackRef.current) {
        WebSocketService.removeMessageCallback(messageCallbackRef.current);
      }
      WebSocketService.disconnect();
    };
  }, []);

  // Periodically check for new doctor messages
  useEffect(() => {
    const checkUnread = async () => {
      if (doctors.length === 0) return;

      const unreadMap = {};
      let anyNew = false;

      await Promise.all(doctors.map(async (doc) => {
        try {
          const response = await getChatMessages(doc.id);
          const msgs = response.data || [];
          const lastDocMsg = [...msgs].reverse().find((m) => m.sender_type === 'doctor');
          if (!lastDocMsg) return;

          const lastDocTs = new Date(lastDocMsg.created_at).getTime();

          // If the user is currently viewing this doctor, treat it as read and update last seen
          if (selectedDoctor?.id === doc.id) {
            setDoctorLastSeen(doc.id, lastDocTs);
            return;
          }

          const lastSeen = getDoctorLastSeen(doc.id);
          const isUnread = lastDocTs > lastSeen;
          if (isUnread) {
            unreadMap[doc.id] = true;
            anyNew = true;
          }
        } catch {
          // ignore per-doctor failures
        }
      }));

      setUnreadDoctors(unreadMap);
      if (anyNew) {
        setUnreadFlag();
        setNotification('You have new messages from your doctor(s).');
        clearTimeout(notificationTimer.current);
        notificationTimer.current = setTimeout(() => setNotification(''), 6000);
      } else {
        clearUnreadFlag();
      }
    };

    const interval = setInterval(checkUnread, 20000);
    checkUnread();

    return () => {
      clearInterval(interval);
      clearTimeout(notificationTimer.current);
    };
  }, [doctors]);

  // Fetch chat messages when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    let isMounted = true;
    const fetchMessages = async () => {
      if (!isMounted) return;
      try {
        setLoading(true);
        const response = await getChatMessages(selectedDoctor.id);
        if (!isMounted) return;

        const msgs = response.data || [];
        setMessages(msgs.map((msg, index) => ({
          id: index + 1,
          sender: msg.sender_type === 'client' ? 'You' : 'Doctor',
          text: msg.message,
          timestamp: new Date(msg.created_at).toLocaleTimeString()
        })));

        // Mark this conversation as read (use the doctor's latest message timestamp to avoid clock drift issues)
        const lastDocMsg = [...msgs].reverse().find((m) => m.sender_type === 'doctor');
        const lastSeenTs = lastDocMsg ? new Date(lastDocMsg.created_at).getTime() : Date.now();
        setDoctorLastSeen(selectedDoctor.id, lastSeenTs);
        setUnreadDoctors((prev) => ({ ...prev, [selectedDoctor.id]: false }));
        clearUnreadFlag();
      } catch {
        if (!isMounted) return;
        setMessages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedDoctor]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctor) return;

    const userMessage = {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      if (isConnected) {
        // Use WebSocket for real-time messaging
        WebSocketService.sendMessage(selectedDoctor.id, messageToSend, 'client');
        // Still fetch to ensure message is saved and displayed correctly
        const response = await getChatMessages(selectedDoctor.id);
        setMessages(response.data.map((msg, index) => ({
          id: index + 1,
          sender: msg.sender_type === 'client' ? 'You' : 'Doctor',
          text: msg.message,
          timestamp: new Date(msg.created_at).toLocaleTimeString()
        })));
      } else {
        // Fallback to HTTP
        await sendChatMessage(selectedDoctor.id, { message: messageToSend });
        const response = await getChatMessages(selectedDoctor.id);
        setMessages(response.data.map((msg, index) => ({
          id: index + 1,
          sender: msg.sender_type === 'client' ? 'You' : 'Doctor',
          text: msg.message,
          timestamp: new Date(msg.created_at).toLocaleTimeString()
        })));
      }
    } catch {
      setError('Failed to send message. Please try again.');
      // Remove the message from UI if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setError('');
    setNotification('');
    clearUnreadFlag();
    setDoctorLastSeen(doctor.id);
    setUnreadDoctors((prev) => ({ ...prev, [doctor.id]: false }));
  };

  const handleBackToSelection = () => {
    setSelectedDoctor(null);
    setMessages([]);
    setNewMessage('');
  };

  if (fetchingDoctors) {
    return (
      <Container style={{ paddingTop: '90px', paddingBottom: '20px' }}>
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading doctors...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '90px', paddingBottom: '20px' }}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {selectedDoctor ? `Chat with Dr. ${selectedDoctor.name}` : 'Select a Doctor'}
              </h4>
              <div className="d-flex align-items-center">
                <small className={`me-2 ${isConnected ? 'text-light' : 'text-warning'}`}>
                  {isConnected ? '🟢 Live' : '🟡 Polling'}
                </small>
                {selectedDoctor && (
                  <Button variant="outline-light" size="sm" onClick={handleBackToSelection}>
                    Change Doctor
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {notification && <Alert variant="info" className="mb-3">{notification}</Alert>}

              {!selectedDoctor ? (
                // Doctor Selection Interface
                <div>
                  <p className="mb-3">Please select a doctor to start a conversation:</p>
                  <ListGroup>
                    {doctors.map((doctor) => (
                      <ListGroup.Item
                        key={doctor.id}
                        action
                        onClick={() => handleDoctorSelect(doctor)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>Dr. {doctor.name}</strong>
                          {unreadDoctors[doctor.id] && (
                            <Badge bg="danger" pill className="ms-2">
                              New
                            </Badge>
                          )}
                          <br />
                          <small className="text-muted">{doctor.specialization || 'General Practitioner'}</small>
                        </div>
                        <Button variant="primary" size="sm">
                          Select
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  {doctors.length === 0 && (
                    <Alert variant="info">No doctors available at the moment.</Alert>
                  )}
                </div>
              ) : (
                // Chat Interface
                <div>
                  <div style={{ height: '50vh', overflowY: 'auto', marginBottom: '20px' }}>
                    <ListGroup variant="flush">
                      {messages.map((message) => (
                        <ListGroup.Item
                          key={message.id}
                          className={`d-flex ${message.sender === 'You' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div
                            className={`p-3 rounded ${message.sender === 'You' ? 'bg-primary text-white' : 'bg-light'}`}
                            style={{ maxWidth: '70%' }}
                          >
                            <strong>{message.sender}:</strong> {message.text}
                            <br />
                            <small className={message.sender === 'You' ? 'text-light' : 'text-muted'}>
                              {message.timestamp}
                            </small>
                          </div>
                        </ListGroup.Item>
                      ))}
                      {loading && (
                        <ListGroup.Item className="d-flex justify-content-start">
                          <div className="p-3 rounded bg-light" style={{ maxWidth: '70%' }}>
                            <em>Doctor is typing...</em>
                          </div>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </div>

                  <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    <Row>
                      <Col md={9}>
                        <Form.Control
                          type="text"
                          placeholder="Type your health concern here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={sending}
                        />
                      </Col>
                      <Col md={3}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-100"
                          disabled={!newMessage.trim() || sending}
                        >
                          Send
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactDoctor;
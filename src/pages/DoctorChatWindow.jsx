import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { getChatMessages, sendChatMessage } from '../services/Api';
import WebSocketService from '../services/WebSocketService';
import { useParams, useNavigate } from 'react-router-dom';

const DoctorChatWindow = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const messageCallbackRef = useRef(null);

  // Fetch doctor details + messages
  useEffect(() => {
    // You can fetch single doctor or pass data through state
    // For now, we'll focus on messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getChatMessages(doctorId);
        setMessages(response.data.map((msg, index) => ({
          id: index + 1,
          sender: msg.sender_type === 'client' ? 'You' : 'Doctor',
          text: msg.message,
          timestamp: new Date(msg.created_at).toLocaleTimeString()
        })));
      } catch (err) {
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // WebSocket Connection
    if (user.id) {
      WebSocketService.connect(user.id, 'client');

      WebSocketService.onConnectionChange((connected) => setIsConnected(connected));

      messageCallbackRef.current = (data) => {
        if (data.sender_type === 'doctor' && String(data.sender_id) === doctorId) {
          const newMsg = {
            id: Date.now(),
            sender: 'Doctor',
            text: data.message,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, newMsg]);
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
  }, [doctorId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      if (isConnected) {
        WebSocketService.sendMessage(doctorId, messageText, 'client');
      } else {
        await sendChatMessage(doctorId, { message: messageText });
      }
    } catch {
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <Container style={{ paddingTop: '90px', paddingBottom: '20px' }}>
      <Row className="justify-content-center">
        <Col md={9} lg={7}>
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {doctor ? `Chat with Dr. ${doctor.name}` : 'Loading Doctor...'}
              </h5>
              <Button variant="outline-light" size="sm" onClick={() => navigate('/contact-doctor')}>
                ← Back to Doctors
              </Button>
            </Card.Header>

            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <div style={{ height: '55vh', overflowY: 'auto', marginBottom: '20px' }}>
                <ListGroup variant="flush">
                  {messages.map((msg) => (
                    <ListGroup.Item
                      key={msg.id}
                      className={`d-flex ${msg.sender === 'You' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`p-3 rounded ${msg.sender === 'You' ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ maxWidth: '75%' }}
                      >
                        <strong>{msg.sender}:</strong> {msg.text}
                        <br />
                        <small className={msg.sender === 'You' ? 'text-light' : 'text-muted'}>
                          {msg.timestamp}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                  {loading && <Spinner animation="border" size="sm" />}
                </ListGroup>
              </div>

              <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                <Row>
                  <Col md={9}>
                    <Form.Control
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                  </Col>
                  <Col md={3}>
                    <Button type="submit" variant="primary" className="w-100" disabled={!newMessage.trim() || sending}>
                      Send
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorChatWindow;
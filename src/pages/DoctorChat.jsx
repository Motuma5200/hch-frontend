import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { getClients, getChatMessages, sendDoctorMessage } from '../services/Api';
import WebSocketService from '../services/WebSocketService';

const DoctorChat = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [error, setError] = useState('');
  const [unreadClients, setUnreadClients] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const messageCallbackRef = useRef(null);

  const getClientLastSeen = (clientId) => {
    const raw = localStorage.getItem(`doctor_chat_last_seen_${clientId}`);
    return raw ? Number(raw) : 0;
  };

  const setClientLastSeen = (clientId, timestamp = Date.now()) => {
    localStorage.setItem(`doctor_chat_last_seen_${clientId}`, String(timestamp));
  };

  const setDoctorNewClientMessageFlag = (value) => {
    if (value) {
      localStorage.setItem('doctor_has_new_client_message', '1');
    } else {
      localStorage.removeItem('doctor_has_new_client_message');
    }
    window.dispatchEvent(new CustomEvent('doctorNewClientMessageUpdate'));
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setFetchingClients(true);
        const response = await getClients();
        setClients(response.data);
      } catch (err) {
        setError('Failed to fetch clients. Please try again.');
        console.error('Error fetching clients:', err);
      } finally {
        setFetchingClients(false);
      }
    };

    fetchClients();

    // Connect to WebSocket
    if (user.id) {
      WebSocketService.connect(user.id, 'doctor');

      // Handle connection status
      WebSocketService.onConnectionChange((connected) => {
        setIsConnected(connected);
      });

      // Handle incoming messages
      messageCallbackRef.current = (data) => {
        if (data.sender_type === 'client' && data.sender_id === selectedClient?.id) {
          // Add new message to chat
          const newMsg = {
            id: Date.now(),
            sender: 'Client',
            text: data.message,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, newMsg]);

          // Mark as read
          setClientLastSeen(selectedClient.id);
          setUnreadClients(prev => ({ ...prev, [selectedClient.id]: false }));
          setDoctorNewClientMessageFlag(false);
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

  useEffect(() => {
    if (!selectedClient) return;

    let isMounted = true;
    const fetchMessages = async () => {
      if (!isMounted) return;
      try {
        setLoading(true);
        const response = await getChatMessages(selectedClient.id);
        if (!isMounted) return;

        setMessages(
          response.data.map((msg, index) => ({
            id: index + 1,
            sender: msg.sender_type === 'doctor' ? 'You' : 'Client',
            text: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
          }))
        );

        // Mark this conversation as read by setting last seen to the last client message
        const clientMsgs = response.data.filter((msg) => msg.sender_type === 'client');
        const lastClientMsg = [...clientMsgs].reverse()[0];
        if (lastClientMsg) {
          setClientLastSeen(selectedClient.id, new Date(lastClientMsg.created_at).getTime());
        }

        // Update unread state so badge can clear immediately for this chat
        setUnreadClients((prev) => ({ ...prev, [selectedClient.id]: false }));
        setDoctorNewClientMessageFlag(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching messages:', err);
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
  }, [selectedClient]);

  useEffect(() => {
    if (clients.length === 0) return;

    let isMounted = true;
    let intervalId;

    const checkForUnreadFromClients = async () => {
      try {
        let anyNew = false;
        const unreadMap = {};

        await Promise.all(clients.map(async (client) => {
          try {
            const response = await getChatMessages(client.id);
            const msgs = response.data || [];
            const lastClientMsg = [...msgs].reverse().find((m) => m.sender_type === 'client');
            if (!lastClientMsg) return;

            const lastClientTs = new Date(lastClientMsg.created_at).getTime();
            const lastSeen = getClientLastSeen(client.id);

            // If doctor is viewing this client, mark read immediately
            if (selectedClient?.id === client.id) {
              setClientLastSeen(client.id, lastClientTs);
              return;
            }

            const isUnread = lastClientTs > lastSeen;
            if (isUnread) {
              unreadMap[client.id] = true;
              anyNew = true;
            }
          } catch {
            // ignore per-client errors
          }
        }));

        if (!isMounted) return;
        setUnreadClients(unreadMap);
        setDoctorNewClientMessageFlag(anyNew);
      } catch {
        // ignore
      }
    };

    checkForUnreadFromClients();
    intervalId = setInterval(checkForUnreadFromClients, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [clients, selectedClient]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    const userMessage = {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      if (isConnected) {
        // Use WebSocket for real-time messaging
        WebSocketService.sendMessage(selectedClient.id, messageToSend, 'doctor');
        // Still fetch to ensure message is saved and displayed correctly
        const response = await getChatMessages(selectedClient.id);
        setMessages(
          response.data.map((msg, index) => ({
            id: index + 1,
            sender: msg.sender_type === 'doctor' ? 'You' : 'Client',
            text: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
          }))
        );
      } else {
        // Fallback to HTTP
        await sendDoctorMessage(selectedClient.id, { message: messageToSend });
        const response = await getChatMessages(selectedClient.id);
        setMessages(
          response.data.map((msg, index) => ({
            id: index + 1,
            sender: msg.sender_type === 'doctor' ? 'You' : 'Client',
            text: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
          }))
        );
      }
      setClientLastSeen(selectedClient.id);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
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

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setError('');
    setClientLastSeen(client.id);
  };

  const handleBackToSelection = () => {
    setSelectedClient(null);
    setMessages([]);
    setNewMessage('');
  };

  if (fetchingClients) {
    return (
      <Container style={{ paddingTop: '90px', paddingBottom: '20px' }}>
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading clients...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '40px', paddingBottom: '20px' }}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {selectedClient ? `Chat with ${selectedClient.name}` : 'Select a Client'}
              </h4>
              <div className="d-flex align-items-center">
                <small className={`me-2 ${isConnected ? 'text-light' : 'text-warning'}`}>
                  {isConnected ? '🟢 Live' : '🟡 Polling'}
                </small>
                {selectedClient && (
                  <Button variant="outline-light" size="sm" onClick={handleBackToSelection}>
                    Change Client
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {!selectedClient ? (
                <div>
                  <p className="mb-3">Please select a client to start a conversation:</p>
                  <ListGroup>
                    {clients.map((client) => (
                      <ListGroup.Item
                        key={client.id}
                        action
                        onClick={() => handleClientSelect(client)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{client.name}</strong>
                          {unreadClients[client.id] && (
                            <Badge bg="danger" pill className="ms-2">
                              New
                            </Badge>
                          )}
                          <br />
                          <small className="text-muted">{client.email || 'No email provided'}</small>
                        </div>
                        <Button variant="success" size="sm">
                          Chat
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  {clients.length === 0 && (
                    <Alert variant="info">No clients available at the moment.</Alert>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ height: '50vh', overflowY: 'auto', marginBottom: '20px' }}>
                    <ListGroup variant="flush">
                      {messages.map((message) => (
                        <ListGroup.Item
                          key={message.id}
                          className={`d-flex ${message.sender === 'You' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div
                            className={`p-3 rounded ${message.sender === 'You' ? 'bg-success text-white' : 'bg-light'}`}
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
                            <em>Client is typing...</em>
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
                          placeholder="Type your response here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={sending}
                        />
                      </Col>
                      <Col md={3}>
                        <Button
                          type="submit"
                          variant="success"
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

export default DoctorChat;

import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const MessagesInbox = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Editing states
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Helper utility to safely split full calendar dates from individual time intervals
  const parseMessageDateTime = (rawStamp) => {
    if (!rawStamp || rawStamp === 'Just now') {
      return { dateStr: 'Today', timeStr: 'Just now' };
    }
    
    try {
      const parsedDate = new Date(rawStamp);
      // If backend sends an invalid non-ISO string fallback safely
      if (isNaN(parsedDate.getTime())) {
        return { dateStr: 'Prior Messages', timeStr: rawStamp };
      }
      
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      
      return {
        dateStr: parsedDate.toLocaleDateString(undefined, dateOptions),
        timeStr: parsedDate.toLocaleTimeString(undefined, timeOptions)
      };
    } catch (e) {
      return { dateStr: 'Prior Messages', timeStr: rawStamp };
    }
  };

  // Fetch threads
  useEffect(() => {
    const fetchAndFilterActiveChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const doctorsRes = await axios.get('http://localhost:8000/api/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allDoctors = doctorsRes.data || [];

        const threadPromises = allDoctors.map(async (doc) => {
          try {
            const historyRes = await axios.get(`http://localhost:8000/api/chat/messages/${doc.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const messageData = Array.isArray(historyRes.data) 
              ? historyRes.data 
              : (historyRes.data.messages || []);

            if (messageData.length > 0) {
              const lastMsg = messageData[messageData.length - 1];
              return {
                ...doc,
                hasMessages: true,
                last_message_snippet: lastMsg.message || 'Media Attachment',
                last_message_time: lastMsg.timestamp || lastMsg.created_at || ''
              };
            }
          } catch (err) {
            console.warn(`Doctor ID ${doc.id} has no chat history`);
          }
          return { ...doc, hasMessages: false };
        });

        const resolvedDoctors = await Promise.all(threadPromises);
        setThreads(resolvedDoctors.filter(doc => doc.hasMessages));
      } catch (err) {
        console.error("Error fetching threads:", err);
      } finally {
        setLoadingThreads(false);
      }
    };

    fetchAndFilterActiveChats();
  }, []);

  // Fetch messages for active thread
  useEffect(() => {
    if (!activeThread) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/chat/messages/${activeThread.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const messageData = Array.isArray(res.data) ? res.data : (res.data.messages || []);
        setMessages(messageData);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeThread]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:8000/api/chat/messages/${activeThread.id}`, {
        message: newMessage
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Match database blueprint configurations upon dynamic layout push insertions
      const sentMsg = res.data?.id ? res.data : {
        id: Date.now(),
        sender_type: 'client', 
        message: newMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, sentMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id || msg._id);
    setEditText(msg.message);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/chat/messages/${msgId}`, {
        message: editText
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages(prev => prev.map(msg => {
        const currentId = msg.id || msg._id;
        return currentId === msgId ? { ...msg, message: editText } : msg;
      }));

      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/chat/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => prev.filter(msg => {
        const currentId = msg.id || msg._id;
        return currentId !== msgId;
      }));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const isMe = (msg) => msg.sender_type === 'client';

  // State tracker to clear memory tracking boundaries across render frames
  let lastDisplayedDate = null;

  return (
    <div className="container" style={{ paddingTop: '90px', paddingBottom: '30px' }}>
      <h3 className="fw-bold mb-4 text-dark">Message Center</h3>

      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Row className="g-0" style={{ height: '75vh' }}>
          
          {/* Sidebar - Conversations */}
          <Col md={4} className="border-end bg-white d-flex flex-column h-100">
            <div className="p-3 bg-light border-bottom">
              <h6 className="fw-bold m-0 text-secondary">Conversations</h6>
            </div>
            
            <div className="overflow-auto flex-grow-1">
              {loadingThreads ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <p>No active conversations</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {threads.map((thread) => (
                    <ListGroup.Item 
                      key={thread.id}
                      action 
                      active={activeThread?.id === thread.id}
                      onClick={() => setActiveThread(thread)}
                      className="p-3 border-bottom d-flex align-items-start gap-2"
                    >
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" 
                           style={{ width: '40px', height: '40px' }}>
                        {(thread.name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div className="w-100 overflow-hidden">
                        <strong>Dr. {thread.name}</strong>
                        <p className="text-truncate small m-0 text-muted">
                          {thread.last_message_snippet}
                        </p>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </Col>

          {/* Chat Area */}
          <Col md={8} className="d-flex flex-column h-100 bg-light bg-opacity-50">
            {activeThread ? (
              <>
                <div className="p-3 bg-white border-bottom">
                  <h6 className="fw-bold m-0">Dr. {activeThread.name}</h6>
                </div>

                {/* Messages Feed View Panel */}
                <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-3">
                  {loadingMessages ? (
                    <div className="m-auto text-center">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const me = isMe(msg);
                      const currentMsgId = msg.id || msg._id;
                      const isEditing = editingId === currentMsgId;
                      
                      // Run the time calculation engine
                      const { dateStr, timeStr } = parseMessageDateTime(msg.timestamp || msg.created_at);
                      
                      // Check if a structural date separator banner needs to be introduced
                      let showDateHeader = false;
                      if (dateStr !== lastDisplayedDate) {
                        showDateHeader = true;
                        lastDisplayedDate = dateStr;
                      }

                      return (
                        <React.Fragment key={currentMsgId || index}>
                          {/* 🌟 STRUCTURAL TIMELINE SEPARATOR BANNER */}
                          {showDateHeader && (
                            <div className="d-flex justify-content-center my-3">
                              <span 
                                className="badge bg-white text-secondary border border-light-subtle px-3 py-2 rounded-pill shadow-xs text-uppercase fw-bold"
                                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
                              >
                                {dateStr}
                              </span>
                            </div>
                          )}

                          <div className={`d-flex ${me ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className="position-relative" style={{ width: isEditing ? '100%' : 'auto', maxWidth: '75%' }}>
                              <div className={`p-3 rounded-3 shadow-xs ${me ? 'bg-primary text-white rounded-br-0' : 'bg-white text-dark rounded-bl-0'}`}>
                                
                                {isEditing ? (
                                  <Form.Control
                                    as="textarea"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="mb-2 text-dark"
                                    rows={2}
                                    autoFocus
                                  />
                                ) : (
                                  <p className="m-0 small text-start" style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                )}

                                {/* Render clean local time token inside individual message frames */}
                                <div className={`extra-small mt-1 text-start ${me ? 'text-white text-opacity-75' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                                  {timeStr}
                                </div>
                              </div>

                              {/* Quick Management Triggers displayed strictly on user-owned assets */}
                              {me && !isEditing && (
                                <div className="mt-1 d-flex gap-2 justify-content-end">
                                  <Button 
                                    size="sm" 
                                    variant="link" 
                                    onClick={() => handleEdit(msg)}
                                    className="py-0 px-1 extra-small text-decoration-none text-primary fw-medium"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="link" 
                                    onClick={() => handleDelete(currentMsgId)}
                                    className="py-0 px-1 extra-small text-decoration-none text-danger fw-medium"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )}

                              {/* Save Framework actions */}
                              {isEditing && (
                                <div className="mt-1 d-flex gap-2 justify-content-end">
                                  <Button 
                                    size="sm" 
                                    variant="success" 
                                    onClick={() => handleSaveEdit(currentMsgId)}
                                    className="py-1 px-3 extra-small fw-bold shadow-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    onClick={() => { setEditingId(null); setEditText(""); }}
                                    className="py-1 px-2 extra-small"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <Form onSubmit={handleSendMessage} className="p-3 border-top bg-white d-flex gap-2">
                  <Form.Control 
                    type="text" 
                    placeholder={`Reply to Dr. ${activeThread.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="rounded-3"
                  />
                  <Button type="submit" variant="primary" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </Form>
              </>
            ) : (
              <div className="m-auto text-center p-5 text-muted">
                <h5>Select a conversation</h5>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MessagesInbox;
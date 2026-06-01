import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const MessagesInbox = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // Stores the selected doctor object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 1. Fetch doctors and defensively filter out those without any real message history
  useEffect(() => {
    const fetchAndFilterActiveChats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Step A: Fetch all available doctors from your existing endpoint
        const doctorsRes = await axios.get('http://localhost:8000/api/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allDoctors = doctorsRes.data || [];

        // Step B: Map doctors into an array of background execution promises
        const threadPromises = allDoctors.map(async (doc) => {
          try {
            const historyRes = await axios.get(`http://localhost:8000/api/chat/messages/${doc.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Defensive backend parsing: supports raw array lists or wrapped object arrays
            const messageData = Array.isArray(historyRes.data) 
              ? historyRes.data 
              : (historyRes.data.messages || []);

            // Strict filtering rule: Only match if an actual message exchange exists
            if (messageData && messageData.length > 0) {
              const lastMsg = messageData[messageData.length - 1];
              return {
                ...doc,
                hasMessages: true,
                last_message_snippet: lastMsg.message || 'Media Attachment',
                last_message_time: lastMsg.timestamp || lastMsg.created_at || ''
              };
            }
          } catch (err) {
            // Catches 404s, empty string routes, or API errors gracefully without crashing the application loop
            console.warn(`Doctor ID ${doc.id} has no valid chat history logs:`, err.message);
          }
          return { ...doc, hasMessages: false };
        });

        // Step C: Explicitly wait for all network handshakes to resolve 
        const resolvedDoctors = await Promise.all(threadPromises);
        
        // Step D: Filter out the placeholders that returned false flags
        const activeConversations = resolvedDoctors.filter(doc => doc.hasMessages);

        setThreads(activeConversations);
      } catch (err) {
        console.error("Critical failure during thread generation execution workflows:", err);
      } finally {
        setLoadingThreads(false);
      }
    };

    fetchAndFilterActiveChats();
  }, []);

  // 2. Load deep thread conversation histories for selected active workspaces
  useEffect(() => {
    if (!activeThread) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/chat/messages/${activeThread.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Mirror the same defensive parsing logic for the actual chat canvas display container
        const messageData = Array.isArray(res.data) ? res.data : (res.data.messages || []);
        setMessages(messageData);
      } catch (err) {
        console.error("Error fetching chat histories:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    
    // Reset notification badges instantly upon layout engagement
    localStorage.removeItem('client_has_new_doctor_message');
    window.dispatchEvent(new CustomEvent('doctorMessageUpdate'));

  }, [activeThread]);

  // 3. Dispatch outbound communication payloads
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:8000/api/chat/messages/${activeThread.id}`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle raw message text appends vs fully formed database response rows securely
      const sentMsg = res.data && res.data.message ? res.data : { sender_role: 'client', message: newMessage, timestamp: 'Just now' };
      
      setMessages(prev => [...prev, sentMsg]);
      
      // Update sidebar preview tracking instantly to match the newly submitted value
      setThreads(prevThreads => 
        prevThreads.map(t => 
          t.id === activeThread.id 
            ? { ...t, last_message_snippet: newMessage, last_message_time: 'Just now' } 
            : t
        )
      );

      setNewMessage("");
    } catch (err) {
      console.error("Transmission exception failure caught on submit action:", err);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '90px', paddingBottom: '30px' }}>
      <h3 className="fw-bold mb-4 text-dark">Message Center</h3>
      
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Row className="g-0" style={{ height: '75vh' }}>
          
          {/* LEFT PANEL: Clean Filtered Active Conversations Sidebar */}
          <Col md={4} className="border-end bg-white d-flex flex-column h-100">
            <div className="p-3 bg-light border-bottom">
              <h6 className="fw-bold m-0 text-secondary">Conversations</h6>
            </div>
            
            <div className="overflow-auto flex-grow-1">
              {loadingThreads ? (
                <div className="text-center p-4 mt-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted extra-small mt-2 mb-0">Verifying message histories...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center p-5 text-muted mt-5">
                  <i className="bi bi-chat-left-x d-block mb-2 text-secondary opacity-50" style={{ fontSize: '2rem' }}></i>
                  <p className="small m-0 fw-semibold">No active conversations found.</p>
                  <p className="extra-small text-muted mt-1">Use the dashboard action buttons to find a doctor and begin a conversation thread.</p>
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
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Avatar initial badge layout block */}
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                        {(thread.name || 'D').charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Details text segments container */}
                      <div className="w-100 overflow-hidden">
                        <div className="d-flex justify-content-between align-items-baseline">
                          <strong className={`text-truncate small ${activeThread?.id === thread.id ? 'text-white' : 'text-dark'}`}>
                            Dr. {thread.name}
                          </strong>
                          <span className={`extra-small ps-2 ${activeThread?.id === thread.id ? 'text-white text-opacity-50' : 'text-muted'}`}>
                            {thread.last_message_time || ''}
                          </span>
                        </div>
                        <p className={`text-truncate small m-0 ${activeThread?.id === thread.id ? 'text-white text-opacity-75' : 'text-muted'}`}>
                          {thread.last_message_snippet}
                        </p>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </Col>

          {/* RIGHT PANEL: Dynamic Message Feed History Viewer Component */}
          <Col md={8} className="d-flex flex-column h-100 bg-light bg-opacity-50">
            {activeThread ? (
              <>
                {/* Active Conversation Banner Headings */}
                <div className="p-3 bg-white border-bottom shadow-xs">
                  <h6 className="fw-bold m-0 text-dark">Dr. {activeThread.name}</h6>
                  <small className="text-muted text-capitalize">{activeThread.specialty || 'Medical Specialist'}</small>
                </div>

                {/* Chat Transcript Message Bubble Log Scroller */}
                <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-3">
                  {loadingMessages ? (
                    <div className="m-auto text-center">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : messages.map((msg, index) => {
                    // Flags true if current message item matches patient sender properties
                    const isMe = msg.sender_role === 'client' || msg.user_id !== activeThread.user_id; 
                    return (
                      <div 
                        key={msg.id || index} 
                        className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div 
                          className={`p-3 rounded-3 shadow-xs max-w-75 ${
                            isMe ? 'bg-primary text-white rounded-br-0' : 'bg-white text-dark rounded-bl-0'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          <p className="m-0 small">{msg.message}</p>
                          <div className={`text-end extra-small mt-1 ${isMe ? 'text-white text-opacity-50' : 'text-muted'}`}>
                            {msg.timestamp || msg.created_at || ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Dispatch Dock bar layout */}
                <Form onSubmit={handleSendMessage} className="p-3 border-top bg-white d-flex gap-2 align-items-center">
                  <Form.Control 
                    type="text" 
                    placeholder={`Reply to Dr. ${activeThread.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="border-0 bg-light rounded-3 py-2 px-3 small"
                  />
                  <Button type="submit" variant="primary" className="rounded-3 px-4 fw-semibold" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </Form>
              </>
            ) : (
              /* Landing Inbox Welcome State Placeholder context backdrop */
              <div className="m-auto text-center p-5 text-muted">
                <i className="bi bi-chat-square-dots text-primary opacity-50" style={{ fontSize: '3.5rem' }}></i>
                <h5 className="fw-bold mt-3 text-dark">Your Correspondence Hub</h5>
                <p className="small text-muted" style={{ maxWidth: '320px' }}>Select an ongoing conversation from the sidebar column to view notes, consult options, and manage clinical messages.</p>
              </div>
            )}
          </Col>

        </Row>
      </Card>
    </div>
  );
};

export default MessagesInbox;
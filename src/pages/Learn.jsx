import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Spinner, Alert, Collapse } from 'react-bootstrap';
import api from '../services/Api';

const Learn = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Track which cards have active video playback running
  const [activeVideoId, setActiveVideoId] = useState(null);
  // Track which cards have expanded details open
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchContentFromDb = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/content');
        const parsedData = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setTips(parsedData);
        setError(null);
      } catch (err) {
        console.error('Database connection array recovery error:', err);
        setError('Unable to fetch clinical health resources at this moment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContentFromDb();
  }, []);

  const toggleExpandDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <Container className="py-5" style={{ paddingTop: '110px' }}>
      <h1 className="text-center mb-3 mt-3 fw-bold text-dark">Health Tips & Tutorials</h1>
      
      {/* Category Navigation Strip */}
      <div className="d-flex justify-content-end mb-4 sticky-filter">
        <ButtonGroup className="shadow-sm rounded-3 overflow-hidden">
          {['all', 'general', 'disease', 'diet', 'exercise'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline-primary'}
              onClick={() => {
                setSelectedCategory(cat);
                setExpandedId(null);
                setActiveVideoId(null);
              }}
              className="text-capitalize px-3 fw-semibold"
            >
              {cat}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Loading State Spinner */}
      {loading && (
        <div className="text-center py-5 my-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted mt-3 small fw-medium">Syncing verified database content layers...</p>
        </div>
      )}

      {/* Network Failure Warning */}
      {error && !loading && (
        <Alert variant="danger" className="border-0 shadow-sm rounded-3 py-3 text-center">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5 align-middle"></i>
          {error}
        </Alert>
      )}

      {/* Grid Layout Matrix */}
      {!loading && !error && (
        <Row>
          {filteredTips.length > 0 ? (
            filteredTips.map((tip) => {
              const isExpanded = expandedId === tip.id;
              const isPlayingVideo = activeVideoId === tip.id;

              return (
                <Col key={tip.id} md={6} lg={4} className="mb-4 d-flex">
                  <Card className="shadow-sm border-0 rounded-3 overflow-hidden w-100 d-flex flex-column custom-content-card">
                    
                    {/* Visual Media Block Header Layer */}
                    {tip.videoUrl && isPlayingVideo ? (
                      <div className="ratio ratio-16x9 bg-dark">
                        <iframe
                          src={`${tip.videoUrl}?autoplay=1`}
                          title={tip.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div 
                        className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-secondary position-relative" 
                        style={{ height: '180px' }}
                      >
                        <i className="bi bi-camera-video fs-1 opacity-50"></i>
                        {tip.videoUrl && (
                          <Button 
                            variant="danger" 
                            size="sm"
                            className="position-absolute rounded-pill px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
                            onClick={() => setActiveVideoId(tip.id)}
                          >
                            <i className="bi bi-play-fill fs-5"></i> Start Stream
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Standard Text Details Body Container */}
                    <Card.Body className="p-3 d-flex flex-column flex-grow-1">
                      <Card.Title className="fw-bold fs-5 text-dark text-truncate mb-2">
                        {tip.title}
                      </Card.Title>
                      <Card.Text className="text-secondary small flex-grow-1 mb-3">
                        {tip.description}
                      </Card.Text>

                      {/* Interactive Controls Foot Area */}
                      <div className="d-flex gap-2 mt-auto pt-2 border-top">
                        {tip.videoUrl && !isPlayingVideo && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="flex-grow-1 rounded-3 fw-semibold"
                            onClick={() => setActiveVideoId(tip.id)}
                          >
                            <i className="bi bi-play-circle-fill me-1"></i> Watch Video
                          </Button>
                        )}
                        {isPlayingVideo && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="flex-grow-1 rounded-3 fw-semibold"
                            onClick={() => setActiveVideoId(null)}
                          >
                            <i className="bi bi-stop-circle-fill me-1"></i> Close Video
                          </Button>
                        )}
                        <Button 
                          variant="outline-dark" 
                          size="sm"
                          className="rounded-3 px-3"
                          onClick={() => toggleExpandDetails(tip.id)}
                        >
                          {isExpanded ? 'Hide Details' : 'Details'}
                        </Button>
                      </div>
                    </Card.Body>

                    {/* Expanded Detail Panel */}
                    <Collapse in={isExpanded}>
                      <div className="bg-light border-top">
                        <div className="p-3 small text-muted">
                          <strong className="text-dark d-block mb-1">Extended Guidance:</strong>
                          <p className="mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                            {tip.detail && tip.detail.trim() !== '' 
                              ? tip.detail 
                              : "No supplementary context materials have been compiled for this educational asset module yet."}
                          </p>
                        </div>
                      </div>
                    </Collapse>

                  </Card>
                </Col>
              );
            })
          ) : (
            <Col className="text-center py-5">
              <div className="text-muted mb-2"><i className="bi bi-folder-x fs-1"></i></div>
              <p className="text-secondary fw-medium">No resource updates indexed for the "{selectedCategory}" classification group yet.</p>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default Learn;
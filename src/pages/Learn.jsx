import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Import thumbnails from assets
import thumbnail1 from '../assets/thumbnail1.png';
import thumbnail2 from '../assets/thumbnail2.png';
import thumbnail3 from '../assets/thumbnail3.png';
import thumbnail4 from '../assets/thumbnail4.png';
import thumbnail5 from '../assets/thumbnail5.png';

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tips = [
    {
      id: 1,
      title: 'Regular Exercise',
      description: 'Engage in at least 30 minutes of moderate exercise daily to maintain physical health and reduce stress.',
      image: thumbnail1,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1',
      category: 'exercise'
    },
    {
      id: 2,
      title: 'Balanced Diet',
      description: 'Eat a variety of fruits, vegetables, lean proteins, and whole grains to fuel your body properly.',
      image: thumbnail2,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2',
      category: 'diet'
    },
    {
      id: 3,
      title: 'Mental Health Awareness',
      description: 'Practice mindfulness, meditation, and seek support when needed to maintain mental well-being.',
      image: thumbnail3,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3',
      category: 'general'
    },
    {
      id: 4,
      title: 'Quality Sleep',
      description: 'Aim for 7-9 hours of sleep per night to allow your body to recover and function optimally.',
      image: thumbnail4,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_4',
      category: 'general'
    },
    {
      id: 5,
      title: 'Managing Diabetes',
      description: 'Monitor blood sugar levels, eat balanced meals, and stay active to manage diabetes effectively.',
      image: thumbnail5,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_5',
      category: 'disease'
    },
    {
      id: 6,
      title: 'Heart Health Tips',
      description: 'Maintain a healthy weight, avoid smoking, and control cholesterol to keep your heart healthy.',
      image: thumbnail1,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_6',
      category: 'disease'
    },
    {
      id: 7,
      title: 'Healthy Eating Habits',
      description: 'Portion control and mindful eating can help maintain a healthy weight and prevent overeating.',
      image: thumbnail2,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_7',
      category: 'diet'
    },
    {
      id: 8,
      title: 'Stress Management',
      description: 'Incorporate relaxation techniques like deep breathing and yoga to manage daily stress.',
      image: thumbnail3,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_8',
      category: 'general'
    }
  ];

  const filteredTips = selectedCategory === 'all' ? tips : tips.filter(tip => tip.category === selectedCategory);

  return (
    <Container className="py-5">
      <h1 className="text-center mb-3 mt-3">Health Tips & Tutorials</h1>
      <div className="d-flex justify-content-end mb-3 sticky-filter">
        <ButtonGroup>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'general' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('general')}
          >
            General
          </Button>
          <Button
            variant={selectedCategory === 'disease' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('disease')}
          >
            Disease
          </Button>
          <Button
            variant={selectedCategory === 'diet' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('diet')}
          >
            Diet
          </Button>
          <Button
            variant={selectedCategory === 'exercise' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('exercise')}
          >
            Exercise
          </Button>
        </ButtonGroup>
      </div>
      <Row>
        {filteredTips.length > 0 ? (
          filteredTips.map((tip) => (
            <Col key={tip.id} md={6} lg={3} className="mb-4">
              <Card as={Link} to={`/learn/${tip.id}`} className="h-100 shadow-sm text-decoration-none text-dark">
                <Card.Img variant="top" src={tip.image} alt={tip.title} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{tip.title}</Card.Title>
                  <Card.Text className="flex-grow-1">{tip.description}</Card.Text>
                  <div className="mt-auto">
                    <Button variant="primary" className="me-2" onClick={(e) => { e.preventDefault(); window.open(tip.videoUrl, '_blank'); }}>
                      Watch Video
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <p>No tips available for this category yet.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Learn;
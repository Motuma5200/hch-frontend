import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

// Import thumbnails from assets
import thumbnail1 from '../assets/thumbnail1.png';
import thumbnail2 from '../assets/thumbnail2.png';
import thumbnail3 from '../assets/thumbnail3.png';
import thumbnail4 from '../assets/thumbnail4.png';
import thumbnail5 from '../assets/thumbnail5.png';

const TutorialDetail = () => {
  const { id } = useParams();

  const tips = [
    {
      id: 1,
      title: 'Regular Exercise',
      description: 'Engage in at least 30 minutes of moderate exercise daily to maintain physical health and reduce stress. Regular physical activity can help prevent chronic diseases, improve mood, and boost energy levels. Try activities like walking, jogging, swimming, or cycling. Remember to consult with a healthcare professional before starting a new exercise regimen.',
      image: thumbnail1,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1',
      category: 'exercise',
      fullContent: 'Detailed steps for regular exercise...'
    },
    {
      id: 2,
      title: 'Balanced Diet',
      description: 'Eat a variety of fruits, vegetables, lean proteins, and whole grains to fuel your body properly. A balanced diet provides essential nutrients for optimal health. Focus on portion control and include all food groups in your meals.',
      image: thumbnail2,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2',
      category: 'diet',
      fullContent: 'More details on balanced diet...'
    },
    {
      id: 3,
      title: 'Mental Health Awareness',
      description: 'Practice mindfulness, meditation, and seek support when needed to maintain mental well-being. Mental health is just as important as physical health.',
      image: thumbnail3,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3',
      category: 'general',
      fullContent: 'Extended mental health tips...'
    },
    {
      id: 4,
      title: 'Quality Sleep',
      description: 'Aim for 7-9 hours of sleep per night to allow your body to recover and function optimally. Good sleep hygiene is crucial for health.',
      image: thumbnail4,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_4',
      category: 'general',
      fullContent: 'Sleep improvement techniques...'
    },
    {
      id: 5,
      title: 'Managing Diabetes',
      description: 'Monitor blood sugar levels, eat balanced meals, and stay active to manage diabetes effectively.',
      image: thumbnail5,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_5',
      category: 'disease',
      fullContent: 'Diabetes management guide...'
    },
    {
      id: 6,
      title: 'Heart Health Tips',
      description: 'Maintain a healthy weight, avoid smoking, and control cholesterol to keep your heart healthy.',
      image: thumbnail1,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_6',
      category: 'disease',
      fullContent: 'Heart health advice...'
    },
    {
      id: 7,
      title: 'Healthy Eating Habits',
      description: 'Portion control and mindful eating can help maintain a healthy weight and prevent overeating.',
      image: thumbnail2,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_7',
      category: 'diet',
      fullContent: 'Eating habits details...'
    },
    {
      id: 8,
      title: 'Stress Management',
      description: 'Incorporate relaxation techniques like deep breathing and yoga to manage daily stress.',
      image: thumbnail3,
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_8',
      category: 'general',
      fullContent: 'Stress reduction methods...'
    }
  ];

  const tip = tips.find(t => t.id === parseInt(id));

  if (!tip) {
    return (
      <Container className="py-5">
        <h1 className="text-center">Tutorial Not Found</h1>
        <p className="text-center">The requested tutorial could not be found.</p>
        <div className="text-center">
          <Button as={Link} to="/learn" variant="primary">Back to Learn</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button as={Link} to="/learn" variant="outline-primary" className="mb-3">
            ← Back to Tutorials
          </Button>
          <h1>{tip.title}</h1>
          <p className="text-muted">Category: {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}</p>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Img variant="top" src={tip.image} alt={tip.title} />
          </Card>
        </Col>
        <Col md={6}>
          <h3>Description</h3>
          <p>{tip.description}</p>
          <h3>Video Tutorial</h3>
          <div className="ratio ratio-16x9 mb-4">
            <iframe
              src={tip.videoUrl}
              title={tip.title}
              allowFullScreen
            ></iframe>
          </div>
          <h3>Detailed Content</h3>
          <p>{tip.fullContent}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default TutorialDetail;
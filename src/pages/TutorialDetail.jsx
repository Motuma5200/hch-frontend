import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

// Import thumbnails from assets
import thumbnail1 from '../assets/thumbnail1.png';
import thumbnail2 from '../assets/thumbnail2.png';
import thumbnail3 from '../assets/thumbnail3.png';
import thumbnail4 from '../assets/thumbnail4.png';
import thumbnail5 from '../assets/thumbnail5.png';

const TutorialDetail = () => {
  const { id } = useParams();

  // Logic & Data: Kept exactly as your working version
const tips = [
  { 
    id: 1, 
    title: 'Regular Exercise', 
    description: 'Engage in at least 30 minutes of moderate exercise daily to maintain physical health and reduce stress.', 
    image: thumbnail1, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1', 
    category: 'exercise', 
    fullContent: 'Physical activity is fundamental to health and well-being. To achieve optimal results, adults should aim for a minimum of 150 minutes of moderate-intensity aerobic physical activity throughout the week. This includes brisk walking, cycling, or swimming. Key benefits include improved cardiovascular fitness, strengthened bone density, and a significant reduction in the risk of non-communicable diseases such as hypertension and Type 2 diabetes.' 
  },
  { 
    id: 2, 
    title: 'Balanced Diet', 
    description: 'Eat a variety of fruits, vegetables, lean proteins, and whole grains to fuel your body properly.', 
    image: thumbnail2, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2', 
    category: 'diet', 
    fullContent: 'A healthy diet protects against malnutrition in all its forms. To ensure a balanced intake, prioritize plant-based foods including legumes, whole grains (oats, brown rice), and at least 400g of fruit and vegetables daily. Limit free sugars to less than 10% of total energy intake and reduce salt consumption to less than 5g per day to prevent hypertension and maintain heart health.' 
  },
  { 
    id: 3, 
    title: 'Mental Health Awareness', 
    description: 'Practice mindfulness, meditation, and seek support when needed to maintain mental well-being.', 
    image: thumbnail3, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3', 
    category: 'general', 
    fullContent: 'Mental health is an integral part of health; indeed, there is no health without mental health. Awareness involves recognizing the signs of burnout, anxiety, and depression early. Strategies for maintenance include establishing a "work-life" boundary, practicing daily mindfulness to lower cortisol levels, and fostering strong social connections. Professional support should be sought if symptoms interfere with daily functioning for more than two weeks.' 
  },
  { 
    id: 4, 
    title: 'Quality Sleep', 
    description: 'Aim for 7-9 hours of sleep per night to allow your body to recover and function optimally.', 
    image: thumbnail4, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_4', 
    category: 'general', 
    fullContent: 'Sleep is a critical biological process for cognitive function and physical repair. Quality sleep involves consistent timing—going to bed and waking up at the same time daily. To improve "Sleep Hygiene," reduce blue light exposure from screens at least 60 minutes before bed, keep the bedroom temperature cool, and avoid caffeine in the late afternoon. Chronic sleep deprivation is linked to impaired immunity and increased risk of obesity.' 
  },
  { 
    id: 5, 
    title: 'Managing Diabetes', 
    description: 'Monitor blood sugar levels, eat balanced meals, and stay active to manage diabetes effectively.', 
    image: thumbnail5, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_5', 
    category: 'disease', 
    fullContent: 'Effective diabetes management focuses on maintaining blood glucose levels within a target range. This is achieved through a combination of regular monitoring, medical adherence, and a low-glycemic index diet. Physical activity increases insulin sensitivity, allowing cells to better utilize glucose. Understanding carbohydrate counting and staying hydrated are essential steps in preventing long-term complications like neuropathy or retinopathy.' 
  },
  { 
    id: 6, 
    title: 'Heart Health Tips', 
    description: 'Maintain a healthy weight, avoid smoking, and control cholesterol to keep your heart healthy.', 
    image: thumbnail1, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_6', 
    category: 'disease', 
    fullContent: 'Cardiovascular health is the leading indicator of longevity. Key preventative measures include total tobacco cessation, as smoking damages the lining of the arteries. Maintain a Healthy BMI through a diet rich in Omega-3 fatty acids (found in fish and flaxseeds) and monitor your Blood Pressure regularly. High levels of LDL (bad) cholesterol should be managed through reduced intake of saturated and trans-fats.' 
  },
  { 
    id: 7, 
    title: 'Healthy Eating Habits', 
    description: 'Portion control and mindful eating can help maintain a healthy weight and prevent overeating.', 
    image: thumbnail2, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_7', 
    category: 'diet', 
    fullContent: 'Mindful eating involves paying full attention to the experience of eating and drinking, both inside and outside the body. Practice eating slowly to allow the brain to register "fullness" signals (which take about 20 minutes). Use smaller plates to assist with portion control and avoid eating while distracted by television or mobile devices. This habit reduces the tendency for emotional eating and improves digestion.' 
  },
  { 
    id: 8, 
    title: 'Stress Management', 
    description: 'Incorporate relaxation techniques like deep breathing and yoga to manage daily stress.', 
    image: thumbnail3, 
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_8', 
    category: 'general', 
    fullContent: 'Chronic stress triggers a constant "fight or flight" response, which can damage the body over time. Management techniques include Diaphragmatic Breathing (deep belly breathing), which activates the parasympathetic nervous system to induce calm. Progressive Muscle Relaxation and regular physical exercise also help metabolize excess adrenaline. Identifying personal stressors and learning "Refusal Skills" (saying no to extra commitments) are vital for long-term resilience.' 
  }
];

  const tip = tips.find(t => t.id === parseInt(id));

  if (!tip) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 bg-light rounded-4">
          <h1 className="display-1 fw-bold text-muted">404</h1>
          <p className="lead">The tutorial you are looking for isn't here.</p>
          <Button as={Link} to="/learn" variant="primary" className="rounded-pill px-4">
            Back to Library
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
      <Row className="justify-content-center">
        <Col lg={9}>
          {/* Top Navigation */}
          <nav className="mb-4">
            <Link to="/learn" className="text-decoration-none text-secondary small fw-bold">
              ← BACK TO ALL TUTORIALS
            </Link>
          </nav>

          {/* Header Section */}
          <header className="mb-5">
            <Badge pill bg="info" className="mb-3 px-3 py-2 text-white text-capitalize">
              {tip.category}
            </Badge>
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#2c3e50' }}>{tip.title}</h1>
            <p className="fs-5 text-secondary" style={{ maxWidth: '800px' }}>
              {tip.description}
            </p>
          </header>

          {/* Video Section with custom card styling */}
          <section className="mb-5">
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="ratio ratio-16x9">
                <iframe
                  src={tip.videoUrl}
                  title={tip.title}
                  allowFullScreen
                ></iframe>
              </div>
              <Card.Footer className="bg-white p-3 border-0 text-center text-muted small">
                Video Tutorial: {tip.title}
              </Card.Footer>
            </Card>
          </section>

          {/* Content Body */}
          <section className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-5">
            <h2 className="fw-bold mb-4">Step-by-Step Guide</h2>
            <div className="article-content" style={{ lineHeight: '1.8', fontSize: '1.15rem' }}>
              {tip.fullContent}
            </div>
            
            <div className="mt-5 p-4 rounded-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '5px solid #0dcaf0' }}>
              <h5 className="fw-bold">Pro Tip</h5>
              <p className="mb-0 text-secondary">
                Consistency is key! Try to implement one small change from this tutorial every day for the next week.
              </p>
            </div>
          </section>

          {/* Footer Actions */}
          <footer className="d-flex justify-content-between align-items-center border-top pt-4">
             <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => window.print()}>
               Print Guide
             </Button>
             <div className="d-flex gap-2">
                <Button variant="link" className="text-decoration-none text-primary fw-bold">Share</Button>
                <Button variant="link" className="text-decoration-none text-danger fw-bold">Report Issue</Button>
             </div>
          </footer>
        </Col>
      </Row>
    </Container>
  );
};

export default TutorialDetail;
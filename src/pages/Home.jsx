import { NavLink } from 'react-router-dom';
import heroImage from '../assets/hero-1.avif'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="bg-primary text-white text-center py-5" 
        style={{
          backgroundImage: `linear-gradient(rgba(13, 109, 253, 0.33), rgba(13, 109, 253, 0.33)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="container">
          <h1 className="display-3 fw-bold mb-3">
            Your Health, Your Control
          </h1>
          <p className="lead fs-4 mb-4 col-md-10 mx-auto">
            Empowering you with smart tracking, personalized insights, nutrition guidance, nearby clinic discovery, and direct AI-powered medical conversations — all in one place.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <NavLink 
              to="/ai" 
              className="btn btn-light btn-lg px-5 py-3 fw-bold shadow"
            >
              Chat with AI
            </NavLink>
            <NavLink 
              to="/login" 
              className="btn btn-outline-light btn-lg px-5 py-3 fw-bold"
            >
              Log In
            </NavLink>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5 text-primary">
            Everything You Need for Better Health
          </h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-journal-check display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Track Your Metrics</h5>
                  <p className="card-text text-muted">
                    Easily log weight, blood pressure, glucose, heart rate, sleep, steps and more — daily or on demand.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-graph-up display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Personalized Reports</h5>
                  <p className="card-text text-muted">
                    See trends, receive risk assessments, progress charts and actionable health insights tailored to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-chat-dots display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Medical AI Chat</h5>
                  <p className="card-text text-muted">
                    Ask questions, get explanations, understand symptoms and receive general health guidance 24/7.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-cup-straw display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Nutrition & Tips</h5>
                  <p className="card-text text-muted">
                    Personalized meal ideas, calorie awareness, hydration reminders and evidence-based wellness advice.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-geo-alt display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Find Clinics & Doctors</h5>
                  <p className="card-text text-muted">
                    Interactive map to discover nearby clinics, hospitals, specialists — with directions and contact info.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="bi bi-shield-check display-4 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Secure & Private</h5>
                  <p className="card-text text-muted">
                    Your health data stays protected — modern encryption, clear privacy controls, trusted platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <NavLink to="/signup" className="btn btn-primary btn-lg px-5 py-3 fw-bold">
              Start Your Health Journey Today
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
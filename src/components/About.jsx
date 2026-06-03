// About.jsx
import React from 'react';
import aboutpic from '../assets/aboutpic.png'

// You can replace these placeholder names with your actual team members' information
const teamMembers = [
  {
    name: "Melese waanaa",
    role: "Frontend Developer / Mapping Lead",
    email: "melese.waanaa@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
  },
  {
    name: "Motuma rabuma",
    role: "Backend Developer / API Integration",
    email: "motuma.rabuma@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  },
  {
    name: "Kabe gutema",
    role: "Database Administrator / GIS Specialist",
    email: "kabe.gutema@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  },
  {
    name: "Bereket Epherem",
    role: "UI/UX Designer / QA Tester",
    email: "bereket.epherem@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  },
   {
    name: "Dagafa lammaa",
    role: "UI/UX Designer / QA Tester",
    email: "dagafa.lammaa@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  },
     {
    name: "Musaba ibrahim ",
    role: "Frontend Developer",
    email: "musabibraham@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  },

      {
    name: "Osama ibrahim",
    role: "Backend Developer",
    email: "osamaibrahim@example.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  },
];

const About = () => {
  return (
    <div className="container py-5 mt-5">
      {/* HERO HERO SECTION */}
      <div className="row align-items-center g-5 mb-5">
        <div className="col-lg-6">
          <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-bold tracking-wider">
            GRADUATION PROJECT 2026
          </span>
          <h1 className="display-4 fw-bold mb-3 text-dark">
            Bridging the Gap Between People and Vital Healthcare
          </h1>
          <p className="lead text-muted">
            Welcome to our final year innovation project. We designed an intelligent, user-centric mapping platform built to save time when minutes matter most.
          </p>
        </div>
        <div className="col-lg-6 text-center">
 
          <img 
            src={aboutpic}
            alt="Our Innovation Team Working" 
            className="img-fluid rounded-4 shadow-lg border"
          />
        </div>
      </div>

      <hr className="my-5" />

      {/* CORE PROJECT GOALS SECTION */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="card-body">
              <div className="text-primary fs-1 mb-3">🎯</div>
              <h5 className="fw-bold mb-2">The Problem</h5>
              <p className="text-muted small">
                Navigating physical emergency options during crises is chaotic. Scattered resources, inaccurate addresses, and distance calculation complexities prevent fast decision-making.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="card-body">
              <div className="text-success fs-1 mb-3">💡</div>
              <h5 className="fw-bold mb-2">Our Solution</h5>
              <p className="text-muted small">
                An ecosystem combining client-side Haversine tracking calculations with real-world road network polylines (OSRM API) to map precise pathways directly to closest emergency institutions.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="card-body">
              <div className="text-warning fs-1 mb-3">🚀</div>
              <h5 className="fw-bold mb-2">Academic Value</h5>
              <p className="text-muted small">
                This project represents a full consolidation of core software engineering practices: state lifecycle isolation, asynchronous routing operations, API performance scaling, and defensive UI design.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM MEMBERS GRID */}
      <div className="bg-white rounded-4 p-5 shadow-sm border">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Meet the Innovation Team</h2>
          <p className="text-muted">The student developers behind the architecture and design of this platform.</p>
        </div>

        <div className="row g-4 justify-content-center">
          {teamMembers.map((member, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="card text-center h-100 border-0 bg-light p-3 hover-shadow transition">
                <div className="card-body d-flex flex-column align-items-center">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="rounded-circle mb-3 bg-white border p-1" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <h6 className="fw-bold mb-1 text-dark">{member.name}</h6>
                  <span className="badge bg-secondary-subtle text-secondary small mb-3 px-2 py-1">
                    {member.role}
                  </span>
                  <a href={`mailto:${member.email}`} className="small text-decoration-none mt-auto text-primary fw-medium">
                    📧 Contact Student
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MENTOR ACKNOWLEDGEMENT */}
        <div className="mt-5 text-center border-top pt-4">
          <p className="text-muted small mb-0">
            Project Advisor: <strong className="text-dark">Teshome A</strong>
          </p>
          <small className="text-muted text-uppercase tracking-wider">
            Department of Computer Science & Information Technology
          </small>
        </div>
      </div>
    </div>
  );
};

export default About;
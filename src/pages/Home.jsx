import { NavLink } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container mt-4">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Welcome to Health Check Hub</h1>
          <p className="col-md-8 fs-4">Track health metrics, view personalized reports, get nutrition tips, find nearby clinics on the map, and chat directly with doctors.</p>
          <NavLink to="/signup" className="btn btn-primary btn-lg me-2">Get Started</NavLink>
          <NavLink to="/login" className="btn btn-outline-primary btn-lg">Log in</NavLink>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Record Metrics</h5>
              <p className="card-text">Easily record weight, blood pressure, glucose, and other health metrics.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Health Reports</h5>
              <p className="card-text">Get trend reports and risk assessments based on your recorded metrics.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Find Clinics</h5>
              <p className="card-text">Locate nearby clinics and specialists using the integrated map.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

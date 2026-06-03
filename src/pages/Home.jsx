import { NavLink } from 'react-router-dom';

export default function Home() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="bg-white overflow-hidden">
      {/* PREMIUM HERO SECTION (Modern Asymmetrical Architecture) */}
      <section 
        className="position-relative py-5 d-flex align-items-center"
        style={{
          minHeight: '95vh',
          background: 'radial-gradient(circle at 0% 0%, #f1f5f9 0%, #fff 100%)',
        }}
      >
        {/* Soft, professional gradient mesh blobs */}
        <div 
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: '600px',
            height: '600px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            top: '-200px',
            right: '-100px',
            filter: 'blur(130px)',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="position-absolute rounded-circle opacity-10"
          style={{
            width: '400px',
            height: '400px',
            background: '#3b82f6',
            bottom: '-100px',
            left: '-100px',
            filter: 'blur(100px)',
            pointerEvents: 'none'
          }}
        />

        <div className="container position-relative z-1">
          <div className="row align-items-center gy-5">
            
            {/* Left Content Column */}
            <div className="col-lg-6 text-start">
              <span className="badge rounded-pill px-3 py-2 text-primary bg-primary bg-opacity-10 fw-semibold mb-4 d-inline-flex align-items-center gap-2 border border-primary border-opacity-10 shadow-sm">
                <i className="bi bi-shield-check text-primary fs-6"></i> Next-Gen Preventive Health Care
              </span>
              
              <h1 className="display-3 fw-extrabold text-slate mb-3 tracking-tight" style={{ color: '#0f172a', fontWeight: 800, lineHeight: 1.15 }}>
                Your Health, <br />
                <span className="text-primary" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Your Wealth
                </span>
              </h1>
              
              <p className="lead text-secondary fs-5 mb-4 pb-2 lh-base" style={{ maxWidth: '540px', color: '#475569' }}>
                Emporating your wellness journey through clinical-grade metric tracking, deep behavioral analytics, and continuous access to specialized medical AI.
              </p>
              
              <div className="d-flex gap-3 flex-wrap align-items-center">
                {isAuthenticated ? (
                  <NavLink 
                    to="/dashboard" 
                    className="btn btn-primary btn-lg px-4 py-3 fw-bold shadow-lg border-0 d-flex align-items-center gap-2 transition-all"
                    style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                  >
                    Enter Workspace <i className="bi bi-arrow-right"></i>
                  </NavLink>
                ) : (
                  <>
                    <NavLink 
                      to="/signup" 
                      className="btn btn-primary btn-lg px-4 py-3 fw-bold shadow-lg border-0 d-flex align-items-center gap-2 transition-all"
                      style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                    >
                      Get Started Free <i className="bi bi-arrow-right"></i>
                    </NavLink>
                    <NavLink 
                      to="/login" 
                      className="btn btn-lg px-4 py-3 fw-semibold text-dark bg-white border border-light-subtle shadow-sm transition-all hover-bg-light"
                      style={{ borderRadius: '12px', color: '#334155' }}
                    >
                      Sign In
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* Right Quick-Widget Showcase Column */}
            <div className="col-lg-6 ps-lg-5">
              <div 
                className="p-4 rounded-4 bg-white border border-light shadow-2xl position-relative transition-all"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.7)'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center shadow-inner" style={{ width: '44px', height: '44px' }}>
                      <i className="bi bi-activity fs-4"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>Telemetry Interface</h6>
                      <span className="text-muted d-block" style={{ fontSize: '11px' }}>Node ID: 882-SYS</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="position-relative d-inline-flex" style={{ width: '8px', height: '8px' }}>
                      <span className="animate-ping position-absolute inline-flex h-100 w-100 rounded-circle bg-success opacity-75"></span>
                      <span className="position-relative inline-flex rounded-circle h-2 w-2 bg-success"></span>
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-medium border border-success border-opacity-10">Live Matrix</span>
                  </div>
                </div>

                {/* Simulated Medical Widget Data Blocks */}
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3 border-start border-primary border-4 text-start transition-all" style={{ backgroundColor: '#f8fafc' }}>
                      <span className="text-secondary d-block small mb-1 fw-medium">Heart Rate Monitor</span>
                      <div className="d-flex align-items-baseline gap-1">
                        <strong className="fs-3 tracking-tight" style={{ color: '#1e293b' }}>72</strong>
                        <span className="fs-6 text-muted fw-semibold">BPM</span>
                      </div>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="p-3 rounded-3 border-start border-teal border-4 text-start transition-all" style={{ backgroundColor: '#f8fafc', borderLeftColor: '#0d9488 !important' }}>
                      <span className="text-secondary d-block small mb-1 fw-medium">Blood Glucose</span>
                      <div className="d-flex align-items-baseline gap-1">
                        <strong className="fs-3 tracking-tight" style={{ color: '#1e293b' }}>98</strong>
                        <span className="fs-6 text-muted fw-semibold">mg/dL</span>
                      </div>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="p-3 border border-dashed rounded-3 text-start d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-stars fs-5 text-primary"></i>
                        </div>
                        <div>
                          <span className="text-secondary d-block small mb-0 fw-medium">BioMistral Clinical AI Engine</span>
                          <span className="fw-bold small text-primary">Continuous predictive stream online</span>
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-sky-600 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CLINICAL CAPABILITIES SECTION */}
      <section className="py-5 bg-white border-top border-light">
        <div className="container py-5">
          
          <div className="text-center mx-auto mb-5 pb-3" style={{ maxWidth: '650px' }}>
            <span className="text-primary fw-bold text-uppercase tracking-wider small d-block mb-2">Platform Core</span>
            <h2 className="display-5 fw-bold text-slate mb-3" style={{ color: '#0f172a', trackingTight: '-0.02em' }}>
              Engineered to Accelerate Health Literacy
            </h2>
            <p className="text-secondary fs-6 lead">
              We've dismantled traditional, cluttered medical interfaces, prioritizing instantaneous AI insights and low-friction biometric telemetry.
            </p>
          </div>

          <div className="row g-4 text-start">
            {/* Feature Item 1 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 border border-light h-100 transition-all card-hover" style={{ background: '#fafafa' }}>
                <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: '52px', height: '52px' }}>
                  <i className="bi bi-clipboard2-pulse fs-4"></i>
                </div>
                <h4 className="fw-bold mb-2 fs-5" style={{ color: '#1e293b' }}>High-Fidelity Telemetry</h4>
                <p className="text-secondary small mb-0 lh-lg">
                  Instantly structure structured tracking pipelines for key serum markers, targeted hydration quotas, weight velocity, and restorative deep-sleep analytics.
                </p>
              </div>
            </div>

            {/* Feature Item 2 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 border border-light h-100 transition-all card-hover" style={{ background: '#fafafa' }}>
                <div className="bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: '52px', height: '52px' }}>
                  <i className="bi bi-robot fs-4"></i>
                </div>
                <h4 className="fw-bold mb-2 fs-5" style={{ color: '#1e293b' }}>BioMistral AI Engine</h4>
                <p className="text-secondary small mb-0 lh-lg">
                  24/7 localized private conversational mapping. Safely break down dense diagnostic terms, filter lab risks, and capture precise context boundaries.
                </p>
              </div>
            </div>

            {/* Feature Item 3 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 border border-light h-100 transition-all card-hover" style={{ background: '#fafafa' }}>
                <div className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: '52px', height: '52px' }}>
                  <i className="bi bi-geo-alt fs-4"></i>
                </div>
                <h4 className="fw-bold mb-2 fs-5" style={{ color: '#1e293b' }}>Geospatial Triage Mapping</h4>
                <p className="text-secondary small mb-0 lh-lg">
                  Dynamic geographic parameters automatically balance matching protocols between current vector coordinates and physical healthcare providers.
                </p>
              </div>
            </div>
          </div>

          {/* Core Call-to-Action Baseline */}
          <div className="mt-5 p-5 rounded-4 text-center text-white position-relative overflow-hidden shadow-xl" style={{ backgroundColor: '#0f172a', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div 
              className="position-absolute rounded-circle opacity-10"
              style={{ width: '300px', height: '300px', background: '#0ea5e9', top: '-100px', left: '-50px', filter: 'blur(50px)' }}
            />
            <div className="position-relative z-1 py-3">
              <h3 className="display-6 fw-bold mb-3 tracking-tight">Take Definitive Charge of Your Metrics</h3>
              <p className="text-light opacity-75 mb-4 mx-auto fs-6" style={{ maxWidth: '520px', color: '#cbd5e1' }}>
                Join our decentralized cryptographic healthcare framework. Advanced pipeline encryption keeps ultimate sovereignty over metrics in your custody.
              </p>
              <NavLink to="/signup" className="btn btn-info btn-lg px-5 py-3 fw-bold text-white rounded-3 shadow-md border-0 border-transition" style={{ backgroundColor: '#0ea5e9' }}>
                Initialize Secure Journey
              </NavLink>
            </div>
          </div>

        </div>
      </section>

      {/* Embedded CSS for clean modern micro-interactions */}
      <style>{`
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04);
          border-color: rgba(2, 132, 199, 0.15) !important;
          background: #fff !important;
        }
        .transition-all {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .border-transition:hover {
          filter: brightness(1.08);
          box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
        }
        .hover-bg-light:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}
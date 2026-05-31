
function Footer ()
{
return (
    <footer className="bg-dark text-light py-5">
  <div className="container">
    <div className="row gy-5">
      
      {/* Brand Column */}
      <div className="col-lg-4 col-md-6">
        <h4 className="fw-bold text-white mb-3">
          Health Check Hub
        </h4>
        <p className="text-light-emphasis">
          Your complete health companion. Track, connect, and take control of your wellness.
        </p>
        <div className="mt-3">
          <span className="text-teal">🫀</span> Smart • Secure • Personalized
        </div>
      </div>

      {/* Quick Links */}
      <div className="col-lg-2 col-md-6">
        <h6 className="fw-bold text-white mb-3">Platform</h6>
        <ul className="list-unstyled">
          <li className="mb-2"><a href="/" className="text-light text-decoration-none hover-teal">Home</a></li>
          <li className="mb-2"><a href="/ai" className="text-light text-decoration-none hover-teal">AI Assistant</a></li>
          <li className="mb-2"><a href="/tracking" className="text-light text-decoration-none hover-teal">Health Tracking</a></li>
          <li className="mb-2"><a href="/hospitals" className="text-light text-decoration-none hover-teal">Nearby Hospitals</a></li>
        </ul>
      </div>

      {/* Features */}
      <div className="col-lg-2 col-md-6">
        <h6 className="fw-bold text-white mb-3">Features</h6>
        <ul className="list-unstyled">
          <li className="mb-2"><a href="#" className="text-light text-decoration-none hover-teal">Doctor Chat</a></li>
          <li className="mb-2"><a href="#" className="text-light text-decoration-none hover-teal">Personalized Insights</a></li>
          <li className="mb-2"><a href="#" className="text-light text-decoration-none hover-teal">Nutrition Guide</a></li>
          <li className="mb-2"><a href="#" className="text-light text-decoration-none hover-teal">Reports & Analytics</a></li>
        </ul>
      </div>

      {/* Support & Legal */}
      <div className="col-lg-4 col-md-6">
        <h6 className="fw-bold text-white mb-3">Support</h6>
        <p className="mb-1 text-light-emphasis">Email: support@healthcheckhub.com</p>
        <p className="mb-4 text-light-emphasis">Phone: +251 911 234 567</p>
        
        <div className="mt-4">
          <h6 className="fw-bold text-white mb-3">Legal</h6>
          <div className="d-flex gap-3 flex-wrap">
            <a href="#" className="text-light text-decoration-none hover-teal">Privacy Policy</a>
            <a href="#" className="text-light text-decoration-none hover-teal">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <hr className="my-4 border-secondary" />
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-start">
      <p className="mb-0 text-light-emphasis">
        © 2026 Health Check Hub. All rights reserved.
      </p>
      <div className="mt-3 mt-md-0">
        Made with ❤️ for better health
      </div>
    </div>
  </div>
</footer>
)
}

export default Footer;
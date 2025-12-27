import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// IMPORT YOUR COMPONENTS
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login'; 
import NavBar from './components/NavBar'; // Updated import to match file name

function App() {
  return (
    <Router>
      <div className="App">
        {/* Nav component now matches the import */}
        <NavBar /> 
        
        <Routes>
          <Route path="/login" element={<Login />} /> 
          <Route path="/" element={<UserDashboard />} /> 
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/health" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
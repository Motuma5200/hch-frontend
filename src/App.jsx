import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// IMPORT YOUR COMPONENTS
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login'; 
import Learn from './pages/Learn';
import TutorialDetail from './pages/TutorialDetail';
import Ask from './pages/Ask'
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
          <Route path="/learn" element={<Learn />} />
          <Route path="/ai" element={<Ask/>} />
          <Route path="/learn/:id" element={<TutorialDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
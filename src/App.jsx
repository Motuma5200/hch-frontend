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
import Signup from './pages/Signup';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyAdminDashboard from './pages/PharmacyAdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Approvals from './pages/Approvals';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Nav component now matches the import */}
        <NavBar /> 
        
        <Routes>
          <Route path="/login" element={<Login />} /> 
          <Route path="/" element={<Home />} /> 
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard/>} />} />
          <Route path="/doctor" element={<ProtectedRoute roles={["doctor"]} element={<DoctorDashboard/>} />} />
          <Route path="/pharmacy" element={<ProtectedRoute roles={["pharmacy_admin"]} element={<PharmacyAdminDashboard/>} />} />
          <Route path="/client" element={<ProtectedRoute roles={["client"]} element={<ClientDashboard/>} />} />
          <Route path="/approvals" element={<ProtectedRoute roles={["admin"]} element={<Approvals/>} />} />
          <Route path="/health" element={<UserDashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/ai" element={<Ask/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/learn/:id" element={<TutorialDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
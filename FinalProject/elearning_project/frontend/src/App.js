import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link> |{' '}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link> |{' '}
            <Link to="/my-courses">My Courses</Link> |{' '}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Welcome to E-Learning</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {isAuthenticated && <Route path="/dashboard" element={<Dashboard />} />}
          {isAuthenticated && <Route path="/my-courses" element={<MyCourses />} />}
          {isAuthenticated && <Route path="/courses/:id" element={<CourseDetail />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
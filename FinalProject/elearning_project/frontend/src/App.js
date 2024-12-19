import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import API from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import QuizAttempt from './pages/QuizzAttempt';
import InstructorDashboard from './pages/InstructorDashboard';
import ManageCourse from './pages/ManageCourse';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const [userInfo, setUserInfo] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated) {
        try {
          const response = await API.get('accounts/user/');
          setUserInfo(response.data);
        } catch (err) {
          console.error('Failed to fetch user info', err);
        }
      }
    };
    fetchUserInfo();
  }, [isAuthenticated]);

  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link> |{' '}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link> |{' '}
            <Link to="/my-courses">My Courses</Link> |{' '}
            {userInfo && userInfo.is_instructor && <Link to="/instructor">Instructor</Link>} |{' '}
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
          {isAuthenticated && <Route path="/courses/:id/quizzes/:quiz_id" element={<QuizAttempt />} />}
          {isAuthenticated && userInfo && userInfo.is_instructor && (
            <Route path="/instructor" element={<InstructorDashboard userInfo={userInfo} />} />
          )}
          {isAuthenticated && userInfo && userInfo.is_instructor && (
            <>
              <Route path="/instructor" element={<InstructorDashboard userInfo={userInfo} />} />
              <Route path="/instructor/manage-course/:course_id" element={<ManageCourse />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
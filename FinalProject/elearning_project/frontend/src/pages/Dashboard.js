import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const fetchUserInfo = async () => {
    try {
      const response = await API.get('accounts/user/');
      setUserInfo(response.data);
    } catch (err) {
      console.error('Failed to fetch user info', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await API.get('courses/');
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchCourses();
  }, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount) return;

    try {
      const response = await API.post('payments/top-up/', { amount: topUpAmount });
      alert(`Wallet topped up! New balance: $${response.data.wallet_balance}`);
      setTopUpAmount('');
      fetchUserInfo();
    } catch (err) {
      console.error('Top-up error', err);
      alert('Failed to top up. Ensure you are logged in and try again.');
    }
  };

  const handlePurchase = async (courseId) => {
    try {
      const response = await API.post('enrollments/purchase/', { course_id: courseId });
      alert(`Enrolled successfully in course ID ${courseId}!`);
      fetchUserInfo();
    } catch (err) {
      console.error('Purchase error', err);
      alert('Failed to purchase course. Check your wallet balance or if you are already enrolled.');
    }
  };

  return (
    <div>
      <h2>Your Dashboard</h2>

      {userInfo && (
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Role:</strong> {userInfo.is_instructor ? 'Instructor' : 'Student'}</p>
          <p><strong>Wallet Balance:</strong> ${userInfo.wallet}</p>

          <form onSubmit={handleTopUp} style={{ marginTop: '10px' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Top-up Amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <button type="submit">Top Up</button>
          </form>
        </div>
      )}

      <h3>Available Courses</h3>
      <ul>
        {courses.map((course) => {
          const isCourseInstructor = userInfo && course.instructor === userInfo.id;
          const canAfford = userInfo && (userInfo.wallet >= course.price);
          return (
            <li key={course.id}>
              {course.title} - ${course.price}{' '}
              {!isCourseInstructor && userInfo && (
                <button
                  onClick={() => handlePurchase(course.id)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Buy' : 'Not enough funds'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dashboard;
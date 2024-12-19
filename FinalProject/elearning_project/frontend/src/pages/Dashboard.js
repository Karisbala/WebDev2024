import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get('courses/');
        setCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div>
      <h2>Your Dashboard</h2>
      <h3>Available Courses</h3>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.title} - ${course.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
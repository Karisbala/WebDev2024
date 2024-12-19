import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await API.get('enrollments/user-enrollments/');
        setEnrolledCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch enrolled courses', err);
      }
    };
    fetchEnrolledCourses();
  }, []);

  return (
    <div>
      <h2>My Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <ul>
          {enrolledCourses.map((course) => (
            <li key={course.id}>
              {course.title} - ${course.price}{' '}
              <Link to={`/courses/${course.id}`}>View Lessons</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCourses;
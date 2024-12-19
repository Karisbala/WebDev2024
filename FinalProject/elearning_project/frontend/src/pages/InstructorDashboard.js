import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

const InstructorDashboard = ({ userInfo }) => {
  const [myCreatedCourses, setMyCreatedCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await API.get(`courses/?instructor=${userInfo.id}`);
        setMyCreatedCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch instructor courses', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const resp = await API.get('categories/');
        setCategories(resp.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };

    fetchMyCourses();
    fetchCategories();
  }, [userInfo.id]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!title || !description || !price || !categoryId) {
      setMessage('Please fill all fields.');
      return;
    }
    try {
      await API.post('courses/', {
        title,
        description,
        price: parseFloat(price),
        category: parseInt(categoryId)
      });
      setMessage('Course created successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setCategoryId('');

      const response = await API.get(`courses/?instructor=${userInfo.id}`);
      setMyCreatedCourses(response.data);
    } catch (err) {
      console.error('Failed to create course', err);
      setMessage('Failed to create course.');
    }
  };

  return (
    <div className="container">
      <h2>Instructor Dashboard</h2>
      <h3>Create a New Course</h3>
      <form onSubmit={handleCreateCourse}>
        <label>Title:<br/>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label><br/>
        <label>Description:<br/>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label><br/>
        <label>Price:<br/>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label><br/>
        <label>Category:<br/>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label><br/>
        <button type="submit">Create Course</button>
      </form>
      {message && <p className="message">{message}</p>}

      <h3>My Created Courses</h3>
      <ul className="lesson-list">
        {myCreatedCourses.map(course => (
          <li key={course.id} className="lesson-item">
            {course.title} - ${course.price} 
            <Link to={`/instructor/manage-course/${course.id}`} style={{ marginLeft:'10px' }}>Manage</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorDashboard;
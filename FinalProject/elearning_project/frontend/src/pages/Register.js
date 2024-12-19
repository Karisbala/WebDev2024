import React, { useState } from 'react';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_student: true,
    is_instructor: false,
    wallet: 0
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      is_student: (role === 'student'),
      is_instructor: (role === 'instructor')
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await API.post('accounts/register/', formData);
      setMessage('Registration successful! You can now log in.');
    } catch (err) {
      console.error('Registration error', err);
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ padding:'20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          name="username"
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange}
        /><br/>
        
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
        /><br/>
        
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
        /><br/>
        
        <div>
          <label>
            <input
              type="radio"
              checked={formData.is_student}
              onChange={() => handleRoleChange('student')}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              checked={formData.is_instructor}
              onChange={() => handleRoleChange('instructor')}
            />
            Instructor
          </label>
        </div>
        
        <input
          type="number"
          name="wallet"
          placeholder="Initial Wallet Amount"
          value={formData.wallet}
          onChange={handleChange}
        /><br/>
        
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
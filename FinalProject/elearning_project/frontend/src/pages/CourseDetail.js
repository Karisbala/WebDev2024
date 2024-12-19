import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const response = await API.get(`courses/${id}/`);
        setCourseInfo(response.data);
      } catch (err) {
        console.error('Failed to fetch course detail', err);
      }
    };
    
    const fetchLessons = async () => {
      try {
        const response = await API.get(`lessons/?course=${id}`);
        setLessons(response.data);
      } catch (err) {
        console.error('Failed to fetch lessons', err);
      }
    };
    
    fetchCourseInfo();
    fetchLessons();
  }, [id]);

  return (
    <div>
      <h2>Course Detail</h2>
      {courseInfo ? (
        <div>
          <h3>{courseInfo.title}</h3>
          <p>{courseInfo.description}</p>
        </div>
      ) : (
        <p>Loading course details...</p>
      )}

      <h3>Lessons</h3>
      {lessons.length === 0 ? (
        <p>No lessons available or you may not have access.</p>
      ) : (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{lesson.title}</strong><br/>
              {lesson.content}<br/>
              {lesson.video_url && (
                <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">Watch Video</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseDetail;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { Link } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

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

    const fetchQuizzes = async () => {
      try {
        const response = await API.get(`quizzes/?course=${id}`);
        setQuizzes(response.data);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
      }
    };

    fetchCourseInfo();
    fetchLessons();
    fetchQuizzes();
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
        <p>No lessons available.</p>
      ) : (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{lesson.title}</strong><br/>
              {lesson.content}<br/>
              {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">Watch Video</a>}
            </li>
          ))}
        </ul>
      )}

      <h3>Quizzes</h3>
      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              {quiz.title} (Total Marks: {quiz.total_marks}){' '}
              <Link to={`/courses/${id}/quizzes/${quiz.id}`}>Attempt Quiz</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseDetail;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const ManageCourse = () => {
  const { course_id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTotalMarks, setQuizTotalMarks] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const resp = await API.get(`courses/${course_id}/`);
        setCourseInfo(resp.data);
      } catch (err) {
        console.error('Failed to fetch course info', err);
      }
    };

    const fetchLessons = async () => {
      try {
        const resp = await API.get(`lessons/?course=${course_id}`);
        setLessons(resp.data);
      } catch (err) {
        console.error('Failed to fetch lessons', err);
      }
    };

    const fetchQuizzes = async () => {
      try {
        const resp = await API.get(`quizzes/?course=${course_id}`);
        setQuizzes(resp.data);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
      }
    };

    fetchCourse();
    fetchLessons();
    fetchQuizzes();
  }, [course_id]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await API.post('lessons/', {
        course: Number(course_id),
        title: lessonTitle,
        content: lessonContent,
        video_url: lessonVideoUrl
      });
      setMessage('Lesson added!');
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      const resp = await API.get(`lessons/?course=${course_id}`);
      setLessons(resp.data);
    } catch (err) {
      console.error('Failed to add lesson', err);
      setMessage('Failed to add lesson.');
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      await API.post('quizzes/', {
        course: Number(course_id),
        title: quizTitle,
        total_marks: parseInt(quizTotalMarks)
      });
      setMessage('Quiz added!');
      setQuizTitle('');
      setQuizTotalMarks('');
      const resp = await API.get(`quizzes/?course=${course_id}`);
      setQuizzes(resp.data);
    } catch (err) {
      console.error('Failed to add quiz', err);
      setMessage('Failed to add quiz.');
    }
  };

  return (
    <div>
      <h2>Manage Course</h2>
      {courseInfo && (
        <div>
          <h3>{courseInfo.title}</h3>
          <p>{courseInfo.description}</p>
        </div>
      )}

      <h3>Add Lesson</h3>
      <form onSubmit={handleAddLesson}>
        <input
          placeholder="Lesson Title"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
        /><br/>
        <textarea
          placeholder="Lesson Content"
          value={lessonContent}
          onChange={(e) => setLessonContent(e.target.value)}
        /><br/>
        <input
          placeholder="Video URL"
          value={lessonVideoUrl}
          onChange={(e) => setLessonVideoUrl(e.target.value)}
        /><br/>
        <button type="submit">Add Lesson</button>
      </form>

      <h4>Existing Lessons</h4>
      <ul>
        {lessons.map(l => (
          <li key={l.id}>{l.title}</li>
        ))}
      </ul>

      <h3>Add Quiz</h3>
      <form onSubmit={handleAddQuiz}>
        <input
          placeholder="Quiz Title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
        /><br/>
        <input
          placeholder="Total Marks"
          type="number"
          value={quizTotalMarks}
          onChange={(e) => setQuizTotalMarks(e.target.value)}
        /><br/>
        <button type="submit">Add Quiz</button>
      </form>

      <h4>Existing Quizzes</h4>
      <ul>
        {quizzes.map(q => (
          <li key={q.id}>
            {q.title} - {q.total_marks} marks
            {/* For each quiz, we could link to a "ManageQuiz" page to add questions */}
          </li>
        ))}
      </ul>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ManageCourse;
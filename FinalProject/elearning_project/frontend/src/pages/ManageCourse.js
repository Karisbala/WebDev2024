import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const ManageCourse = () => {
  const { course_id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonVideoURL, setNewLessonVideoURL] = useState('');
  const [lessonMessage, setLessonMessage] = useState('');

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

  const handleViewLessonDetails = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLessonMessage('');

    if (!newLessonTitle || !newLessonContent) {
      setLessonMessage('Title and content are required.');
      return;
    }

    try {
      await API.post('lessons/', {
        course: Number(course_id),
        title: newLessonTitle,
        content: newLessonContent,
        video_url: newLessonVideoURL
      });

      setLessonMessage('Lesson added successfully!');
      setNewLessonTitle('');
      setNewLessonContent('');
      setNewLessonVideoURL('');

      const resp = await API.get(`lessons/?course=${course_id}`);
      setLessons(resp.data);

    } catch (err) {
      console.error('Failed to add lesson', err);
      setLessonMessage('Failed to add lesson.');
    }
  };

  return (
    <div className="container">
      <h2>Manage Course</h2>
      {courseInfo && (
        <div className="course-info">
          <h3>{courseInfo.title}</h3>
          <p>{courseInfo.description}</p>
        </div>
      )}

      <h3>Lessons</h3>
      <ul className="lesson-list">
        {lessons.map(l => (
          <li key={l.id} className="lesson-item">
            <strong>{l.title}</strong> 
            <button style={{ marginLeft:'10px' }} onClick={() => handleViewLessonDetails(l)}>View Details</button>
          </li>
        ))}
      </ul>

      {selectedLesson && (
        <div className="course-info" style={{ marginTop:'10px' }}>
          <h4>Lesson Details</h4>
          <p><strong>Title:</strong> {selectedLesson.title}</p>
          <p><strong>Content:</strong> {selectedLesson.content}</p>
          {selectedLesson.video_url && <p><a href={selectedLesson.video_url} target="_blank" rel="noopener noreferrer">Watch Video</a></p>}
          <button onClick={() => setSelectedLesson(null)} style={{ marginTop:'5px' }}>Close Details</button>
        </div>
      )}

      <h4>Add New Lesson</h4>
      <form onSubmit={handleAddLesson}>
        <label>Title:<br/>
          <input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
        </label><br/>
        <label>Content:<br/>
          <textarea value={newLessonContent} onChange={(e) => setNewLessonContent(e.target.value)} />
        </label><br/>
        <label>Video URL:<br/>
          <input value={newLessonVideoURL} onChange={(e) => setNewLessonVideoURL(e.target.value)} />
        </label><br/>
        <button type="submit">Add Lesson</button>
      </form>
      {lessonMessage && <p>{lessonMessage}</p>}

      <h3>Quizzes</h3>
      <ul className="lesson-list">
        {quizzes.map(q => (
          <li key={q.id} className="lesson-item">
            {q.title} - {q.total_marks} marks
            <Link to={`/instructor/manage-quiz/${q.id}`} style={{ marginLeft:'10px' }}>Manage Quiz</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCourse;
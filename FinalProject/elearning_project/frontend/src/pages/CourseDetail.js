import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { Link } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const [isEnrolled, setIsEnrolled] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await API.get('accounts/user/');
        setUserInfo(response.data);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (userInfo) {
        try {
          const enrollResp = await API.get('enrollments/user-enrollments/');
          const enrolledCourses = enrollResp.data;
          const enrolledCourseIds = enrolledCourses.map(c => c.id);
          setIsEnrolled(enrolledCourseIds.includes(Number(id)));
        } catch (err) {
          console.error('Failed to check enrollment', err);
        }
      }
    };
    checkEnrollment();
  }, [userInfo, id]);

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
  
    const fetchReviews = async () => {
      try {
        const response = await API.get(`reviews/?course=${id}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
  
    fetchCourseInfo();
    fetchLessons();
    fetchQuizzes();
    fetchReviews();
  }, [id]); 
  
  useEffect(() => {
    const fetchProgress = async () => {
      if (userInfo && isEnrolled) {
        try {
          const resp = await API.get(`enrollments/progress/?course=${id}`);
          setUserProgress(resp.data);
        } catch (err) {
          console.error('Failed to fetch user progress', err);
        }
      }
    };
    fetchProgress();
  }, [userInfo, isEnrolled, id]);
  
  const isInstructor = userInfo && courseInfo && (courseInfo.instructor === userInfo.id);
  const canReview = isEnrolled && !isInstructor;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!canReview) return;
    try {
      await API.post('reviews/', {
        course: Number(id),
        rating: Number(rating),
        comment
      });
      setReviewMessage('Review posted successfully!');
      setComment('');
      setRating(5);
      const response = await API.get(`reviews/?course=${id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to post review', err);
      setReviewMessage('Failed to post review.');
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await API.post('enrollments/mark-lesson-complete/', {
        course_id: Number(id),
        lesson_id: lessonId
      });
      const resp = await API.get(`enrollments/progress/?course=${id}`);
      setUserProgress(resp.data);
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    }
  };

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
      <ul className="lesson-list">
        {lessons.map((lesson) => {
          const completed = userProgress && userProgress.completed_lessons.includes(lesson.id);
          return (
            <li key={lesson.id} className="lesson-item">
              <strong>{lesson.title}</strong><br/>
              {lesson.content}<br/>
              {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="video-link">Watch Video</a>}
              
              {isEnrolled && (
                completed ? (
                  <span className="done-icon">✓ Completed</span>
                ) : (
                  <button className="complete-btn" onClick={() => markLessonComplete(lesson.id)}>
                    Mark as Completed
                  </button>
                )
              )}
            </li>
          );
        })}
      </ul>

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

      <h3>Your Progress</h3>
      {userProgress ? (
        <div>
          <p>Completed Lessons: {userProgress.completed_lessons.length}</p>
          <p>Quiz Scores:</p>
          {Object.entries(userProgress.quiz_scores).length === 0 ? (
            <p>No quiz scores yet.</p>
          ) : (
            <ul>
              {Object.entries(userProgress.quiz_scores).map(([quizId, score]) => (
                <li key={quizId}>Quiz {quizId}: {score} points</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        isEnrolled ? <p>Loading progress...</p> : <p>Enroll to track progress.</p>
      )}

      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <strong>Rating:</strong> {review.rating} / 5<br/>
              <em>{review.comment}</em><br/>
              By User ID: {review.user}
            </li>
          ))}
        </ul>
      )}

      {canReview && (
        <div style={{ marginTop: '20px' }}>
          <h4>Leave a Review</h4>
          <form onSubmit={handleReviewSubmit}>
            <label>
              Rating (1-5): 
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </label><br/>
            <label>
              Comment:<br/>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label><br/>
            <button type="submit">Submit Review</button>
          </form>
          {reviewMessage && <p>{reviewMessage}</p>}
        </div>
      )}

      {!canReview && userInfo && (
        <p>You must be enrolled and not the instructor to leave a review.</p>
      )}
    </div>
  );
};

export default CourseDetail;
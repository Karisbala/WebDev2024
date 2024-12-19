import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const QuizAttempt = () => {
  const { id, quiz_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await API.get(`quiz-questions/?quiz=${quiz_id}`);
        setQuestions(response.data);
      } catch (err) {
        console.error('Failed to fetch quiz questions', err);
      }
    };

    fetchQuestions();
  }, [quiz_id]);

  const handleChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('quizzes/attempt/', {
        quiz_id: quiz_id,
        answers: answers
      });
      setScore(response.data.score);
    } catch (err) {
      console.error('Quiz attempt failed', err);
      alert('Failed to submit quiz answers. Check console for details.');
    }
  };

  return (
    <div>
      <h2>Attempt Quiz</h2>
      {score !== null ? (
        <div>
          <p>Your score: {score}</p>
          <button onClick={() => navigate(`/courses/${id}`)}>Back to Course</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} style={{ marginBottom: '20px' }}>
              <p><strong>{q.question_text}</strong></p>
              <label>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value="A"
                  onChange={() => handleChange(q.id, "A")}
                />
                {q.option_a}
              </label><br/>
              <label>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value="B"
                  onChange={() => handleChange(q.id, "B")}
                />
                {q.option_b}
              </label><br/>
              <label>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value="C"
                  onChange={() => handleChange(q.id, "C")}
                />
                {q.option_c}
              </label><br/>
              <label>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value="D"
                  onChange={() => handleChange(q.id, "D")}
                />
                {q.option_d}
              </label>
            </div>
          ))}
          {questions.length > 0 && <button type="submit">Submit Quiz</button>}
        </form>
      )}
    </div>
  );
};

export default QuizAttempt;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const ManageQuiz = () => {
  const { quiz_id } = useParams();
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const resp = await API.get(`quizzes/${quiz_id}/`);
        setQuizInfo(resp.data);
      } catch (err) {
        console.error('Failed to fetch quiz info', err);
      }
    };

    const fetchQuestions = async () => {
      try {
        const resp = await API.get(`quiz-questions/?quiz=${quiz_id}`);
        setQuestions(resp.data);
      } catch (err) {
        console.error('Failed to fetch quiz questions', err);
      }
    };

    fetchQuiz();
    fetchQuestions();
  }, [quiz_id]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      await API.post('quiz-questions/', {
        quiz: Number(quiz_id),
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption
      });

      setMessage('Question added successfully!');
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');

      const resp = await API.get(`quiz-questions/?quiz=${quiz_id}`);
      setQuestions(resp.data);

    } catch (err) {
      console.error('Failed to add question', err);
      setMessage('Failed to add question.');
    }
  };

  return (
    <div className="container">
      <h2>Manage Quiz</h2>
      {quizInfo ? (
        <div className="quiz-info">
          <h3>{quizInfo.title}</h3>
          <p>Total Marks: {quizInfo.total_marks}</p>
        </div>
      ) : (
        <p>Loading quiz info...</p>
      )}

      <h3>Add New Question</h3>
      <form onSubmit={handleAddQuestion} className="question-form">
        <label>Question Text:
          <textarea 
            value={questionText} 
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </label>

        <div className="options-container">
          <label>Option A:
            <input 
              type="text" 
              value={optionA} 
              onChange={(e) => setOptionA(e.target.value)} 
              className="option-input"
            />
          </label>
          <label>Option B:
            <input 
              type="text" 
              value={optionB} 
              onChange={(e) => setOptionB(e.target.value)}
              className="option-input"
            />
          </label>
          <label>Option C:
            <input 
              type="text" 
              value={optionC} 
              onChange={(e) => setOptionC(e.target.value)}
              className="option-input"
            />
          </label>
          <label>Option D:
            <input 
              type="text" 
              value={optionD} 
              onChange={(e) => setOptionD(e.target.value)} 
              className="option-input"
            />
          </label>
        </div>

        <label>Correct Option:
          <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        <button type="submit" className="add-question-btn">Add Question</button>
      </form>
      {message && <p className="message">{message}</p>}

      <h3>Existing Questions</h3>
      <ul className="questions-list">
        {questions.map((q) => (
          <li key={q.id} className="question-item">
            <p><strong>{q.question_text}</strong></p>
            <ul className="option-list">
              <li className={q.correct_option === 'A' ? 'correct-option' : ''}>A: {q.option_a}</li>
              <li className={q.correct_option === 'B' ? 'correct-option' : ''}>B: {q.option_b}</li>
              <li className={q.correct_option === 'C' ? 'correct-option' : ''}>C: {q.option_c}</li>
              <li className={q.correct_option === 'D' ? 'correct-option' : ''}>D: {q.option_d}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageQuiz;
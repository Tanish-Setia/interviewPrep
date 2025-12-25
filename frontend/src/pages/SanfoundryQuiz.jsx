import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SanfoundryQuestionCard from '../components/SanfoundryQuestionCard';
import { getMCQQuestions } from '../services/api';
import './SanfoundryQuiz.css';

const SanfoundryQuiz = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizStats, setQuizStats] = useState({
    attempted: 0,
    correct: 0,
    wrong: 0
  });

  useEffect(() => {
    if (category) {
      fetchQuestions(category);
    } else {
      setLoading(false);
    }
  }, [category]);

  const fetchQuestions = async (cat) => {
  setLoading(true);
  try {
    const isCompanyRoute = window.location.pathname.includes('/company/');
    const params = isCompanyRoute 
      ? { company: cat, limit: 20 }
      : { category: cat, limit: 20 };
    
    const data = await getMCQQuestions(params);
    setQuestions(data.questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    if (error.response?.data?.requiresSubscription) {
      alert('Premium subscription required! Redirecting to subscription page...');
      navigate('/subscription');
    } else {
      alert('Failed to load questions. Please try importing them first.');
    }
  } finally {
    setLoading(false);
  }
};


  const handleNext = (wasCorrect) => {
    setQuizStats(prev => ({
      attempted: prev.attempted + 1,
      correct: wasCorrect ? prev.correct + 1 : prev.correct,
      wrong: wasCorrect ? prev.wrong : prev.wrong + 1
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const score = ((quizStats.correct + 1) / questions.length * 100).toFixed(1);
    alert(`Quiz Completed!\n\nScore: ${score}%\nCorrect: ${quizStats.correct + 1}/${questions.length}\nWrong: ${quizStats.wrong}`);
    navigate('/practice');
  };

  const handleBackToCategories = () => {
    navigate('/practice');
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (!category) {
    return (
      <div className="no-category">
        <h2>Please select a category from the Practice page</h2>
        <button onClick={handleBackToCategories}>Go to Practice</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="no-questions">
        <h2>No questions available for {category}</h2>
        <p>Please import questions first using Postman or the admin panel.</p>
        <button onClick={handleBackToCategories}>Back to Practice</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-btn" onClick={handleBackToCategories}>
          ← Back to Practice
        </button>
        <h1>{category} - MCQ Practice</h1>
        <div className="quiz-stats">
          <span className="stat">Score: {quizStats.attempted > 0 ? ((quizStats.correct / quizStats.attempted) * 100).toFixed(0) : 0}%</span>
          <span className="stat correct">✓ {quizStats.correct}</span>
          <span className="stat wrong">✗ {quizStats.wrong}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <SanfoundryQuestionCard
        question={questions[currentIndex]}
        onNext={handleNext}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    </div>
  );
};

export default SanfoundryQuiz;
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuestionView.css';

const QuestionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Wrap in useMemo to prevent re-creation on every render
  const questionsFromState = useMemo(() => {
    return location.state?.questions || [];
  }, [location.state]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = questionsFromState[currentIndex];

  useEffect(() => {
    if (!questionsFromState || questionsFromState.length === 0) {
      alert('No questions available');
      navigate('/practice');
    }
  }, [questionsFromState, navigate]);

  // ... rest of your code stays the same


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) {
      alert('Please select an option first');
      return;
    }

    const isCorrect =
      question.correctAnswer &&
      (question.correctAnswer.toLowerCase() === selectedAnswer.toLowerCase() ||
       question.correctAnswer.toLowerCase() === question.options[selectedAnswer.charCodeAt(0) - 65]?.toLowerCase());

    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, { questionId: question._id, selected: selectedAnswer, correct: isCorrect }]);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < questionsFromState.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setAnswers([]);
    setScore(0);
    setQuizCompleted(false);
  };

  if (!question) {
    return (
      <div className="question-view-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted) {
    const percentage = ((score / questionsFromState.length) * 100).toFixed(1);
    
    return (
      <div className="question-view-page">
        <div className="container">
          <div className="question-detail" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎉 Quiz Completed!</h1>
            <div style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444',
              margin: '40px 0'
            }}>
              {score} / {questionsFromState.length}
            </div>
            <p style={{ fontSize: '24px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
              You scored {percentage}%
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleReset}>
                Retry Quiz
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/practice')}>
                Back to Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-view-page">
      <div className="container">
        <button onClick={() => navigate('/practice')} className="back-button">
          ← Back to Practice
        </button>

        {/* Progress Bar */}
        <div style={{
          background: '#e5e7eb',
          height: '8px',
          borderRadius: '4px',
          margin: '20px 0',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'var(--primary-color)',
            height: '100%',
            width: `${((currentIndex + 1) / questionsFromState.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            Question {currentIndex + 1} of {questionsFromState.length}
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary-color)' }}>
            Score: {score}
          </p>
        </div>

        <div className="question-detail">
          <div className="question-header">
            <h1>{question.title || question.body}</h1>
            <div className="question-badges">
              <span
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <div className="question-body">
            {question.type === 'mcq' && question.options && question.options.length > 0 && (
              <div className="mcq-section">
                <h3>Options:</h3>
                <div className="options-list">
                  {question.options.map((option, idx) => {
                    const optionLabel = String.fromCharCode(65 + idx);
                    const isSelected = selectedAnswer === optionLabel;
                    const isCorrect =
                      question.correctAnswer &&
                      (question.correctAnswer.toLowerCase() === optionLabel.toLowerCase() ||
                       question.correctAnswer.toLowerCase() === option.toLowerCase());

                    const isWrongSelection = showAnswer && isSelected && !isCorrect;

                    return (
                      <div
                        key={idx}
                        className={`option-item ${isSelected ? 'selected' : ''} ${
                          showAnswer && isCorrect ? 'correct' : ''
                        } ${isWrongSelection ? 'incorrect' : ''}`}
                        onClick={() => !showAnswer && setSelectedAnswer(optionLabel)}
                        style={{ cursor: showAnswer ? 'not-allowed' : 'pointer' }}
                      >
                        <span className="option-label">{optionLabel}.</span>
                        <span className="option-text">{option}</span>
                        {showAnswer && isCorrect && (
                          <span className="correct-badge">✓ Correct</span>
                        )}
                        {isWrongSelection && (
                          <span className="incorrect-badge">✗ Incorrect</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {showAnswer && question.explanation && (
                  <div className="explanation-section">
                    <h4>Explanation:</h4>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
            )}

            <div className="question-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              {!showAnswer ? (
                <button
                  className="btn btn-primary"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                >
                  Check Answer
                </button>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                    ← Previous
                  </button>
                  <button className="btn btn-primary" onClick={handleNext}>
                    {currentIndex < questionsFromState.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
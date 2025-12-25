import React, { useState } from 'react';
import './SanfoundryQuestionCard.css';

// const SanfoundryQuestionCard = ({ question, onNext, questionNumber, totalQuestions }) => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [isCorrect, setIsCorrect] = useState(null);

//   const handleOptionSelect = (option) => {
//     if (!showAnswer) {
//       setSelectedOption(option);
//     }
//   };

//   const handleViewAnswer = () => {
//     if (!selectedOption) {
//       alert('Please select an option first!');
//       return;
//     }
    
//     setShowAnswer(true);
//     const correct = selectedOption === question.correctAnswer.toLowerCase();
//     setIsCorrect(correct);
//   };

//   const handleNext = () => {
//     onNext(isCorrect); // Pass whether answer was correct
//     // Reset for next question
//     setSelectedOption(null);
//     setShowAnswer(false);
//     setIsCorrect(null);
//   };

//   const getOptionLabel = (index) => {
//     return String.fromCharCode(97 + index); // a, b, c, d
//   };

//   return (
//     <div className="sanfoundry-question-card">
//       <div className="question-body">
//         <h3 className="question-title">{questionNumber}. {question.body}</h3>
//       </div>

//       <div className="options-container">
//         {question.options.map((option, index) => {
//           const optionLabel = getOptionLabel(index);
//           const isSelected = selectedOption === optionLabel;
//           const isCorrectOption = showAnswer && optionLabel === question.correctAnswer.toLowerCase();
//           const isWrongSelection = showAnswer && isSelected && !isCorrect;

//           return (
//             <div
//               key={index}
//               className={`option ${isSelected ? 'selected' : ''} ${
//                 isCorrectOption ? 'correct' : ''
//               } ${isWrongSelection ? 'wrong' : ''} ${showAnswer ? 'disabled' : ''}`}
//               onClick={() => handleOptionSelect(optionLabel)}
//             >
//               <span className="option-label">{optionLabel})</span>
//               <span className="option-text">{option}</span>
//               {isCorrectOption && <span className="check-mark">✓</span>}
//               {isWrongSelection && <span className="cross-mark">✗</span>}
//             </div>
//           );
//         })}
//       </div>

//       {!showAnswer && (
//         <button className="view-answer-btn" onClick={handleViewAnswer}>
//           View Answer
//         </button>
//       )}

//       {showAnswer && (
//         <div className="answer-section">
//           <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
//             {isCorrect ? (
//               <>
//                 <span className="result-icon">✓</span>
//                 <span>Correct! Well done.</span>
//               </>
//             ) : (
//               <>
//                 <span className="result-icon">✗</span>
//                 <span>
//                   Incorrect. The correct answer is{' '}
//                   <strong>{question.correctAnswer.toLowerCase()})</strong>
//                 </span>
//               </>
//             )}
//           </div>

//           {question.explanation && (
//             <div className="explanation">
//               <h4>Explanation:</h4>
//               <p>{question.explanation}</p>
//             </div>
//           )}

//           {question.tags && question.tags.length > 0 && (
//             <div className="tags">
//               {question.tags.map((tag, index) => (
//                 <span key={index} className="tag">{tag}</span>
//               ))}
//             </div>
//           )}

//           <button className="next-btn" onClick={handleNext}>
//             {questionNumber < totalQuestions ? 'Next Question →' : 'Finish Quiz'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SanfoundryQuestionCard;

// SanfoundryQuestionCard.jsx
const SanfoundryQuestionCard = ({ question, onNext, questionNumber, totalQuestions }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleOptionSelect = (index) => {
    if (!showAnswer) {
      setSelectedOption(index);
    }
  };

  const handleViewAnswer = () => {
    if (selectedOption === null) {
      alert('Please select an option first!');
      return;
    }

    // backend answer is either letter ("a"/"b"/..) or full text
    const correctIndexFromLetter =
      ['a', 'b', 'c', 'd'].indexOf(question.answer.toLowerCase());
    const correctIndex =
      correctIndexFromLetter !== -1
        ? correctIndexFromLetter
        : question.options.findIndex(
            opt => opt.toLowerCase() === question.answer.toLowerCase()
          );

    const correct = selectedOption === correctIndex;
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  return (
    <div className="sanfoundry-question-card">
      <div className="question-body">
        <h3 className="question-title">
          {questionNumber}. {question.question}
        </h3>
      </div>

      <div className="options-container">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectOption =
            showAnswer &&
            (['a','b','c','d'][idx] === question.answer.toLowerCase() ||
             opt.toLowerCase() === question.answer.toLowerCase());

          const isWrongSelection =
            showAnswer && isSelected && !isCorrectOption;

          return (
            <div
              key={idx}
              className={`option ${isSelected ? 'selected' : ''} ${
                isCorrectOption ? 'correct' : ''
              } ${isWrongSelection ? 'wrong' : ''} ${showAnswer ? 'disabled' : ''}`}
              onClick={() => handleOptionSelect(idx)}
            >
              <span className="option-label">
                {String.fromCharCode(65 + idx)})
              </span>
              <span className="option-text">{opt}</span>
            </div>
          );
        })}
      </div>

      {!showAnswer && (
        <button className="view-answer-btn" onClick={handleViewAnswer}>
          View Answer
        </button>
      )}

      {showAnswer && (
        <div className="answer-section">
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Incorrect.'}
          </div>

          {question.explanation && (
            <div className="explanation">
              <h4>Explanation:</h4>
              <p>{question.explanation}</p>
            </div>
          )}

          <button className="next-btn" onClick={() => {
            setShowAnswer(false);
            setSelectedOption(null);
            setIsCorrect(null);
            onNext(isCorrect);
          }}>
            {questionNumber < totalQuestions ? 'Next Question →' : 'Finish Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};
export default SanfoundryQuestionCard;
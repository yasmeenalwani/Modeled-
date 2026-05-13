import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient();

const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  streakBadge: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  question: {
    fontSize: '1rem',
    color: '#4A2A1A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  option: {
    padding: '0.75rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s',
  },
  optionSelected: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  explanation: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  xpEarned: {
    textAlign: 'center',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function DailyQuestionWidget({ modelId, onXPUpdate }) {
  const { user } = useAuthenticator();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayQuestion();
    loadStreak();
  }, [modelId]);

  const loadTodayQuestion = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await client.models.DailyQuestion.list({
        filter: {
          scheduledDate: { eq: today },
          isActive: { eq: true },
        },
      });

      if (data && data.length > 0) {
        const q = data[0];
        
        // Check if already answered
        const { data: answers } = await client.models.QuestionAnswer.list({
          filter: {
            modelId: { eq: modelId },
            questionId: { eq: q.id },
          },
        });

        if (answers && answers.length > 0) {
          setAnswered(true);
        } else {
          setQuestion(q);
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    // Calculate streak from recent answers
    try {
      const { data: answers } = await client.models.QuestionAnswer.list({
        filter: { modelId: { eq: modelId } },
      });
      
      if (answers && answers.length > 0) {
        // Simple streak calculation (would be more sophisticated in production)
        setStreak(answers.length);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;

    try {
      const isCorrect = question.correctAnswer === selectedAnswer;
      const xpEarned = question.xpReward || 50;

      await client.models.QuestionAnswer.create({
        modelId,
        questionId: question.id,
        answer: selectedAnswer,
        isCorrect,
        xpEarned,
      });

      setAnswered(true);
      if (onXPUpdate) {
        onXPUpdate(xpEarned);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading question...</div>;
  }

  if (answered || !question) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Daily Question</div>
        <div style={{ textAlign: 'center', padding: '1rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
          {answered ? 'You\'ve answered today\'s question!' : 'No question available today. Check back tomorrow!'}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Daily Question</div>
        <div style={styles.streakBadge}>{streak} day streak</div>
      </div>

      <div style={styles.question}>{question.question}</div>

      {question.questionType === 'multiple_choice' && question.options && (
        <div style={styles.options}>
          {question.options.map((option, idx) => (
            <div
              key={idx}
              style={{
                ...styles.option,
                ...(selectedAnswer === option.value ? styles.optionSelected : {}),
              }}
              onClick={() => setSelectedAnswer(option.value)}
            >
              {option.text || option.value}
            </div>
          ))}
        </div>
      )}

      {question.questionType === 'true_false' && (
        <div style={styles.options}>
          <div
            style={{
              ...styles.option,
              ...(selectedAnswer === 'true' ? styles.optionSelected : {}),
            }}
            onClick={() => setSelectedAnswer('true')}
          >
            True
          </div>
          <div
            style={{
              ...styles.option,
              ...(selectedAnswer === 'false' ? styles.optionSelected : {}),
            }}
            onClick={() => setSelectedAnswer('false')}
          >
            False
          </div>
        </div>
      )}

      <button
        style={styles.submitButton}
        onClick={handleSubmit}
        disabled={!selectedAnswer}
      >
        Submit Answer (+{question.xpReward || 50} XP)
      </button>

      {answered && question.explanation && (
        <div style={styles.explanation}>
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}


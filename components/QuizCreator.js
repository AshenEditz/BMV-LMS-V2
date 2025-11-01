import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function QuizCreator({ teacher, onClose, onCreated }) {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const createQuiz = async (e) => {
    e.preventDefault();

    try {
      const quiz = {
        ...quizData,
        teacherId: teacher.teacherId,
        teacherName: teacher.name,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
        responses: [],
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quiz);

      // Notify teacher's group
      await addDoc(collection(db, 'chats', 'teachers-group', 'messages'), {
        text: `📝 ${teacher.name} created a new quiz: "${quizData.title}"`,
        userId: 'system',
        userName: 'System',
        timestamp: new Date().toISOString(),
      });

      toast.success('Quiz created successfully!');
      onCreated();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-effect p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Create Quiz 📝</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-500 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={createQuiz} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-semibold">Quiz Title</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
              placeholder="e.g., Mathematics Quiz - Chapter 1"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-semibold">Description</label>
            <textarea
              value={quizData.description}
              onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white resize-none"
              rows="3"
              placeholder="Brief description of the quiz"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Add Question
              </button>
            </div>

            {quizData.questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 p-4 rounded-lg border border-white/10"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-semibold">Question {qIndex + 1}</h4>
                  {quizData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white mb-3"
                  placeholder="Enter question"
                  required
                />

                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg"
            >
              ✅ Create Quiz
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>

          <p className="text-yellow-400 text-sm text-center">
            ⏰ This quiz will be valid for 12 hours. Students who complete it will earn the "Form Master" badge!
          </p>
        </form>
      </motion.div>
    </div>
  );
}
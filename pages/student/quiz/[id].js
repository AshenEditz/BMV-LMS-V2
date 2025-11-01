import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import StudentLayout from '../../../components/StudentLayout';

export default function TakeQuiz() {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Get student data
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const studentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setStudent(studentData);

        // Get quiz data
        const quizDoc = await getDoc(doc(db, 'quizzes', id));
        if (quizDoc.exists()) {
          const quizData = { id: quizDoc.id, ...quizDoc.data() };
          
          // Check if quiz is expired
          if (new Date(quizData.expiresAt) < new Date()) {
            toast.error('This quiz has expired');
            router.push('/student');
            return;
          }

          // Check if student already submitted
          const hasSubmitted = quizData.responses?.some(r => r.studentId === studentData.studentId);
          if (hasSubmitted) {
            toast.error('You have already submitted this quiz');
            router.push('/student');
            return;
          }

          setQuiz(quizData);
        } else {
          toast.error('Quiz not found');
          router.push('/student');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
      setScore(finalScore);

      // Save response
      const response = {
        studentId: student.studentId,
        studentName: student.name,
        answers: answers,
        score: finalScore,
        submittedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'quizzes', id), {
        responses: arrayUnion(response)
      });

      // Award Form Master badge
      const newBadge = {
        type: 'form-master',
        awardedBy: quiz.teacherName,
        awardedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
      };

      const studentBadges = student.badges || [];
      await updateDoc(doc(db, 'students', student.id), {
        badges: [...studentBadges, newBadge]
      });

      setSubmitted(true);
      toast.success(`Quiz submitted! You scored ${finalScore}% and earned the Form Master badge! 🏆`);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading quiz...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <StudentLayout student={student}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass-effect p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Congratulations!
            </h1>
            <p className="text-gray-300 text-xl mb-6">
              You scored {score}%
            </p>
            <div className="bg-primary/20 border-2 border-primary rounded-lg p-4 mb-6">
              <p className="text-white font-bold">🏆 Form Master Badge Earned!</p>
              <p className="text-gray-300 text-sm mt-2">Valid for 12 hours</p>
            </div>
            <button
              onClick={() => router.push('/student')}
              className="bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout student={student}>
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{quiz?.title}</h1>
          <p className="text-gray-300 mb-4">{quiz?.description}</p>
          <div className="flex justify-between text-sm text-gray-400">
            <span>By: {quiz?.teacherName}</span>
            <span>Questions: {quiz?.questions?.length}</span>
          </div>
        </motion.div>

        <div className="space-y-6">
          {quiz?.questions?.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="glass-effect p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">
                {qIndex + 1}. {question.question}
              </h3>
              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                      answers[qIndex] === oIndex
                        ? 'bg-primary/30 border-2 border-primary'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                      className="w-5 h-5 mr-3"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={submitQuiz}
            className="bg-primary hover:bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-xl"
          >
            Submit Quiz 📝
          </button>
        </motion.div>
      </div>
    </StudentLayout>
  );
}
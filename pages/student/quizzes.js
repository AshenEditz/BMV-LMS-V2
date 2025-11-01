import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import StudentLayout from '../../components/StudentLayout';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function StudentQuizzes() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const studentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setStudent(studentData);
        
        // Fetch all quizzes
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzesData = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter valid quizzes
        const validQuizzes = quizzesData.filter(quiz => {
          const notExpired = new Date(quiz.expiresAt) > new Date();
          const notSubmitted = !quiz.responses?.some(r => r.studentId === studentData.studentId);
          return notExpired && notSubmitted;
        });

        setQuizzes(validQuizzes);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <StudentLayout student={student}>
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Available Quizzes 📝
          </h1>
          <p className="text-gray-300">Complete quizzes to earn Form Master badges!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const timeLeft = new Date(quiz.expiresAt) - new Date();
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-effect p-6 rounded-lg cursor-pointer"
                onClick={() => router.push(`/student/quiz/${quiz.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <FaClipboardList className="text-primary text-3xl" />
                  {hoursLeft < 3 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      Expiring Soon!
                    </span>
                  )}
                </div>

                <h3 className="text-white font-bold text-xl mb-2">{quiz.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <FaClipboardList className="text-primary" />
                    <span>{quiz.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <FaClock className="text-yellow-400" />
                    <span>{hoursLeft}h {minutesLeft}m left</span>
                  </div>
                </div>

                <div className="bg-primary/20 border border-primary rounded-lg p-3 mb-4">
                  <p className="text-primary text-sm font-semibold">🏆 Reward</p>
                  <p className="text-white text-xs">Form Master Badge (12 hours)</p>
                </div>

                <button className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors">
                  Take Quiz →
                </button>

                <p className="text-gray-500 text-xs mt-2 text-center">
                  By {quiz.teacherName}
                </p>
              </motion.div>
            );
          })}
        </div>

        {quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaClipboardList className="text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No quizzes available</p>
            <p className="text-gray-500 mt-2">Check back later for new quizzes</p>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}

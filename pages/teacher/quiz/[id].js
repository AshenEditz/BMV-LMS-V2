import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { motion } from 'framer-motion';
import TeacherLayout from '../../../components/TeacherLayout';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function QuizResults() {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', id));
      if (quizDoc.exists()) {
        setQuiz({ id: quizDoc.id, ...quizDoc.data() });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setLoading(false);
    }
  };

  const exportResults = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Buthpitiya M.V - Quiz Results', 14, 20);
    doc.setFontSize(12);
    doc.text(`Quiz: ${quiz.title}`, 14, 30);
    
    const tableData = quiz.responses?.map(r => [
      r.studentId,
      r.studentName,
      `${r.score}%`,
      new Date(r.submittedAt).toLocaleString()
    ]) || [];

    doc.autoTable({
      startY: 40,
      head: [['Student ID', 'Name', 'Score', 'Submitted At']],
      body: tableData,
    });
    
    doc.save(`quiz-results-${id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const averageScore = quiz?.responses?.length > 0
    ? Math.round(quiz.responses.reduce((acc, r) => acc + r.score, 0) / quiz.responses.length)
    : 0;

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/teacher')}
            className="text-white hover:text-primary flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <button
            onClick={exportResults}
            className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
          >
            <FaDownload /> Export Results
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{quiz?.title}</h1>
          <p className="text-gray-300 mb-4">{quiz?.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Total Responses</p>
              <p className="text-3xl font-bold text-white">{quiz?.responses?.length || 0}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-primary">{averageScore}%</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Questions</p>
              <p className="text-3xl font-bold text-white">{quiz?.questions?.length || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Student Responses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Student ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">Submitted At</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {quiz?.responses?.map((response, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="p-3">{response.studentId}</td>
                    <td className="p-3">{response.studentName}</td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        response.score >= 75 ? 'text-green-400' :
                        response.score >= 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {response.score}%
                      </span>
                    </td>
                    <td className="p-3">{new Date(response.submittedAt).toLocaleString()}</td>
                    <td className="p-3">
                      {response.score >= 75 ? '🏆 Excellent' :
                       response.score >= 50 ? '👍 Good' :
                       '📚 Need Improvement'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!quiz?.responses || quiz.responses.length === 0) && (
              <p className="text-gray-400 text-center py-8">No responses yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </TeacherLayout>
  );
}
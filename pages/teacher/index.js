import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db, storage } from '../../firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import TeacherLayout from '../../components/TeacherLayout';
import ChatBox from '../../components/ChatBox';
import QuizCreator from '../../components/QuizCreator';
import { FaUsers, FaClipboardList, FaChalkboardTeacher, FaMedal } from 'react-icons/fa';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
      const teachersRef = collection(db, 'teachers');
      const q = query(teachersRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const teacherData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setTeacher(teacherData);
        
        // Fetch all students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        setStudents(studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch all teachers
        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        setTeachers(teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch teacher's quizzes
        const quizzesRef = collection(db, 'quizzes');
        const quizzesQuery = query(quizzesRef, where('teacherId', '==', teacherData.teacherId));
        onSnapshot(quizzesQuery, (snapshot) => {
          setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setLoading(false);
    }
  };

  const giveBadge = async (studentId, badgeType) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      const studentDoc = await getDocs(query(collection(db, 'students'), where('studentId', '==', studentId)));
      
      if (studentDoc.empty) {
        toast.error('Student not found');
        return;
      }

      const student = studentDoc.docs[0];
      const studentData = student.data();
      const badges = studentData.badges || [];

      const newBadge = {
        type: badgeType,
        awardedBy: teacher.teacherId,
        awardedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await updateDoc(doc(db, 'students', student.id), {
        badges: [...badges, newBadge]
      });

      // Log the action
      await addDoc(collection(db, 'logs'), {
        action: `Teacher ${teacher.name} gave ${badgeType} badge to ${studentData.name}`,
        timestamp: new Date().toISOString(),
      });

      // Notify teacher's group
      await addDoc(collection(db, 'chats', 'teachers-group', 'messages'), {
        text: `🏆 ${teacher.name} awarded ${badgeType} badge to ${studentData.name}`,
        userId: 'system',
        userName: 'System',
        timestamp: new Date().toISOString(),
      });

      toast.success(`Badge awarded to ${studentData.name}!`);
    } catch (error) {
      console.error('Error giving badge:', error);
      toast.error('Failed to award badge');
    }
  };

  const uploadToGroupChat = async (gradeClass, file) => {
    try {
      const storageRef = ref(storage, `chat-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'chats', `grade-${gradeClass}`, 'messages'), {
        image: downloadURL,
        userId: teacher.teacherId,
        userName: teacher.name,
        timestamp: new Date().toISOString(),
      });

      toast.success('Image uploaded to group chat!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
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
    <TeacherLayout teacher={teacher}>
      <Toaster position="top-center" />
      
      <div className="p-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            ආයුබෝවන් {teacher?.name}! 👨‍🏫
          </h1>
          <p className="text-gray-300">Welcome to your teaching dashboard</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaUsers className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{students.length}</h3>
            <p className="text-gray-300">Total Students</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaChalkboardTeacher className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{teachers.length}</h3>
            <p className="text-gray-300">Total Teachers</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaClipboardList className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{quizzes.length}</h3>
            <p className="text-gray-300">My Quizzes</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuizCreator(true)}
            className="bg-primary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaClipboardList /> Create New Quiz
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/teacher/students')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaMedal /> Award Badges
          </motion.button>
        </div>

        {/* My Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">📝 My Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map(quiz => (
              <motion.div
                key={quiz.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 p-4 rounded-lg border border-white/10 cursor-pointer"
                onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
              >
                <h3 className="text-white font-bold mb-2">{quiz.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{quiz.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary">
                    {quiz.responses?.length || 0} responses
                  </span>
                  <span className="text-gray-400">
                    {quiz.questions?.length || 0} questions
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
            {quizzes.length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-8">
                No quizzes created yet. Create your first quiz!
              </p>
            )}
          </div>
        </motion.div>

        {/* Grade Chats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChatBox
            chatId="teachers-group"
            title="Teachers Group Chat 👨‍🏫"
            user={{
              id: teacher?.teacherId,
              name: teacher?.name,
              badges: []
            }}
          />

          <div className="glass-effect p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors">
                Message Principal
              </button>
              <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors">
                View All Students
              </button>
              <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition-colors">
                Upload Material
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Creator Modal */}
        {showQuizCreator && (
          <QuizCreator
            teacher={teacher}
            onClose={() => setShowQuizCreator(false)}
            onCreated={() => {
              setShowQuizCreator(false);
              toast.success('Quiz created successfully!');
            }}
          />
        )}
      </div>
    </TeacherLayout>
  );
}

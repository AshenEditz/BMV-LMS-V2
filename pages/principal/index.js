import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import PrincipalLayout from '../../components/PrincipalLayout';
import ChatBox from '../../components/ChatBox';
import { FaUsers, FaChalkboardTeacher, FaBullhorn, FaMedal } from 'react-icons/fa';

export default function PrincipalDashboard() {
  const router = useRouter();
  const [principal, setPrincipal] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcement, setAnnouncement] = useState('');
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
      setPrincipal({
        id: 'BMVP001',
        name: 'Principal',
        email: user.email,
      });

      // Fetch students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      setStudents(studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      setTeachers(teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        message: announcement,
        timestamp: new Date().toISOString(),
        author: 'Principal',
      });

      // Also send to all class chats
      const grades = ['6', '7', '8', '9', '10', '11', '12', '13'];
      const classes = ['A', 'B', 'C', 'D'];

      for (const grade of grades) {
        for (const cls of classes) {
          await addDoc(collection(db, 'chats', `grade-${grade}-${cls}`, 'messages'), {
            text: `📢 Principal Announcement: ${announcement}`,
            userId: 'principal',
            userName: 'Principal',
            userBadges: [],
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Send to teachers group
      await addDoc(collection(db, 'chats', 'teachers-group', 'messages'), {
        text: `📢 Principal Announcement: ${announcement}`,
        userId: 'principal',
        userName: 'Principal',
        userBadges: [],
        timestamp: new Date().toISOString(),
      });

      toast.success('Announcement sent to all!');
      setAnnouncement('');
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    }
  };

  const giveBestChildBadge = async (studentId) => {
    try {
      const studentDoc = students.find(s => s.studentId === studentId);
      if (!studentDoc) {
        toast.error('Student not found');
        return;
      }

      const badges = studentDoc.badges || [];
      const newBadge = {
        type: 'best-child',
        awardedBy: 'Principal',
        awardedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await updateDoc(doc(db, 'students', studentDoc.id), {
        badges: [...badges, newBadge]
      });

      toast.success(`Best Child badge awarded to ${studentDoc.name}!`);
    } catch (error) {
      console.error('Error giving badge:', error);
      toast.error('Failed to award badge');
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
    <PrincipalLayout>
      <Toaster position="top-center" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <motion.h1
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl font-bold text-white mb-2"
          >
            ආයුබෝවන් Principal Sir! 👑
          </motion.h1>
          <p className="text-gray-300 text-xl">Buthpitiya M.V Management Dashboard</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-8 text-center"
          >
            <FaUsers className="text-6xl text-primary mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-white">{students.length}</h3>
            <p className="text-gray-300 text-lg">Total Students</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-8 text-center"
          >
            <FaChalkboardTeacher className="text-6xl text-primary mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-white">{teachers.length}</h3>
            <p className="text-gray-300 text-lg">Total Teachers</p>
          </motion.div>
        </div>

        {/* Announcement Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaBullhorn className="text-primary" /> Send Announcement
          </h2>
          <form onSubmit={sendAnnouncement} className="space-y-4">
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Type your announcement here..."
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg"
            >
              📢 Send to Everyone
            </motion.button>
          </form>
        </motion.div>

        {/* Students & Teachers Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Students List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Students Overview</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.slice(0, 10).map(student => (
                <div key={student.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{student.name}</p>
                    <p className="text-gray-400 text-sm">Grade {student.grade}-{student.class}</p>
                  </div>
                  <button
                    onClick={() => giveBestChildBadge(student.studentId)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded text-sm"
                  >
                    👑 Best Child
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Teachers List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Teachers Overview</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white font-semibold">{teacher.name}</p>
                  <p className="text-gray-400 text-sm">{teacher.teacherId}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Chat Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChatBox
            chatId="teachers-group"
            title="Teachers Group 👨‍🏫"
            user={{
              id: 'principal',
              name: 'Principal',
              badges: []
            }}
          />

          <ChatBox
            chatId="grade-13-A"
            title="Grade 13-A (Example)"
            user={{
              id: 'principal',
              name: 'Principal',
              badges: []
            }}
          />
        </div>
      </div>
    </PrincipalLayout>
  );
        }

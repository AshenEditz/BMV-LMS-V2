import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import StudentLayout from '../../components/StudentLayout';
import BadgeDisplay from '../../components/BadgeDisplay';
import ChatBox from '../../components/ChatBox';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
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
      // Get student data
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const studentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setStudent(studentData);
        
        // Fetch announcements
        const announcementsRef = collection(db, 'announcements');
        onSnapshot(announcementsRef, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAnnouncements(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
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
      
      <div className="p-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            ආයුබෝවන් {student?.name}! 🎓
          </h1>
          <p className="text-gray-300">Welcome to your learning dashboard</p>
        </motion.div>

        {/* Student Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">My Information</h2>
            <div className="space-y-2 text-white">
              <p><span className="font-semibold">Student ID:</span> {student?.studentId}</p>
              <p><span className="font-semibold">Grade:</span> {student?.grade}</p>
              <p><span className="font-semibold">Class:</span> {student?.class}</p>
              <p><span className="font-semibold">Badges:</span> {student?.badges?.length || 0}</p>
            </div>
          </motion.div>

          {/* Badges Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">My Badges</h2>
            <BadgeDisplay badges={student?.badges || []} />
          </motion.div>
        </div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">📢 Principal Announcements</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {announcements.map(announcement => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 p-4 rounded-lg border-l-4 border-primary"
              >
                <p className="text-white mb-2">{announcement.message}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(announcement.timestamp).toLocaleString()}
                </p>
              </motion.div>
            ))}
            {announcements.length === 0 && (
              <p className="text-gray-400 text-center">No announcements yet</p>
            )}
          </div>
        </motion.div>

        {/* Grade Chat */}
        <ChatBox
          chatId={`grade-${student?.grade}-${student?.class}`}
          title={`Grade ${student?.grade}-${student?.class} Chat`}
          user={{
            id: student?.studentId,
            name: student?.name,
            badges: student?.badges || []
          }}
        />
      </div>
    </StudentLayout>
  );
}
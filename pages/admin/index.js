import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { nanoid } from 'nanoid';
import AdminLayout from '../../components/AdminLayout';
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBug, FaPrint, FaPlus } from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, teachers: 0, principal: 0 });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [logs, setLogs] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    class: '',
    password: '',
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const user = auth.currentUser;
    if (!user || user.email !== 'admin@buthpitiya.lk') {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);

      // Fetch teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teachersData);

      // Fetch logs
      const logsSnapshot = await getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc')));
      const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData.slice(0, 10)); // Last 10 logs

      setStats({
        students: studentsData.length,
        teachers: teachersData.length,
        principal: 1
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    }
  };

  const generateStudentId = async () => {
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const count = studentsSnapshot.size + 1;
    return `BMVS${String(count).padStart(8, '0')}`;
  };

  const generateTeacherId = async () => {
    const teachersSnapshot = await getDocs(collection(db, 'teachers'));
    const count = teachersSnapshot.size + 1;
    return `BMVT${String(count).padStart(7, '0')}`;
  };

  const createAccount = async (e) => {
    e.preventDefault();

    try {
      if (accountType === 'student') {
        const studentId = await generateStudentId();
        
        await addDoc(collection(db, 'students'), {
          name: formData.name,
          grade: formData.grade,
          class: formData.class,
          studentId: studentId,
          password: formData.password,
          email: `${studentId}@student.buthpitiya.lk`,
          badges: [],
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: studentId,
          email: `${studentId}@student.buthpitiya.lk`,
          role: 'student',
          name: formData.name,
        });

        toast.success(`Student account created! ID: ${studentId}`);
      } else if (accountType === 'teacher') {
        const teacherId = await generateTeacherId();
        
        await addDoc(collection(db, 'teachers'), {
          name: formData.name,
          teacherId: teacherId,
          password: formData.password,
          email: `${teacherId}@teacher.buthpitiya.lk`,
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: teacherId,
          email: `${teacherId}@teacher.buthpitiya.lk`,
          role: 'teacher',
          name: formData.name,
        });

        toast.success(`Teacher account created! ID: ${teacherId}`);
      } else if (accountType === 'principal') {
        const principalId = 'BMVP001';
        
        await addDoc(collection(db, 'users'), {
          username: principalId,
          email: `principal@buthpitiya.lk`,
          role: 'principal',
          name: formData.name,
          password: formData.password,
        });

        toast.success('Principal account created!');
      }

      // Log the action
      await addDoc(collection(db, 'logs'), {
        action: `Created ${accountType} account: ${formData.name}`,
        timestamp: new Date().toISOString(),
        admin: 'BMVADMIN',
      });

      setShowCreateModal(false);
      setFormData({ name: '', grade: '', class: '', password: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const deleteAccount = async (id, type) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteDoc(doc(db, type === 'student' ? 'students' : 'teachers', id));
      
      // Log the action
      await addDoc(collection(db, 'logs'), {
        action: `Deleted ${type} account`,
        timestamp: new Date().toISOString(),
        admin: 'BMVADMIN',
      });

      toast.success('Account deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const giveBadge = async (studentId, badge) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      const student = students.find(s => s.id === studentId);
      
      const badges = student.badges || [];
      const newBadge = {
        type: badge,
        awardedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };

      await updateDoc(studentRef, {
        badges: [...badges, newBadge]
      });

      toast.success('Badge awarded successfully!');
      fetchData();
    } catch (error) {
      console.error('Error awarding badge:', error);
      toast.error('Failed to award badge');
    }
  };

  const printStudents = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Buthpitiya M.V - Students List', 14, 20);
    
    doc.autoTable({
      startY: 30,
      head: [['Student ID', 'Name', 'Grade', 'Class']],
      body: students.map(s => [s.studentId, s.name, s.grade, s.class]),
    });
    
    doc.save('students-list.pdf');
    toast.success('PDF generated successfully!');
  };

  const printTeachers = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Buthpitiya M.V - Teachers List', 14, 20);
    
    doc.autoTable({
      startY: 30,
      head: [['Teacher ID', 'Name']],
      body: teachers.map(t => [t.teacherId, t.name]),
    });
    
    doc.save('teachers-list.pdf');
    toast.success('PDF generated successfully!');
  };

  const grades = ['6', '7', '8', '9', '10', '11', '12', '13'];
  const classes = ['A', 'B', 'C', 'D'];

  return (
    <AdminLayout>
      <Toaster position="top-center" />
      
      <div className="p-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            ආයුබෝවන් Administrator! 🎓
          </h1>
          <p className="text-gray-300">Welcome to Buthpitiya M.V LMS Admin Panel</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaUserGraduate className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{stats.students}</h3>
            <p className="text-gray-300">Students</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaChalkboardTeacher className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{stats.teachers}</h3>
            <p className="text-gray-300">Teachers</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-6 text-center"
          >
            <FaUsers className="text-5xl text-primary mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white">{stats.principal}</h3>
            <p className="text-gray-300">Principal</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPlus /> Create Account
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={printStudents}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPrint /> Print Students
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={printTeachers}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPrint /> Print Teachers
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <FaBug /> Auto Fix Bugs
          </motion.button>
        </div>

        {/* Recent Logs */}
        <div className="glass-effect p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity Logs</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="bg-white/5 p-3 rounded-lg">
                <p className="text-white">{log.action}</p>
                <p className="text-gray-400 text-sm">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="glass-effect p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Students Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Student ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Grade</th>
                  <th className="text-left p-3">Class</th>
                  <th className="text-left p-3">Badges</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-white/10">
                    <td className="p-3">{student.studentId}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.grade}</td>
                    <td className="p-3">{student.class}</td>
                    <td className="p-3">{student.badges?.length || 0}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => giveBadge(student.id, '1st')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        🥇
                      </button>
                      <button
                        onClick={() => giveBadge(student.id, '2nd')}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        🥈
                      </button>
                      <button
                        onClick={() => giveBadge(student.id, '3rd')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                      >
                        🥉
                      </button>
                      <button
                        onClick={() => deleteAccount(student.id, 'student')}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-effect p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Create Account</h2>
              
              <form onSubmit={createAccount} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>

                {accountType === 'student' && (
                  <>
                    <div>
                      <label className="block text-white mb-2">Grade</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                        required
                      >
                        <option value="">Select Grade</option>
                        {grades.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Class</label>
                      <select
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-white mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-green-600 text-white font-bold py-2 rounded-lg"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, query, where, arrayUnion } from 'firebase/firestore';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import TeacherLayout from '../../components/TeacherLayout';
import { FaMedal, FaSearch, FaFilter } from 'react-icons/fa';

export default function TeacherStudents() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedGrade, students]);

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
        
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    setFilteredStudents(filtered);
  };

  const giveBadge = async (studentId, badgeType) => {
    if (!confirm(`Award ${badgeType} badge to this student?`)) return;

    try {
      const student = students.find(s => s.id === studentId);
      const badges = student.badges || [];

      const newBadge = {
        type: badgeType,
        awardedBy: teacher.name,
        awardedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await updateDoc(doc(db, 'students', studentId), {
        badges: arrayUnion(newBadge)
      });

      toast.success(`${badgeType} badge awarded to ${student.name}!`);
      checkAuth();
    } catch (error) {
      console.error('Error awarding badge:', error);
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

  const grades = ['6', '7', '8', '9', '10', '11', '12', '13'];

  return (
    <TeacherLayout teacher={teacher}>
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Students Management 🎓
          </h1>
          <p className="text-gray-300">Award badges to outstanding students</p>
        </motion.div>

        {/* Filters */}
        <div className="glass-effect p-6 mb-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade} className="bg-gray-800">
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-effect p-6 rounded-lg hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                  👨‍🎓
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{student.name}</h3>
                  <p className="text-gray-400 text-sm">{student.studentId}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  Grade: <span className="text-white font-semibold">{student.grade}-{student.class}</span>
                </p>
                <p className="text-gray-300 text-sm">
                  Badges: <span className="text-primary font-semibold">{student.badges?.length || 0}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-400 text-xs mb-2">Award Badge:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => giveBadge(student.id, '1st')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm font-semibold"
                  >
                    🥇 1st Place
                  </button>
                  <button
                    onClick={() => giveBadge(student.id, '2nd')}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold"
                  >
                    🥈 2nd Place
                  </button>
                  <button
                    onClick={() => giveBadge(student.id, '3rd')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm font-semibold"
                  >
                    🥉 3rd Place
                  </button>
                  <button
                    onClick={() => giveBadge(student.id, 'prefect')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold"
                  >
                    ⭐ Prefect
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No students found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

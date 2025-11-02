// pages/portal.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaStar, FaMedal, FaTrophy, FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';

export default function StudentPortal() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedGrade, selectedClass, students]);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'), orderBy('name'));
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.studentId && s.visible !== false); // Only show visible students
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
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

    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.class === selectedClass);
    }

    setFilteredStudents(filtered);
  };

  const getBadgeEmoji = (badgeType) => {
    const badges = {
      '1st': '🥇',
      '2nd': '🥈',
      '3rd': '🥉',
      'prefect': '⭐',
      'media': '📱',
      'best-child': '👑',
      'form-master': '📝',
      'good-student': '🌟'
    };
    return badges[badgeType] || '🏆';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎓
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Header */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="School Logo"
                width={60}
                height={60}
                className="rounded-full border-2 border-primary"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white gradient-text">
                  Buthpitiya M.V
                </h1>
                <p className="text-gray-400 text-sm">Student Portal 🎓</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Home
              </a>
              <a
                href="/login"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-green-600 text-black font-semibold transition-colors"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-4 md:p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Find Students 🔍
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Grade Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">All Grades</option>
                {['6', '7', '8', '9', '10', '11', '12', '13'].map(grade => (
                  <option key={grade} value={grade} className="bg-gray-800">
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">All Classes</option>
                {['A', 'B', 'C', 'D'].map(cls => (
                  <option key={cls} value={cls} className="bg-gray-800">
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </motion.div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedStudent(student)}
              className="glass-effect p-6 rounded-xl cursor-pointer hover:border-primary transition-all"
            >
              {/* Student Photo */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full rounded-full object-cover border-4 border-primary shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          ${student.name.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {student.name.charAt(0)}
                  </div>
                )}
                
                {/* Badge indicator */}
                {student.badges && student.badges.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg">
                    {student.badges.length}
                  </div>
                )}
              </div>

              {/* Student Info */}
              <h3 className="text-white font-bold text-lg text-center mb-1">
                {student.name}
              </h3>
              <p className="text-gray-400 text-sm text-center mb-2">
                {student.studentId}
              </p>
              <p className="text-primary text-center font-semibold mb-3">
                Grade {student.grade}-{student.class}
              </p>

              {/* Badges Preview */}
              {student.badges && student.badges.length > 0 && (
                <div className="flex justify-center gap-1 flex-wrap">
                  {student.badges.slice(0, 3).map((badge, idx) => (
                    <span key={idx} className="text-2xl" title={badge.name || badge.type}>
                      {getBadgeEmoji(badge.type)}
                    </span>
                  ))}
                  {student.badges.length > 3 && (
                    <span className="text-gray-400 text-sm">+{student.badges.length - 3}</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaGraduationCap className="text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No students found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          </motion.div>
        )}
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-effect p-6 md:p-8 max-w-2xl w-full rounded-xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-white hover:text-red-500 text-2xl"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Photo */}
                <div className="w-32 h-32 flex-shrink-0">
                  {selectedStudent.photoUrl ? (
                    <img
                      src={selectedStudent.photoUrl}
                      alt={selectedStudent.name}
                      className="w-full h-full rounded-full object-cover border-4 border-primary shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
                      {selectedStudent.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-gray-400 mb-1">{selectedStudent.studentId}</p>
                  <p className="text-primary text-xl font-semibold mb-4">
                    Grade {selectedStudent.grade}-{selectedStudent.class}
                  </p>

                  {/* Additional Info */}
                  {selectedStudent.bio && (
                    <p className="text-gray-300 mb-4">{selectedStudent.bio}</p>
                  )}

                  {selectedStudent.achievements && (
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-2">🏆 Achievements</h3>
                      <p className="text-gray-300 text-sm">{selectedStudent.achievements}</p>
                    </div>
                  )}

                  {/* All Badges */}
                  {selectedStudent.badges && selectedStudent.badges.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">🏅 Badges ({selectedStudent.badges.length})</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedStudent.badges.map((badge, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-lg text-center">
                            <span className="text-3xl block mb-1">{getBadgeEmoji(badge.type)}</span>
                            <p className="text-white text-sm font-semibold">
                              {badge.name || badge.type}
                            </p>
                            {badge.awardedBy && (
                              <p className="text-gray-400 text-xs mt-1">
                                by {badge.awardedBy}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Buthpitiya M.V. All rights reserved.
          </p>
          <a
            href="https://buthpitiyamv.schweb.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-green-400 mt-2 inline-block"
          >
            Visit Main Website
          </a>
        </div>
      </footer>
    </div>
  );
}

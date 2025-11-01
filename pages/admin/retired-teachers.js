import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { FaUserTie } from 'react-icons/fa';

export default function RetiredTeachers() {
  const [retiredTeachers, setRetiredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetiredTeachers();
  }, []);

  const fetchRetiredTeachers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'retired-teachers'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRetiredTeachers(data.sort((a, b) => new Date(b.retiredAt) - new Date(a.retiredAt)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching retired teachers:', error);
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaUserTie className="text-primary" />
            විශාමික ගුරුවරු
          </h1>
          <p className="text-gray-300">Retired Teachers Hall of Honor</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retiredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary/20 to-blue-500/20 p-6 rounded-lg border border-white/10"
              >
                <div className="text-5xl text-center mb-4">👨‍🏫</div>
                <h3 className="text-white font-bold text-xl text-center mb-2">
                  {teacher.name}
                </h3>
                <div className="text-gray-300 text-sm space-y-1">
                  <p className="text-center">ID: {teacher.teacherId}</p>
                  <p className="text-center">Years of Service: {teacher.yearsOfService}</p>
                  <p className="text-center text-xs text-gray-400">
                    Retired: {new Date(teacher.retiredAt).toLocaleDateString()}
                  </p>
                </div>
                {teacher.achievements && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-xs text-center italic">
                      "{teacher.achievements}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {retiredTeachers.length === 0 && !loading && (
            <p className="text-gray-400 text-center py-12">No retired teachers yet</p>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
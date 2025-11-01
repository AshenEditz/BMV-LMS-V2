import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    grade: '6',
    class: 'A',
    password: '',
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const teachersSnap = await getDocs(collection(db, 'teachers'));
      setTeachers(teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateStudentId = async () => {
    const count = students.length + 1;
    return `BMVS${String(count).padStart(8, '0')}`;
  };

  const generateTeacherId = async () => {
    const count = teachers.length + 1;
    return `BMVT${String(count).padStart(7, '0')}`;
  };

  const createAccount = async (e) => {
    e.preventDefault();

    try {
      if (accountType === 'student') {
        const studentId = await generateStudentId();
        const email = `${studentId}@student.buthpitiya.lk`;
        
        await addDoc(collection(db, 'students'), {
          name: formData.name,
          grade: formData.grade,
          class: formData.class,
          studentId,
          email,
          badges: [],
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: studentId,
          email,
          role: 'student',
          name: formData.name,
          password: formData.password,
        });

        toast.success(`Student created! ID: ${studentId}`);
      } else if (accountType === 'teacher') {
        const teacherId = await generateTeacherId();
        const email = `${teacherId}@teacher.buthpitiya.lk`;
        
        await addDoc(collection(db, 'teachers'), {
          name: formData.name,
          teacherId,
          email,
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: teacherId,
          email,
          role: 'teacher',
          name: formData.name,
          password: formData.password,
        });

        toast.success(`Teacher created! ID: ${teacherId}`);
      }

      setShowCreateModal(false);
      setFormData({ name: '', grade: '6', class: 'A', password: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const deleteAccount = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, type === 'student' ? 'students' : 'teachers', id));
      
      toast.success(`${type} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete account');
    }
  };

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Toaster position="top-center" />

      {/* Navbar */}
      <div className="navbar">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', color: 'var(--green)', fontWeight: 'bold' }}>
              Admin Panel
            </h1>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {/* Stats */}
        <div className="grid grid-2 grid-3" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', color: 'var(--green)', marginBottom: '8px' }}>
              {students.length}
            </h3>
            <p style={{ color: 'var(--gray)' }}>Students</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', color: 'var(--green)', marginBottom: '8px' }}>
              {teachers.length}
            </h3>
            <p style={{ color: 'var(--gray)' }}>Teachers</p>
          </div>
        </div>

        {/* Create Button */}
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ marginBottom: '32px' }}>
          + Create Account
        </button>

        {/* Students List */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Students</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.studentId}</td>
                    <td>{student.name}</td>
                    <td>{student.grade}-{student.class}</td>
                    <td>
                      <button
                        onClick={() => deleteAccount(student.id, 'student')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
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

        {/* Teachers List */}
        <div className="card">
          <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Teachers</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td>{teacher.teacherId}</td>
                    <td>{teacher.name}</td>
                    <td>
                      <button
                        onClick={() => deleteAccount(teacher.id, 'teacher')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
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
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '24px' }}>Create Account</h2>
            
            <form onSubmit={createAccount}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Type</label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {accountType === 'student' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Grade</label>
                    <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                      {['6','7','8','9','10','11','12','13'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Class</label>
                    <select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})}>
                      {['A','B','C','D'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

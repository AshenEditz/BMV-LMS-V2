import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import MobileNav from '../../components/MobileNav';
import { BADGE_TYPES, addBadge, removeBadge } from '../../lib/badges';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
    if (!user) router.push('/login');
  };

  const fetchData = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.studentId);
      setStudents(studentsList);

      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teachersList = teachersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.teacherId);
      setTeachers(teachersList);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateStudentId = () => {
    const count = students.length + 1;
    return `BMVS${String(count).padStart(8, '0')}`;
  };

  const generateTeacherId = () => {
    const count = teachers.length + 1;
    return `BMVT${String(count).padStart(7, '0')}`;
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
  };

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      let accountId, email, password;

      if (accountType === 'student') {
        accountId = generateStudentId();
        email = `${accountId}@student.buthpitiya.lk`;
        password = formData.password || generatePassword();
        
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          if (authError.code !== 'auth/email-already-in-use') throw authError;
        }

        await addDoc(collection(db, 'students'), {
          name: formData.name,
          grade: formData.grade,
          class: formData.class,
          studentId: accountId,
          email: email,
          badges: [],
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: accountId,
          email: email,
          role: 'student',
          name: formData.name,
        });

        generatePDF({
          type: 'Student',
          name: formData.name,
          id: accountId,
          username: accountId,
          password: password,
          grade: `${formData.grade}-${formData.class}`
        });

        toast.success(`Student created! ID: ${accountId}`);
      } else if (accountType === 'teacher') {
        accountId = generateTeacherId();
        email = `${accountId}@teacher.buthpitiya.lk`;
        password = formData.password || generatePassword();
        
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          if (authError.code !== 'auth/email-already-in-use') throw authError;
        }

        await addDoc(collection(db, 'teachers'), {
          name: formData.name,
          teacherId: accountId,
          email: email,
          createdAt: new Date().toISOString(),
        });

        await addDoc(collection(db, 'users'), {
          username: accountId,
          email: email,
          role: 'teacher',
          name: formData.name,
        });

        generatePDF({
          type: 'Teacher',
          name: formData.name,
          id: accountId,
          username: accountId,
          password: password,
        });

        toast.success(`Teacher created! ID: ${accountId}`);
      }

      setShowCreateModal(false);
      setFormData({ name: '', grade: '6', class: 'A', password: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const generatePDF = (account) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 255, 136);
    doc.text('Buthpitiya M.V', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Account Credentials', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    const details = [
      ['Account Type:', account.type],
      ['Name:', account.name],
      ['ID:', account.id],
      ['Username:', account.username],
      ['Password:', account.password],
    ];
    if (account.grade) details.push(['Grade:', account.grade]);
    let yPos = 50;
    details.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, yPos);
      yPos += 10;
    });
    doc.save(`${account.type}_${account.id}_Credentials.pdf`);
  };

  const deleteAccount = async (id, type) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      await deleteDoc(doc(db, type === 'student' ? 'students' : 'teachers', id));
      toast.success(`${type} deleted`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const giveBadge = async (studentId, badgeType) => {
    try {
      const student = students.find(s => s.id === studentId);
      const updatedBadges = addBadge(student.badges, badgeType, 'Admin');
      await updateDoc(doc(db, 'students', studentId), { badges: updatedBadges });
      toast.success(`Badge awarded!`);
      fetchData();
      setShowBadgeModal(false);
    } catch (error) {
      toast.error('Failed to award badge');
    }
  };

  const removeBadgeFromStudent = async (studentId, badgeType) => {
    try {
      const student = students.find(s => s.id === studentId);
      const updatedBadges = removeBadge(student.badges, badgeType);
      await updateDoc(doc(db, 'students', studentId), { badges: updatedBadges });
      toast.success(`Badge removed!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to remove badge');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '#', icon: '📊' },
    { label: 'Students', href: '#', icon: '👨‍🎓' },
    { label: 'Teachers', href: '#', icon: '👨‍🏫' },
    { label: 'Badges', href: '#', icon: '🏆' },
  ];

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Toaster position="top-center" />
      <MobileNav user={{ name: 'Admin', role: 'Administrator' }} menuItems={menuItems} onLogout={logout} />

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
          {['dashboard', 'students', 'teachers', 'badges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '10px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="grid grid-2">
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>👨‍🎓</div>
                <h3 style={{ fontSize: '32px', color: 'var(--green)' }}>{students.length}</h3>
                <p style={{ color: 'var(--gray)' }}>Students</p>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>👨‍🏫</div>
                <h3 style={{ fontSize: '32px', color: 'var(--green)' }}>{teachers.length}</h3>
                <p style={{ color: 'var(--gray)' }}>Teachers</p>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ marginTop: '24px' }}>
              ➕ Create Account
            </button>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Students ({students.length})</h2>
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Grade</th>
                      <th>Badges</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.grade}-{student.class}</td>
                        <td>{student.badges?.length || 0}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowBadgeModal(true);
                            }}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', marginRight: '4px' }}
                          >
                            🏆
                          </button>
                          <button
                            onClick={() => deleteAccount(student.id, 'student')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Teachers */}
        {activeTab === 'teachers' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Teachers ({teachers.length})</h2>
            <div className="card">
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
                        <td style={{ fontSize: '12px' }}>{teacher.teacherId}</td>
                        <td>{teacher.name}</td>
                        <td>
                          <button
                            onClick={() => deleteAccount(teacher.id, 'teacher')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
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
        )}

        {/* Badges */}
        {activeTab === 'badges' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Badge Management</h2>
            <div className="grid grid-2">
              {Object.values(BADGE_TYPES).map(badge => (
                <div key={badge.id} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>{badge.emoji}</div>
                  <h3 style={{ color: 'var(--green)', marginBottom: '4px' }}>{badge.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray)' }}>
                    Valid for {badge.validity} days
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100,
          overflowY: 'auto'
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
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Password (optional)</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Create & Download PDF</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100,
          overflowY: 'auto'
        }}>
          <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>
              Manage Badges: {selectedStudent.name}
            </h2>

            {/* Current Badges */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>Current Badges:</h3>
              {selectedStudent.badges?.map((badge, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: 'white' }}>
                    {BADGE_TYPES[badge.type.toUpperCase().replace('-', '_')]?.emoji} {badge.name || badge.type}
                  </span>
                  <button
                    onClick={() => removeBadgeFromStudent(selectedStudent.id, badge.type)}
                    className="btn btn-danger"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(!selectedStudent.badges || selectedStudent.badges.length === 0) && (
                <p style={{ color: 'var(--gray)', fontSize: '14px' }}>No badges yet</p>
              )}
            </div>

            {/* Award Badges */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>Award New Badge:</h3>
              <div className="grid grid-2" style={{ gap: '8px' }}>
                {Object.values(BADGE_TYPES).map(badge => {
                  // Admin can give all badges except Good Student (principal only)
                  if (badge.id === 'good-student') return null;
                  
                  return (
                    <button
                      key={badge.id}
                      onClick={() => giveBadge(selectedStudent.id, badge.id)}
                      className="btn btn-secondary"
                      style={{ padding: '12px', fontSize: '12px', textAlign: 'center' }}
                    >
                      {badge.emoji} {badge.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setShowBadgeModal(false)} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

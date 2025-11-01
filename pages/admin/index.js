import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      const studentsList = studentsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.studentId); // Filter out _init docs
      setStudents(studentsList);

      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teachersList = teachersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.teacherId);
      setTeachers(teachersList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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
        
        // Create in Firebase Auth
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          if (authError.code !== 'auth/email-already-in-use') {
            throw authError;
          }
        }

        // Create in Firestore
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

        // Generate PDF
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
          if (authError.code !== 'auth/email-already-in-use') {
            throw authError;
          }
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
      toast.error('Failed to create account: ' + error.message);
    }
  };

  const generatePDF = (account) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 255, 136);
    doc.text('Buthpitiya M.V', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Account Credentials', 105, 30, { align: 'center' });
    
    // Account Details
    doc.setFontSize(12);
    const details = [
      ['Account Type:', account.type],
      ['Name:', account.name],
      ['ID:', account.id],
      ['Username:', account.username],
      ['Password:', account.password],
    ];
    
    if (account.grade) {
      details.push(['Grade:', account.grade]);
    }

    let yPos = 50;
    details.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, yPos);
      yPos += 10;
    });

    // Instructions
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Login at: https://your-lms-url.vercel.app/login', 20, yPos + 20);
    doc.text('Keep this document safe and confidential.', 20, yPos + 30);
    
    // Save
    doc.save(`${account.type}_${account.id}_Credentials.pdf`);
  };

  const deleteAccount = async (id, type) => {
    if (!confirm(`Delete this ${type}? This cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, type === 'student' ? 'students' : 'teachers', id));
      toast.success(`${type} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const printAllStudents = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Buthpitiya M.V - Students List', 14, 20);
    
    doc.autoTable({
      startY: 30,
      head: [['Student ID', 'Name', 'Grade', 'Class']],
      body: students.map(s => [s.studentId, s.name, s.grade, s.class]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 255, 136], textColor: [0, 0, 0] },
    });
    
    doc.save('All_Students.pdf');
    toast.success('Students list downloaded');
  };

  const printAllTeachers = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Buthpitiya M.V - Teachers List', 14, 20);
    
    doc.autoTable({
      startY: 30,
      head: [['Teacher ID', 'Name']],
      body: teachers.map(t => [t.teacherId, t.name]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 255, 136], textColor: [0, 0, 0] },
    });
    
    doc.save('All_Teachers.pdf');
    toast.success('Teachers list downloaded');
  };

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Toaster position="top-center" />

      {/* Mobile Header */}
      <div className="navbar">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '18px', color: 'var(--green)', fontWeight: 'bold' }}>
                Admin Panel
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--gray)' }}>Buthpitiya M.V</p>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ 
                background: 'none', 
                border: '2px solid var(--green)', 
                color: 'var(--green)', 
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '20px'
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '30px'
            }}
          >
            ✕
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px' }}>
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={activeTab === 'dashboard' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
              className={activeTab === 'students' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              👨‍🎓 Students
            </button>
            <button 
              onClick={() => { setActiveTab('teachers'); setMobileMenuOpen(false); }}
              className={activeTab === 'teachers' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              👨‍🏫 Teachers
            </button>
            <button onClick={logout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div style={{ display: 'none' }} className="desktop-nav">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={activeTab === 'students' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              👨‍🎓 Students
            </button>
            <button 
              onClick={() => setActiveTab('teachers')}
              className={activeTab === 'teachers' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '10px 20px' }}
            >
              👨‍🏫 Teachers
            </button>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '10px 20px', marginLeft: 'auto' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: block !important;
          }
        }
      `}</style>

      {/* Content */}
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '24px' }}>
              Dashboard
            </h2>

            {/* Stats */}
            <div className="grid grid-2 grid-3" style={{ marginBottom: '32px' }}>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>👨‍🎓</div>
                <h3 style={{ fontSize: '36px', color: 'var(--green)', marginBottom: '8px' }}>
                  {students.length}
                </h3>
                <p style={{ color: 'var(--gray)' }}>Total Students</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>👨‍🏫</div>
                <h3 style={{ fontSize: '36px', color: 'var(--green)', marginBottom: '8px' }}>
                  {teachers.length}
                </h3>
                <p style={{ color: 'var(--gray)' }}>Total Teachers</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--green)', marginBottom: '16px', fontSize: '18px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                  ➕ Create New Account
                </button>
                <button onClick={printAllStudents} className="btn btn-secondary">
                  📄 Print All Students
                </button>
                <button onClick={printAllTeachers} className="btn btn-secondary">
                  📄 Print All Teachers
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 style={{ color: 'var(--green)', marginBottom: '16px', fontSize: '18px' }}>
                Recent Accounts
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {[...students, ...teachers]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((account, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px', 
                      background: 'rgba(0,255,136,0.05)', 
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--green)'
                    }}>
                      <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>
                        {account.name}
                      </p>
                      <p style={{ color: 'var(--gray)', fontSize: '12px' }}>
                        {account.studentId || account.teacherId} • {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: 'var(--green)', fontSize: '24px' }}>
                Students ({students.length})
              </h2>
              <button onClick={() => { setAccountType('student'); setShowCreateModal(true); }} className="btn btn-primary">
                ➕ Add Student
              </button>
            </div>

            <div className="card">
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
                        <td style={{ fontSize: '12px' }}>{student.studentId}</td>
                        <td>{student.name}</td>
                        <td>{student.grade}-{student.class}</td>
                        <td>
                          <button
                            onClick={() => deleteAccount(student.id, 'student')}
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
                {students.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '24px', color: 'var(--gray)' }}>
                    No students yet. Create one!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: 'var(--green)', fontSize: '24px' }}>
                Teachers ({teachers.length})
              </h2>
              <button onClick={() => { setAccountType('teacher'); setShowCreateModal(true); }} className="btn btn-primary">
                ➕ Add Teacher
              </button>
            </div>

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
                {teachers.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '24px', color: 'var(--gray)' }}>
                    No teachers yet. Create one!
                  </p>
                )}
              </div>
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
          <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '24px', margin: '20px auto' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '24px', fontSize: '20px' }}>
              Create {accountType === 'student' ? 'Student' : 'Teacher'} Account
            </h2>
            
            <form onSubmit={createAccount}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
                  Account Type
                </label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>

              {accountType === 'student' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
                      Grade *
                    </label>
                    <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                      {['6','7','8','9','10','11','12','13'].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
                      Class *
                    </label>
                    <select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})}>
                      {['A','B','C','D'].map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
                  Password (leave empty for auto-generate)
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '13px' }}>
                ✅ ID and username will be auto-generated<br/>
                📄 PDF with credentials will be auto-downloaded
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  ➕ Create Account & Download PDF
                </button>
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

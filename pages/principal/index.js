import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import MobileNav from '../../components/MobileNav';
import ChatGroup from '../../components/ChatGroup';
import { addBadge, removeBadge } from '../../lib/badges';

export default function PrincipalDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      console.error('Error:', error);
    }
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        message: announcement,
        type: 'principal',
        timestamp: new Date().toISOString(),
        author: 'Principal',
      });

      // Send to all grade chats
      const grades = ['6','7','8','9','10','11','12','13'];
      for (const grade of grades) {
        await addDoc(collection(db, 'chats', `grade-${grade}`, 'messages'), {
          text: `📢 Principal Announcement: ${announcement}`,
          userId: 'principal',
          userName: 'Principal',
          userRole: 'principal',
          userBadges: [{ emoji: '👑', name: 'Principal' }],
          timestamp: new Date().toISOString(),
        });
      }

      // Send to teachers group
      await addDoc(collection(db, 'chats', 'teachers-all', 'messages'), {
        text: `📢 Principal Announcement: ${announcement}`,
        userId: 'principal',
        userName: 'Principal',
        userRole: 'principal',
        userBadges: [{ emoji: '👑', name: 'Principal' }],
        timestamp: new Date().toISOString(),
      });

      toast.success('Announcement sent to everyone!');
      setAnnouncement('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send announcement');
    }
  };

  const giveBadge = async (studentId, badgeType) => {
    try {
      const student = students.find(s => s.id === studentId);
      const updatedBadges = addBadge(student.badges, badgeType, 'Principal');
      await updateDoc(doc(db, 'students', studentId), { badges: updatedBadges });
      toast.success('Badge awarded!');
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
      toast.success('Badge removed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove badge');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '#', icon: '📊' },
    { label: 'Announcements', href: '#', icon: '📢' },
    { label: 'Students', href: '#', icon: '👨‍🎓' },
    { label: 'Chats', href: '#', icon: '💬' },
  ];

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const chatGroups = [
    'grade-6', 'grade-7', 'grade-8', 'grade-9',
    'grade-10', 'grade-11', 'grade-12', 'grade-13',
    'teachers-all', 'prefects-group'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Toaster position="top-center" />
      <MobileNav user={{ name: 'Principal', role: 'Principal' }} menuItems={menuItems} onLogout={logout} />

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
          {['dashboard', 'announcements', 'students', 'chats'].map(tab => (
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
            <h2 style={{ color: 'var(--green)', marginBottom: '24px', fontSize: '24px' }}>
              Welcome, Principal 👑
            </h2>
            <div className="grid grid-2">
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>👨‍🎓</div>
                <h3 style={{ fontSize: '36px', color: 'var(--green)' }}>{students.length}</h3>
                <p style={{ color: 'var(--gray)' }}>Total Students</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>👨‍🏫</div>
                <h3 style={{ fontSize: '36px', color: 'var(--green)' }}>{teachers.length}</h3>
                <p style={{ color: 'var(--gray)' }}>Total Teachers</p>
              </div>
            </div>
          </div>
        )}

        {/* Announcements */}
        {activeTab === 'announcements' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Send Announcement</h2>
            <div className="card">
              <form onSubmit={sendAnnouncement}>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type announcement for all students and teachers..."
                  rows="5"
                  required
                  style={{ marginBottom: '16px' }}
                />
                <button type="submit" className="btn btn-primary">
                  📢 Send to Everyone
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Students Management</h2>
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
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            🌟 Badge
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

        {/* Chats */}
        {activeTab === 'chats' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Chat Groups</h2>
            {!selectedChat ? (
              <div className="grid grid-2">
                {chatGroups.map(chatId => (
                  <button
                    key={chatId}
                    onClick={() => setSelectedChat(chatId)}
                    className="btn btn-secondary"
                    style={{ padding: '16px', textAlign: 'left' }}
                  >
                    💬 {chatId.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="btn btn-secondary"
                  style={{ marginBottom: '16px' }}
                >
                  ← Back to Chat List
                </button>
                <ChatGroup
                  chatId={selectedChat}
                  title={selectedChat.replace('-', ' ').toUpperCase()}
                  user={{ id: 'principal', name: 'Principal', role: 'principal', badges: [{ emoji: '👑', name: 'Principal' }] }}
                  allowImages={true}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Badge Modal (Good Student Only) */}
      {showBadgeModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>
              Good Student Badge
            </h2>
            <p style={{ color: 'white', marginBottom: '16px' }}>
              {selectedStudent.name}
            </p>
            <div style={{ marginBottom: '16px' }}>
              {selectedStudent.badges?.find(b => b.type === 'good-student') ? (
                <button
                  onClick={() => removeBadgeFromStudent(selectedStudent.id, 'good-student')}
                  className="btn btn-danger"
                >
                  Remove Good Student Badge 🌟
                </button>
              ) : (
                <button
                  onClick={() => giveBadge(selectedStudent.id, 'good-student')}
                  className="btn btn-primary"
                >
                  Award Good Student Badge 🌟
                </button>
              )}
            </div>
            <button onClick={() => setShowBadgeModal(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
        }

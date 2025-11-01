import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import MobileNav from '../../components/MobileNav';
import ChatGroup from '../../components/ChatGroup';
import { getValidBadges, BADGE_TYPES } from '../../lib/badges';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [student, setStudent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [news, setNews] = useState([]);

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
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const studentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setStudent(studentData);

        // Fetch announcements
        const announcementsRef = collection(db, 'announcements');
        onSnapshot(announcementsRef, (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAnnouncements(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        });

        // Fetch quizzes for student's grade
        const quizzesRef = collection(db, 'quizzes');
        const quizzesQuery = query(quizzesRef, where('grade', '==', studentData.grade));
        const quizzesSnap = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuizzes(quizzesData.filter(quiz => !quiz.responses?.some(r => r.studentId === studentData.studentId)));

        // Fetch news
        const newsSnapshot = await getDocs(collection(db, 'news'));
        setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const validBadges = getValidBadges(student?.badges || []);
  const hasMediaBadge = validBadges.some(b => b.type === 'media');
  const hasPrefectBadge = validBadges.some(b => b.type === 'prefect');

  const menuItems = [
    { label: 'Dashboard', href: '#', icon: '📊' },
    { label: 'Quizzes', href: '#', icon: '📝' },
    { label: 'Chat', href: '#', icon: '💬' },
    { label: 'News', href: '#', icon: '📰' },
  ];

  if (hasMediaBadge) {
    menuItems.push({ label: 'Media', href: '/media', icon: '📱' });
  }

  if (hasPrefectBadge) {
    menuItems.push({ label: 'Prefects', href: '#', icon: '⭐' });
  }

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (!student) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Toaster position="top-center" />
      <MobileNav user={{ name: student.name, role: 'Student' }} menuItems={menuItems} onLogout={logout} />

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
          {['dashboard', 'quizzes', 'chat', 'news', hasPrefectBadge && 'prefects'].filter(Boolean).map(tab => (
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
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Welcome, {student.name}!</h2>
            
            {/* Student Info */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'white', marginBottom: '12px' }}>My Information</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <p style={{ color: 'var(--gray)' }}>Student ID: <span style={{ color: 'white' }}>{student.studentId}</span></p>
                <p style={{ color: 'var(--gray)' }}>Grade: <span style={{ color: 'white' }}>{student.grade}-{student.class}</span></p>
                <p style={{ color: 'var(--gray)' }}>Badges: <span style={{ color: 'var(--green)' }}>{validBadges.length}</span></p>
              </div>
            </div>

            {/* Badges */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'white', marginBottom: '12px' }}>My Badges</h3>
              {validBadges.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                  {validBadges.map((badge, idx) => {
                    const config = BADGE_TYPES[badge.type.toUpperCase().replace('-', '_')];
                    return (
                      <div key={idx} style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '32px' }}>{config?.emoji || '🏆'}</div>
                        <p style={{ fontSize: '12px', color: 'white', marginTop: '4px' }}>{badge.name || badge.type}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--gray)' }}>No badges yet. Keep working hard!</p>
              )}
            </div>

            {/* Announcements */}
            <div className="card">
              <h3 style={{ color: 'white', marginBottom: '12px' }}>📢 Principal Announcements</h3>
              {announcements.slice(0, 3).map(announcement => (
                <div key={announcement.id} style={{ 
                  padding: '12px', 
                  background: 'rgba(0,255,136,0.05)', 
                  borderRadius: '8px', 
                  marginBottom: '8px',
                  borderLeft: '3px solid var(--green)'
                }}>
                  <p style={{ color: 'white' }}>{announcement.message}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '12px', marginTop: '4px' }}>
                    {new Date(announcement.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>Available Quizzes</h2>
            <div className="grid grid-2">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="card">
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>{quiz.title}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '12px' }}>
                    By {quiz.teacherName} • {quiz.questions?.length} questions
                  </p>
                  <button
                    onClick={() => router.push(`/quiz/${quiz.quizId}`)}
                    className="btn btn-primary"
                    style={{ padding: '8px', fontSize: '14px' }}
                  >
                    Take Quiz
                  </button>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p style={{ color: 'var(--gray)', gridColumn: '1 / -1' }}>No quizzes available</p>
              )}
            </div>
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="fade-in">
            <ChatGroup
              chatId={`grade-${student.grade}`}
              title={`Grade ${student.grade} Students`}
              user={{ id: student.studentId, name: student.name, role: 'student', badges: validBadges }}
              allowImages={true}
            />
          </div>
        )}

        {/* News */}
        {activeTab === 'news' && (
          <div className="fade-in">
            <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>School News</h2>
            <div className="grid grid-2">
              {news.map(item => (
                <div key={item.id} className="card">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }} />
                  )}
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '14px' }}>{item.description}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '12px', marginTop: '8px' }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prefects Group */}
        {activeTab === 'prefects' && hasPrefectBadge && (
          <div className="fade-in">
            <ChatGroup
              chatId="prefects-group"
              title="Prefects Group ⭐"
              user={{ id: student.studentId, name: student.name, role: 'student', badges: validBadges }}
              allowImages={true}
            />
          </div>
        )}
      </div>
    </div>
  );
    }

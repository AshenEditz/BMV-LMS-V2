import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import MobileNav from '../../components/MobileNav';
import ChatGroup from '../../components/ChatGroup';
import { nanoid } from 'nanoid';

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    grade: '6',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
  });

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
      const teachersRef = collection(db, 'teachers');
      const q = query(teachersRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const teacherData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setTeacher(teacherData);

        // Fetch students
        const studentsSnap = await getDocs(collection(db, 'students'));
        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(s => s.studentId));

        // Fetch teacher's quizzes
        const quizzesRef = collection(db, 'quizzes');
        const quizzesQuery = query(quizzesRef, where('teacherId', '==', teacherData.teacherId));
        const quizzesSnap = await getDocs(quizzesQuery);
        setQuizzes(quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createQuiz = async (e) => {
    e.preventDefault();

    try {
      const quizId = nanoid(10);
      const quizLink = `${window.location.origin}/quiz/${quizId}`;

      await addDoc(collection(db, 'quizzes'), {
        quizId,
        title: quizData.title,
        grade: quizData.grade,
        questions: quizData.questions,
        teacherId: teacher.teacherId,
        teacherName: teacher.name,
        createdAt: new Date().toISOString(),
        responses: [],
      });

      // Send to grade chat
      await addDoc(collection(db, 'chats', `grade-${quizData.grade}`, 'messages'), {
        text: `📝 New Quiz Available: ${quizData.title}\n\n${quizLink}`,
        userId: teacher.teacherId,
        userName: teacher.name,
        userRole: 'teacher',
        userBadges: [],
        timestamp: new Date().toISOString(),
      });

      toast.success('Quiz created and shared!');
      setShowQuizModal(false);
      setQuizData({
        title: '',
        grade: '6',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
      });
      checkAuth();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create quiz');
    }
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
    });
  };

  const menuItems = [
    { label: 'Dashboard', href: '#', icon: '📊' },
    { label: 'Quizzes', href: '#', icon: '📝' },
    { label: 'Students', href: '#', icon: '👨‍🎓' },
    { label: 'Chats', href: '#', icon: '💬' },
  ];

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const grades = ['6','7','8','9','10','11','12','13'];

  if (!teacher) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Toaster position="top-center" />
      <MobileNav user={{ name: teacher.name, role: 'Teacher' }} menuItems={menuItems} onLogout={logout} />

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
          {['dashboard', 'quizzes', 'students', 'chats'].map(tab => (
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
            <h2 style={{ color: 'var(--green)', marginBottom: '24px' }}>Welcome, {teacher.name}!</h2>
            <div className="grid grid-2">
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>📝</div>
                <h3 style={{ fontSize: '32px', color: 'var(--green)' }}>{quizzes.length}</h3>
                <p style={{ color: 'var(--gray)' }}>My Quizzes</p>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>👨‍🎓</div>
                <h3 style={{ fontSize: '32px', color: 'var(--green)' }}>{students.length}</h3>
                <p style={{ color: 'var(--gray)' }}>Total Students</p>
              </div>
            </div>
            <button onClick={() => setShowQuizModal(true)} className="btn btn-primary" style={{ marginTop: '24px' }}>
              ➕ Create New Quiz
            </button>
          </div>
        )}

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: 'var(--green)' }}>My Quizzes</h2>
              <button onClick={() => setShowQuizModal(true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                ➕ New
              </button>
            </div>
            <div className="grid grid-2">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="card">
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>{quiz.title}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '12px' }}>
                    Grade {quiz.grade} • {quiz.questions?.length} questions
                  </p>
                  <p style={{ color: 'var(--green)', fontSize: '14px' }}>
                    {quiz.responses?.length || 0} responses
                  </p>
                  <button
                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                    className="btn btn-secondary"
                    style={{ marginTop: '12px', padding: '8px', fontSize: '12px' }}
                  >
                    View Results
                  </button>
                </div>
              ))}
            </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.grade}-{student.class}</td>
                        <td>{student.badges?.length || 0}</td>
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
              <>
                <div className="grid grid-2">
                  {grades.map(grade => (
                    <button
                      key={grade}
                      onClick={() => setSelectedChat(`grade-${grade}`)}
                      className="btn btn-secondary"
                      style={{ padding: '16px' }}
                    >
                      💬 Grade {grade}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedChat('teachers-all')}
                    className="btn btn-primary"
                    style={{ padding: '16px' }}
                  >
                    👨‍🏫 Teachers Group
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setSelectedChat(null)} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
                  ← Back
                </button>
                <ChatGroup
                  chatId={selectedChat}
                  title={selectedChat.replace('-', ' ').toUpperCase()}
                  user={{ id: teacher.teacherId, name: teacher.name, role: 'teacher', badges: [] }}
                  allowImages={true}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showQuizModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.98)',
          overflowY: 'auto',
          padding: '20px',
          zIndex: 100
        }}>
          <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '24px' }}>Create Quiz</h2>
            <form onSubmit={createQuiz}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Grade</label>
                <select value={quizData.grade} onChange={(e) => setQuizData({...quizData, grade: e.target.value})}>
                  {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>

              {/* Questions */}
              <h3 style={{ color: 'white', marginBottom: '16px' }}>Questions</h3>
              {quizData.questions.map((q, qIdx) => (
                <div key={qIdx} className="card" style={{ marginBottom: '16px', padding: '16px' }}>
                  <h4 style={{ color: 'var(--green)', marginBottom: '12px' }}>Question {qIdx + 1}</h4>
                  <input
                    type="text"
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...quizData.questions];
                      newQuestions[qIdx].question = e.target.value;
                      setQuizData({...quizData, questions: newQuestions});
                    }}
                    style={{ marginBottom: '12px' }}
                    required
                  />
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => {
                          const newQuestions = [...quizData.questions];
                          newQuestions[qIdx].correctAnswer = optIdx;
                          setQuizData({...quizData, questions: newQuestions});
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newQuestions = [...quizData.questions];
                          newQuestions[qIdx].options[optIdx] = e.target.value;
                          setQuizData({...quizData, questions: newQuestions});
                        }}
                        style={{ flex: 1 }}
                        required
                      />
                    </div>
                  ))}
                  <input
                    type="number"
                    placeholder="Marks"
                    value={q.marks}
                    onChange={(e) => {
                      const newQuestions = [...quizData.questions];
                      newQuestions[qIdx].marks = parseInt(e.target.value);
                      setQuizData({...quizData, questions: newQuestions});
                    }}
                    style={{ width: '100px', marginTop: '8px' }}
                    required
                  />
                </div>
              ))}

              <button type="button" onClick={addQuestion} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
                ➕ Add Question
              </button>

              <div style={{ display: 'grid', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Create & Share Quiz</button>
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
                    }

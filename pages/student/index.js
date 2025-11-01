import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setStudent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        toast.error('Student data not found');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Toaster position="top-center" />

      {/* Navbar */}
      <div className="navbar">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '18px', color: 'var(--green)' }}>
              {student?.name}
            </h1>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '32px' }}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--green)', marginBottom: '16px' }}>My Information</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Student ID</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{student?.studentId}</p>
            </div>
            <div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Grade</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                {student?.grade}-{student?.class}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Badges</p>
              <p style={{ color: 'var(--green)', fontSize: '18px', fontWeight: 'bold' }}>
                {student?.badges?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="alert alert-success">
          <p>✅ Welcome to Buthpitiya M.V LMS!</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Your account is active and ready to use.</p>
        </div>
      </div>
    </div>
  );
}

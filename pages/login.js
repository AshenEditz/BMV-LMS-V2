import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ADMIN LOGIN
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        const email = 'admin@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        toast.success('Welcome Administrator!');
        setTimeout(() => router.push('/admin'), 1000);
        return;
      }

      // MEDIA LOGIN
      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        const email = 'media@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        toast.success('Welcome Media Unit!');
        setTimeout(() => router.push('/media'), 1000);
        return;
      }

      // STUDENT/TEACHER LOGIN - Search in collections
      let userData = null;
      let userEmail = null;

      // Check students
      const studentsQuery = query(collection(db, 'students'), where('studentId', '==', username));
      const studentsSnap = await getDocs(studentsQuery);
      
      if (!studentsSnap.empty) {
        userData = studentsSnap.docs[0].data();
        userEmail = userData.email;
        userData.role = 'student';
      }

      // Check teachers if not found
      if (!userData) {
        const teachersQuery = query(collection(db, 'teachers'), where('teacherId', '==', username));
        const teachersSnap = await getDocs(teachersQuery);
        
        if (!teachersSnap.empty) {
          userData = teachersSnap.docs[0].data();
          userEmail = userData.email;
          userData.role = 'teacher';
        }
      }

      if (!userData) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      // Try to login with Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, userEmail, password);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          // Create the auth user
          await createUserWithEmailAndPassword(auth, userEmail, password);
        } else if (authError.code === 'auth/wrong-password') {
          toast.error('Wrong password');
          setLoading(false);
          return;
        } else {
          throw authError;
        }
      }
      
      toast.success(`Welcome ${userData.name}!`);
      setTimeout(() => router.push(`/${userData.role}`), 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Toaster position="top-center" />
      
      <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            margin: '0 auto 16px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--green)',
            background: 'white'
          }}>
            <img
              src="https://i.imgur.com/c7EilDV.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:var(--green);display:flex;align-items:center;justify-content:center;color:black;font-weight:bold;font-size:36px;">BMV</div>';
              }}
            />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--green)', marginBottom: '8px' }}>
            Buthpitiya M.V
          </h1>
          <p style={{ color: 'var(--gray)' }}>Learning Management System</p>
        </div>

        <div className="alert alert-warning" style={{ fontSize: '13px', marginBottom: '24px' }}>
          Use your Student ID or Teacher ID as username
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
              Username (Student/Teacher ID)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., BMVS00000001"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--green)', marginBottom: '4px' }}>Admin:</p>
          <p style={{ color: 'white' }}>ICT/TEAM</p>
        </div>
      </div>
    </div>
  );
}

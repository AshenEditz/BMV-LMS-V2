import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
          await setDoc(doc(db, 'users', 'BMVADMIN'), {
            username: 'BMVADMIN',
            email,
            role: 'admin',
            name: 'Administrator',
            createdAt: new Date().toISOString()
          });
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
          await setDoc(doc(db, 'users', 'BmvMedia'), {
            username: 'BmvMedia',
            email,
            role: 'media',
            name: 'Media Unit',
            createdAt: new Date().toISOString()
          });
        }
        toast.success('Welcome Media Unit!');
        setTimeout(() => router.push('/media'), 1000);
        return;
      }

      // STUDENT/TEACHER LOGIN
      const userDoc = await getDoc(doc(db, 'users', username));
      if (!userDoc.exists()) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      try {
        await signInWithEmailAndPassword(auth, userData.email, password);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          // Create auth account
          await createUserWithEmailAndPassword(auth, userData.email, password);
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
        {/* Logo */}
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

        {/* Warning */}
        <div className="alert alert-warning" style={{ fontSize: '13px' }}>
          මෙය අපගේ නිල LMS පද්ධතියයි. පාසලේ දුන් User Name සහ Password භාවිතා කරන්න.
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: '600' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
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

        {/* Test Credentials */}
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--green)', marginBottom: '4px' }}>Test Login:</p>
          <p style={{ color: 'white' }}>Admin: BMVADMIN / BMV@2009</p>
        </div>

        {/* Link */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="https://buthpitiyamv.schweb.lk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontSize: '14px' }}>
            Visit Main Website →
          </a>
        </div>
      </div>
    </div>
  );
}

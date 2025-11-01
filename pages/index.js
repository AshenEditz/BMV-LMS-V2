import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      setStats({ students: studentsSnap.size, teachers: teachersSnap.size });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <div className="navbar">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                border: '2px solid var(--green)',
                background: 'white'
              }}>
                <img
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', color: 'var(--green)', fontWeight: 'bold' }}>Buthpitiya M.V</h1>
                <p style={{ fontSize: '12px', color: 'var(--gray)' }}>LMS</p>
              </div>
            </div>
            <button onClick={() => router.push('/login')} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          margin: '0 auto 24px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid var(--green)',
          background: 'white'
        }}>
          <img
            src="https://i.imgur.com/c7EilDV.png"
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:var(--green);display:flex;align-items:center;justify-content:center;color:black;font-weight:bold;font-size:48px;">BMV</div>';
            }}
          />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--green)', marginBottom: '12px' }}>
          Buthpitiya M.V
        </h1>
        <p style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>
          Learning Management System
        </p>
        <p style={{ fontSize: '16px', color: 'var(--gray)', marginBottom: '32px' }}>
          නවීන තාක්ෂණික අධ්‍යාපන පද්ධතිය
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/login')} className="btn btn-primary">
            Access Portal
          </button>
          <a href="https://buthpitiyamv.schweb.lk" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Main Website
          </a>
        </div>

        {/* Stats */}
        <div className="container" style={{ marginTop: '64px', maxWidth: '800px' }}>
          <div className="grid grid-2 grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', color: 'var(--green)' }}>{stats.students}</h3>
              <p style={{ color: 'var(--gray)' }}>Students</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', color: 'var(--green)' }}>{stats.teachers}</h3>
              <p style={{ color: 'var(--gray)' }}>Teachers</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '36px', color: 'var(--green)' }}>100%</h3>
              <p style={{ color: 'var(--gray)' }}>Digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(0,255,136,0.2)' }}>
        <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
          © 2024 Buthpitiya M.V. All rights reserved.
        </p>
      </footer>
    </div>
  );
                                          }

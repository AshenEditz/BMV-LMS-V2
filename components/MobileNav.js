import { useState } from 'react';
import { useRouter } from 'next/router';

export default function MobileNav({ user, menuItems, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="navbar">
        <div className="container" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '18px', color: 'var(--green)', fontWeight: 'bold' }}>
                {user.name}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--gray)', textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ 
                background: 'none', 
                border: '2px solid var(--green)', 
                color: 'var(--green)', 
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  router.push(item.href);
                  setMenuOpen(false);
                }}
                className="btn btn-secondary"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={onLogout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

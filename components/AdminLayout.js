// components/AdminLayout.js - UPDATED VERSION
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaHome, FaUsers, FaChalkboardTeacher, FaCog, FaImage, FaClipboardList } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/admin', 
      icon: <FaHome /> 
    },
    { 
      label: 'Create Account', 
      href: '/admin#create', 
      icon: <FaUsers /> 
    },
    { 
      label: 'Student Profiles', 
      href: '/admin/student-profiles', 
      icon: <FaImage />,
      badge: 'New'
    },
    { 
      label: 'Retired Teachers', 
      href: '/admin/retired-teachers', 
      icon: <FaChalkboardTeacher /> 
    },
    { 
      label: 'Settings', 
      href: '/admin#settings', 
      icon: <FaCog /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={{ name: 'Administrator', role: 'admin' }}
        onLogout={handleLogout}
        menuItems={menuItems}
      />
      
      {/* Mobile-friendly breadcrumbs */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/')}>Home</span>
            <span>/</span>
            <span className="text-white">Admin</span>
            {router.pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="text-primary capitalize">
                  {router.pathname.split('/').pop().replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar (Mobile-friendly) */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
          >
            👁️ View Portal
          </a>
          <a
            href="/admin/student-profiles"
            className="text-sm px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors flex items-center gap-2"
          >
            <FaImage /> Manage Photos
          </a>
          <button
            onClick={() => router.push('/system-diagnostics')}
            className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
          >
            🔧 Diagnostics
          </button>
        </div>
      </div>

      <main className="flex-1 bg-gradient-to-br from-black via-gray-900 to-green-900">
        {children}
      </main>
      
      <Footer />
    </div>
  );
        }

import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaHome, FaUsers, FaChalkboardTeacher, FaCog, FaClipboardList } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: <FaHome /> },
    { label: 'Create Account', href: '/admin#create', icon: <FaUsers /> },
    { label: 'Retired Teachers', href: '/admin/retired-teachers', icon: <FaChalkboardTeacher /> },
    { label: 'Settings', href: '/admin#settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={{ name: 'Administrator', role: 'admin' }}
        onLogout={handleLogout}
        menuItems={menuItems}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
          }

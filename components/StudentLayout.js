import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaHome, FaClipboardList, FaComments, FaMedal } from 'react-icons/fa';

export default function StudentLayout({ student, children }) {
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/student', icon: <FaHome /> },
    { label: 'Quizzes', href: '/student/quizzes', icon: <FaClipboardList /> },
    { label: 'My Badges', href: '/student#badges', icon: <FaMedal /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={{ 
          name: student?.name || 'Student', 
          role: 'student',
          id: student?.studentId 
        }}
        onLogout={handleLogout}
        menuItems={menuItems}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
          }

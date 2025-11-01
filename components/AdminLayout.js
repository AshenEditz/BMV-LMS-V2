import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHome, FaSignOutAlt, FaCog } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="Logo"
                width={50}
                height={50}
              />
              <div>
                <h1 className="text-white font-bold text-lg">Buthpitiya M.V</h1>
                <p className="text-gray-400 text-sm">Administrator Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin')}
                className="text-white hover:text-primary flex items-center gap-2"
              >
                <FaHome /> Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Buthpitiya M.V. All rights reserved.
            </p>
            <a
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-green-400 text-sm"
            >
              Visit Main Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
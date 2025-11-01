import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      const publicPages = ['/', '/login'];
      if (!user && !publicPages.includes(router.pathname)) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Service Worker Registration (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.log('Service Worker registration failed:', err));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎓
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
          <p className="text-gray-400 mt-2">Buthpitiya M.V LMS</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #10B981',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Component {...pageProps} key={router.pathname} />
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default MyApp;

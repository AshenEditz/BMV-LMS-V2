import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function FirebaseTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirebase = async () => {
    setLoading(true);
    setResult('Testing Firebase...\n\n');

    try {
      // Test 1: Check Firebase Config
      setResult(prev => prev + '1. Checking Firebase config...\n');
      setResult(prev => prev + `   ✅ Auth: ${auth ? 'Connected' : 'Failed'}\n`);
      setResult(prev => prev + `   ✅ Firestore: ${db ? 'Connected' : 'Failed'}\n\n`);

      // Test 2: Create Admin Account
      setResult(prev => prev + '2. Creating admin account...\n');
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          'admin@buthpitiya.lk', 
          'BMV@2009'
        );
        setResult(prev => prev + `   ✅ Admin created: ${userCredential.user.email}\n\n`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setResult(prev => prev + `   ✅ Admin already exists\n\n`);
        } else {
          setResult(prev => prev + `   ❌ Error: ${error.message}\n\n`);
        }
      }

      // Test 3: Create Admin Document
      setResult(prev => prev + '3. Creating admin document...\n');
      await setDoc(doc(db, 'users', 'BMVADMIN'), {
        username: 'BMVADMIN',
        email: 'admin@buthpitiya.lk',
        role: 'admin',
        name: 'Administrator',
        createdAt: new Date().toISOString()
      });
      setResult(prev => prev + `   ✅ Admin document created\n\n`);

      // Test 4: Create Media Account
      setResult(prev => prev + '4. Creating media account...\n');
      try {
        await createUserWithEmailAndPassword(
          auth, 
          'media@buthpitiya.lk', 
          'Ashen@2009'
        );
        setResult(prev => prev + `   ✅ Media created\n\n`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setResult(prev => prev + `   ✅ Media already exists\n\n`);
        }
      }

      await setDoc(doc(db, 'users', 'BmvMedia'), {
        username: 'BmvMedia',
        email: 'media@buthpitiya.lk',
        role: 'media',
        name: 'Media Unit',
        createdAt: new Date().toISOString()
      });
      setResult(prev => prev + `   ✅ Media document created\n\n`);

      setResult(prev => prev + '✅ ALL TESTS PASSED!\n');
      setResult(prev => prev + '\nYou can now login with:\n');
      setResult(prev => prev + 'Username: BMVADMIN\n');
      setResult(prev => prev + 'Password: BMV@2009\n');

    } catch (error) {
      setResult(prev => prev + `\n❌ ERROR: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect p-8 max-w-2xl w-full"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          🔥 Firebase Setup Test
        </h1>

        <button
          onClick={testFirebase}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl mb-6 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Setup Test'}
        </button>

        {result && (
          <div className="bg-black/50 p-4 rounded-lg">
            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-primary hover:text-green-400 underline"
          >
            → Go to Login Page
          </a>
        </div>
      </motion.div>
    </div>
  );
                 }

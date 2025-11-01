import { db } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const startTime = Date.now();
  const checks = {
    firebase: false,
    database: false,
    collections: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Check Firebase Connection
    try {
      const testRef = collection(db, 'health-check');
      await getDocs(testRef);
      checks.firebase = true;
    } catch (error) {
      checks.firebaseError = error.message;
    }

    // Check Database Collections
    const requiredCollections = ['students', 'teachers', 'users', 'quizzes', 'news'];
    
    for (const collectionName of requiredCollections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        checks.collections[collectionName] = {
          exists: true,
          count: snapshot.size,
          empty: snapshot.empty
        };
      } catch (error) {
        checks.collections[collectionName] = {
          exists: false,
          error: error.message
        };
      }
    }

    checks.database = true;

    // Log health check
    try {
      await addDoc(collection(db, 'logs'), {
        action: 'Health check performed',
        status: 'success',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
    } catch (error) {
      // Silent fail for logging
    }

    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      status: 'healthy',
      checks: checks,
      responseTime: `${responseTime}ms`,
      message: 'All systems operational'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return res.status(500).json({
      status: 'unhealthy',
      checks: checks,
      responseTime: `${responseTime}ms`,
      error: error.message
    });
  }
                   }

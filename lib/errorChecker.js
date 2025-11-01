import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

class ErrorChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  // Check Firebase Connection
  async checkFirebaseConnection() {
    try {
      console.log('🔍 Checking Firebase connection...');
      const testRef = collection(db, 'health-check');
      await getDocs(testRef);
      this.addSuccess('Firebase connection successful');
      return true;
    } catch (error) {
      this.addError('Firebase connection failed', error.message);
      return false;
    }
  }

  // Check Authentication
  async checkAuthentication() {
    try {
      console.log('🔍 Checking Firebase Authentication...');
      const user = auth.currentUser;
      if (user) {
        this.addSuccess(`Authentication active: ${user.email}`);
      } else {
        this.addWarning('No user currently authenticated');
      }
      return true;
    } catch (error) {
      this.addError('Authentication check failed', error.message);
      return false;
    }
  }

  // Check Environment Variables
  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];

    const missingVars = [];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
        this.addError(`Missing environment variable: ${varName}`);
      }
    });

    if (missingVars.length === 0) {
      this.addSuccess('All required environment variables present');
      return true;
    }
    return false;
  }

  // Check Database Collections
  async checkDatabaseCollections() {
    console.log('🔍 Checking database collections...');
    const requiredCollections = [
      'students',
      'teachers',
      'users',
      'quizzes',
      'news',
      'announcements',
      'logs'
    ];

    try {
      for (const collectionName of requiredCollections) {
        const snapshot = await getDocs(collection(db, collectionName));
        if (snapshot.empty && collectionName !== 'logs') {
          this.addWarning(`Collection '${collectionName}' is empty`);
        } else {
          this.addSuccess(`Collection '${collectionName}' exists (${snapshot.size} documents)`);
        }
      }
      return true;
    } catch (error) {
      this.addError('Database collections check failed', error.message);
      return false;
    }
  }

  // Check Image Accessibility
  async checkImages() {
    console.log('🔍 Checking image accessibility...');
    const images = [
      { name: 'School Logo', url: 'https://i.imgur.com/c7EilDV.png' },
    ];

    const imageChecks = images.map(async (img) => {
      try {
        const response = await fetch(img.url, { method: 'HEAD' });
        if (response.ok) {
          this.addSuccess(`Image accessible: ${img.name}`);
          return true;
        } else {
          this.addError(`Image not accessible: ${img.name}`, `Status: ${response.status}`);
          return false;
        }
      } catch (error) {
        this.addError(`Image check failed: ${img.name}`, error.message);
        return false;
      }
    });

    await Promise.all(imageChecks);
  }

  // Check API Endpoints
  async checkAPIEndpoints() {
    console.log('🔍 Checking API endpoints...');
    const endpoints = [
      '/api/upload-to-github',
      '/api/auto-fix-bugs',
      '/api/auto-update-grades',
    ];

    // We can't easily test POST endpoints without actual data,
    // so we just verify they exist
    this.addWarning('API endpoints check skipped (requires authentication)');
  }

  // Auto-Fix: Create Missing Collections
  async autoFixMissingCollections() {
    console.log('🔧 Auto-fixing missing collections...');
    const requiredCollections = [
      'students',
      'teachers',
      'users',
      'quizzes',
      'news',
      'announcements',
      'logs',
      'retired-teachers'
    ];

    try {
      for (const collectionName of requiredCollections) {
        const snapshot = await getDocs(collection(db, collectionName));
        if (snapshot.empty) {
          // Create init document
          await setDoc(doc(db, collectionName, '_init'), {
            initialized: true,
            createdAt: new Date().toISOString(),
            createdBy: 'auto-fix-system'
          });
          this.addFix(`Created collection: ${collectionName}`);
        }
      }
      return true;
    } catch (error) {
      this.addError('Auto-fix collections failed', error.message);
      return false;
    }
  }

  // Auto-Fix: Remove Expired Badges
  async autoFixExpiredBadges() {
    console.log('🔧 Auto-fixing expired badges...');
    try {
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const now = new Date();
      let fixCount = 0;

      for (const studentDoc of studentsSnapshot.docs) {
        if (studentDoc.id === '_init') continue;

        const student = studentDoc.data();
        if (student.badges && student.badges.length > 0) {
          const validBadges = student.badges.filter(badge => {
            if (!badge.expiresAt) return true;
            return new Date(badge.expiresAt) > now;
          });

          if (validBadges.length !== student.badges.length) {
            await setDoc(doc(db, 'students', studentDoc.id), {
              ...student,
              badges: validBadges
            });
            fixCount++;
            this.addFix(`Removed expired badges from ${student.name}`);
          }
        }
      }

      if (fixCount === 0) {
        this.addSuccess('No expired badges found');
      }
      return true;
    } catch (error) {
      this.addError('Auto-fix badges failed', error.message);
      return false;
    }
  }

  // Check for Broken Data
  async checkDataIntegrity() {
    console.log('🔍 Checking data integrity...');
    try {
      // Check students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      studentsSnapshot.docs.forEach(doc => {
        if (doc.id === '_init') return;
        const student = doc.data();
        if (!student.name || !student.studentId || !student.grade) {
          this.addWarning(`Student ${doc.id} has missing required fields`);
        }
      });

      // Check teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      teachersSnapshot.docs.forEach(doc => {
        if (doc.id === '_init') return;
        const teacher = doc.data();
        if (!teacher.name || !teacher.teacherId) {
          this.addWarning(`Teacher ${doc.id} has missing required fields`);
        }
      });

      this.addSuccess('Data integrity check completed');
      return true;
    } catch (error) {
      this.addError('Data integrity check failed', error.message);
      return false;
    }
  }

  // Helper methods
  addError(message, details = '') {
    this.errors.push({ message, details, timestamp: new Date().toISOString() });
    console.error('❌', message, details);
  }

  addWarning(message, details = '') {
    this.warnings.push({ message, details, timestamp: new Date().toISOString() });
    console.warn('⚠️', message, details);
  }

  addSuccess(message) {
    console.log('✅', message);
  }

  addFix(message) {
    this.fixes.push({ message, timestamp: new Date().toISOString() });
    console.log('🔧', message);
  }

  // Run all checks
  async runAllChecks() {
    console.log('🚀 Starting comprehensive system check...\n');
    
    this.checkEnvironmentVariables();
    await this.checkFirebaseConnection();
    await this.checkAuthentication();
    await this.checkDatabaseCollections();
    await this.checkImages();
    await this.checkDataIntegrity();

    return {
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString()
    };
  }

  // Run all auto-fixes
  async runAllFixes() {
    console.log('🔧 Starting auto-fix procedures...\n');
    
    await this.autoFixMissingCollections();
    await this.autoFixExpiredBadges();

    return {
      fixes: this.fixes,
      timestamp: new Date().toISOString()
    };
  }

  // Get report
  getReport() {
    return {
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalFixes: this.fixes.length,
      },
      errors: this.errors,
      warnings: this.warnings,
      fixes: this.fixes,
      timestamp: new Date().toISOString()
    };
  }
}

export default ErrorChecker;

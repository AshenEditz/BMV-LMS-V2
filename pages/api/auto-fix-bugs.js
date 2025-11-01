import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fixes = [];

    // Check for expired badges and remove them
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const now = new Date();

    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data();
      if (student.badges && student.badges.length > 0) {
        const validBadges = student.badges.filter(badge => {
          if (!badge.expiresAt) return true;
          return new Date(badge.expiresAt) > now;
        });

        if (validBadges.length !== student.badges.length) {
          await updateDoc(doc(db, 'students', studentDoc.id), {
            badges: validBadges
          });
          fixes.push(`Removed expired badges from ${student.name}`);
        }
      }
    }

    // Check for expired quizzes
    const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
    
    for (const quizDoc of quizzesSnapshot.docs) {
      const quiz = quizDoc.data();
      if (quiz.expiresAt && new Date(quiz.expiresAt) < now) {
        // Archive expired quiz
        await updateDoc(doc(db, 'quizzes', quizDoc.id), {
          archived: true
        });
        fixes.push(`Archived expired quiz: ${quiz.title}`);
      }
    }

    // Validate data integrity
    // Add more checks as needed...

    return res.status(200).json({
      success: true,
      fixes: fixes,
      message: `Applied ${fixes.length} automatic fixes`,
    });
  } catch (error) {
    console.error('Error in auto-fix:', error);
    return res.status(500).json({ error: 'Auto-fix failed' });
  }
}
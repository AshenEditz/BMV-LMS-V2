import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify secret key for security
  const { secret } = req.body;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    let updatedCount = 0;

    const updatePromises = studentsSnapshot.docs.map(async (studentDoc) => {
      const student = studentDoc.data();
      const currentGrade = parseInt(student.grade);

      // Don't update if already in Grade 13
      if (currentGrade >= 13) return;

      const newGrade = currentGrade + 1;

      await updateDoc(doc(db, 'students', studentDoc.id), {
        grade: newGrade.toString(),
      });

      updatedCount++;
    });

    await Promise.all(updatePromises);

    // Log the action
    await addDoc(collection(db, 'logs'), {
      action: `Auto-updated ${updatedCount} students to next grade`,
      timestamp: new Date().toISOString(),
      type: 'system',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} students`,
    });
  } catch (error) {
    console.error('Error updating grades:', error);
    return res.status(500).json({ error: 'Failed to update grades' });
  }
}
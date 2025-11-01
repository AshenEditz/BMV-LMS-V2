import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error, errorInfo, timestamp, userAgent, url } = req.body;

    await addDoc(collection(db, 'error-logs'), {
      error,
      errorInfo,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || 'unknown',
      url: url || 'unknown',
      severity: 'error'
    });

    return res.status(200).json({ success: true, message: 'Error logged' });
  } catch (error) {
    console.error('Failed to log error:', error);
    return res.status(500).json({ error: 'Failed to log error' });
  }
}

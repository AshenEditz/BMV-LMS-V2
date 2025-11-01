import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TestGitHub() {
  const [result, setResult] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  const testUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setResult('Uploading...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreview(reader.result);

        const response = await fetch('/api/upload-to-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: reader.result,
            filename: `test_${Date.now()}.jpg`,
            path: 'test-images',
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setResult(`✅ SUCCESS!\n\nImage URL:\n${data.url}\n\nFull Response:\n${JSON.stringify(data, null, 2)}`);
        } else {
          setResult(`❌ ERROR:\n\n${JSON.stringify(data, null, 2)}`);
        }
        
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setResult(`❌ ERROR: ${error.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-green-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-lg"
        >
          <h1 className="text-3xl font-bold text-white mb-6">
            🧪 GitHub Storage Test
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-semibold">
                Select Image to Upload
              </label>
              <input
                type="file"
                onChange={testUpload}
                accept="image/*"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
              />
            </div>

            {preview && (
              <div>
                <h3 className="text-white font-semibold mb-2">Preview:</h3>
                <img src={preview} alt="Preview" className="max-w-md rounded-lg" />
              </div>
            )}

            {uploading && (
              <div className="text-yellow-400 text-center py-4">
                ⏳ Uploading to GitHub...
              </div>
            )}

            {result && (
              <div>
                <h3 className="text-white font-semibold mb-2">Result:</h3>
                <pre className="bg-black/50 text-white p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm">
                  {result}
                </pre>
              </div>
            )}

            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">📋 Checklist:</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>✅ GitHub repository created and public</li>
                <li>✅ Personal access token generated</li>
                <li>✅ Environment variables added to Vercel</li>
                <li>✅ API route exists at /api/upload-to-github</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

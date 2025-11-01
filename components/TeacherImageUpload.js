// components/TeacherImageUpload.js
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TeacherImageUpload({ onUploadSuccess, gradeClass }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      toast.loading('Uploading to GitHub...');

      const filename = `teacher_${Date.now()}.jpg`;
      const response = await fetch('/api/upload-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: preview,
          filename: filename,
          path: `grade-${gradeClass}/teacher-uploads`,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      toast.dismiss();
      toast.success('Image uploaded successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect p-6 rounded-lg"
    >
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <FaImage /> Upload Image to Group Chat
      </h3>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-green-600"
        />

        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        )}

        <button
          onClick={uploadImage}
          disabled={!preview || uploading}
          className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaUpload />
          {uploading ? 'Uploading...' : 'Upload to Group Chat'}
        </button>
      </div>
    </motion.div>
  );
}
// pages/admin/student-profiles.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaImage, FaEye, FaEyeSlash, FaUpload, FaTimes } from 'react-icons/fa';

export default function StudentProfiles() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    achievements: '',
    visible: true,
    photoUrl: ''
  });

  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, []);

  const checkAuth = () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
    }
  };

  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      const studentsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.studentId);
      
      setStudents(studentsData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      bio: student.bio || '',
      achievements: student.achievements || '',
      visible: student.visible !== false,
      photoUrl: student.photoUrl || ''
    });
    setImagePreview(student.photoUrl || null);
    setEditMode(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToGitHub = async (file) => {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = reader.result;
            const filename = `student_${selectedStudent.studentId}_${Date.now()}.jpg`;

            const response = await fetch('/api/upload-to-github', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64,
                filename: filename,
                path: 'student-photos',
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Upload failed');
            }

            resolve(data.url);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      let photoUrl = formData.photoUrl;

      // Upload new photo if selected
      if (selectedImage) {
        toast.loading('Uploading photo to GitHub...');
        photoUrl = await uploadImageToGitHub(selectedImage);
        toast.dismiss();
        toast.success('Photo uploaded successfully!');
      }

      // Update student profile
      await updateDoc(doc(db, 'students', selectedStudent.id), {
        name: formData.name,
        bio: formData.bio,
        achievements: formData.achievements,
        visible: formData.visible,
        photoUrl: photoUrl,
        updatedAt: new Date().toISOString()
      });

      toast.success('Profile updated successfully!');
      setEditMode(false);
      setSelectedStudent(null);
      setSelectedImage(null);
      setImagePreview(null);
      fetchStudents();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (student) => {
    try {
      const newVisibility = !(student.visible !== false);
      await updateDoc(doc(db, 'students', student.id), {
        visible: newVisibility
      });
      
      toast.success(`Student ${newVisibility ? 'shown' : 'hidden'} from portal`);
      fetchStudents();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            📸 Student Profile Management
          </h1>
          <p className="text-gray-300">Manage student photos, bios, and portal visibility</p>
          <a
            href="/portal"
            target="_blank"
            className="inline-block mt-3 text-primary hover:text-green-400 underline"
          >
            → View Public Portal
          </a>
        </motion.div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`glass-effect p-4 md:p-6 rounded-xl ${
                student.visible === false ? 'opacity-60' : ''
              }`}
            >
              {/* Photo */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full rounded-full object-cover border-4 border-primary"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white">
                          ${student.name.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white">
                    {student.name.charAt(0)}
                  </div>
                )}
                
                {/* Visibility Badge */}
                {student.visible === false && (
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <FaEyeSlash className="text-white text-xs" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="text-white font-bold text-base md:text-lg text-center mb-1 truncate">
                {student.name}
              </h3>
              <p className="text-gray-400 text-xs md:text-sm text-center mb-2">
                {student.studentId}
              </p>
              <p className="text-primary text-center font-semibold text-sm mb-3">
                Grade {student.grade}-{student.class}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(student)}
                  className="flex-1 bg-primary hover:bg-green-600 text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => toggleVisibility(student)}
                  className={`px-3 rounded-lg transition-colors ${
                    student.visible !== false
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white`}
                  title={student.visible !== false ? 'Hide from portal' : 'Show in portal'}
                >
                  {student.visible !== false ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !uploading && setEditMode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect p-6 md:p-8 max-w-2xl w-full rounded-xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Edit Profile: {selectedStudent.name}
                </h2>
                <button
                  onClick={() => !uploading && setEditMode(false)}
                  disabled={uploading}
                  className="text-white hover:text-red-500 text-2xl disabled:opacity-50"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">
                  Profile Photo
                </label>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Current/Preview Photo */}
                  <div className="w-32 h-32 flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover border-4 border-primary"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-4xl font-bold text-white">
                        {selectedStudent.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="block w-full px-4 py-3 bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 rounded-lg text-center cursor-pointer transition-colors"
                    >
                      <FaImage className="inline mr-2" />
                      {selectedImage ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <p className="text-gray-400 text-xs mt-2">
                      Max 5MB • JPG, PNG, GIF • Will be uploaded to GitHub
                    </p>
                    {selectedImage && (
                      <p className="text-primary text-sm mt-2">
                        ✓ New photo selected: {selectedImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={uploading}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">
                  Bio / Description
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={uploading}
                  rows="3"
                  placeholder="A brief description about the student..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                />
              </div>

              {/* Achievements */}
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">
                  Achievements
                </label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  disabled={uploading}
                  rows="3"
                  placeholder="Notable achievements, awards, or accomplishments..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    disabled={uploading}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <span className="text-white font-semibold">
                    Show in Public Portal
                  </span>
                </label>
                <p className="text-gray-400 text-sm mt-2 ml-8">
                  {formData.visible
                    ? 'This student will be visible in the public portal'
                    : 'This student will be hidden from the public portal'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex-1 bg-primary hover:bg-green-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FaUpload />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={uploading}
                  className="flex-1 sm:flex-initial bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {uploading && (
                <p className="text-yellow-400 text-sm text-center mt-4">
                  ⏳ Please wait while we upload the image to GitHub...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
    }

/**
 * Client-side image compression utility
 * Compresses images before uploading to reduce bandwidth and storage
 */

/**
 * Compress image file to reduce size
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality = 0.8,
    fileType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Optional: Fill with white background (for transparent images)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }

            // Check if compressed size is acceptable
            const compressedSizeMB = blob.size / 1024 / 1024;
            
            if (compressedSizeMB > maxSizeMB && quality > 0.1) {
              // Try again with lower quality
              console.log(`Compressed size ${compressedSizeMB.toFixed(2)}MB > ${maxSizeMB}MB, reducing quality...`);
              compressImage(file, { ...options, quality: quality - 0.1 })
                .then(resolve)
                .catch(reject);
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: fileType,
              lastModified: Date.now(),
            });

            console.log('✅ Image compressed:', {
              original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
              ratio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction`
            });

            resolve(compressedFile);
          },
          fileType,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert File to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  const errors = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxSizeMB) {
    errors.push(`File size ${sizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

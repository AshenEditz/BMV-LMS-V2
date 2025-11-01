/**
 * GitHub Storage Upload API
 * Uploads base64 images to GitHub repository
 * Returns raw GitHub CDN URL
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const { image, filename, path = 'chat-images' } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({ 
        error: 'Missing image data',
        message: 'Please provide base64 image data'
      });
    }

    if (!filename) {
      return res.status(400).json({ 
        error: 'Missing filename',
        message: 'Please provide a filename'
      });
    }

    // Get GitHub configuration from environment variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    // Validate environment variables
    if (!GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'GITHUB_TOKEN environment variable is missing',
        hint: 'Add GITHUB_TOKEN to Vercel environment variables'
      });
    }

    if (!GITHUB_REPO) {
      console.error('❌ GITHUB_REPO is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'GITHUB_REPO environment variable is missing',
        hint: 'Add GITHUB_REPO to Vercel environment variables (format: username/repo-name)'
      });
    }

    // Remove data URL prefix if present
    // Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Validate base64 data
    if (!base64Data || base64Data.length < 100) {
      return res.status(400).json({ 
        error: 'Invalid image data',
        message: 'Image data appears to be empty or corrupted'
      });
    }

    console.log('📤 Uploading to GitHub:', {
      repo: GITHUB_REPO,
      path: `${path}/${filename}`,
      size: `${(base64Data.length / 1024).toFixed(2)} KB`
    });

    // Check if file already exists (to get SHA for update)
    let sha = null;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}/${filename}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Buthpitiya-LMS'
          },
        }
      );

      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
        console.log('📝 File exists, will update with SHA:', sha);
      }
    } catch (error) {
      // File doesn't exist, will create new
      console.log('📝 File does not exist, creating new');
    }

    // Prepare upload payload
    const uploadPayload = {
      message: `Upload ${filename} via LMS`,
      content: base64Data,
      branch: GITHUB_BRANCH,
    };

    // Add SHA if updating existing file
    if (sha) {
      uploadPayload.sha = sha;
    }

    // Upload to GitHub
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Buthpitiya-LMS'
        },
        body: JSON.stringify(uploadPayload),
      }
    );

    const uploadData = await uploadResponse.json();

    // Handle errors
    if (!uploadResponse.ok) {
      console.error('❌ GitHub API Error:', uploadData);
      
      // Handle specific error cases
      if (uploadResponse.status === 401) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'GitHub token is invalid or expired',
          hint: 'Generate a new Personal Access Token on GitHub'
        });
      }

      if (uploadResponse.status === 404) {
        return res.status(404).json({
          error: 'Repository not found',
          message: `Repository ${GITHUB_REPO} does not exist or token lacks access`,
          hint: 'Check GITHUB_REPO format and repository permissions'
        });
      }

      if (uploadResponse.status === 422) {
        return res.status(422).json({
          error: 'Validation failed',
          message: uploadData.message || 'GitHub rejected the upload',
          hint: 'Check if the file path and content are valid'
        });
      }

      // Generic error
      return res.status(uploadResponse.status).json({
        error: 'GitHub upload failed',
        message: uploadData.message || 'Unknown error occurred',
        details: uploadData
      });
    }

    // Success! Generate CDN URL
    const cdnUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}/${filename}`;

    console.log('✅ Upload successful:', cdnUrl);

    // Return success response
    return res.status(200).json({
      success: true,
      url: cdnUrl,
      download_url: uploadData.content?.download_url || cdnUrl,
      sha: uploadData.content?.sha,
      path: `${path}/${filename}`,
      size: uploadData.content?.size,
      message: 'Image uploaded successfully to GitHub'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Increase body size limit for image uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

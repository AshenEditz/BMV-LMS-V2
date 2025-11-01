export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, filename, path = 'chat-images' } = req.body;

    // GitHub configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO; // format: username/repo
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({ error: 'GitHub configuration missing' });
    }

    // Remove data:image prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Upload to GitHub
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload ${filename}`,
          content: base64Data,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload to GitHub');
    }

    // Return the raw GitHub URL
    const imageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}/${filename}`;

    return res.status(200).json({
      success: true,
      url: imageUrl,
      download_url: data.content.download_url,
    });
  } catch (error) {
    console.error('GitHub upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
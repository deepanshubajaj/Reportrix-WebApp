// pages/api/delete-image.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
  api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: 'Missing publicId' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}

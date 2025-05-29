// Your Cloudinary cloud name
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

// Cloudinary upload preset (create this in your Cloudinary dashboard)
// Make sure to set it as "Unsigned" for client-side uploads
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const FOLDER_NAME = process.env.REACT_APP_CLOUDINARY_FOLDER_NAME;

export const uploadToCloudinary = async (file) => {
  try {
    // Check if file is valid
    if (!file) {
      throw new Error('Invalid file object');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', FOLDER_NAME);

    // Log upload attempt
    console.log('Attempting Cloudinary upload with preset:', UPLOAD_PRESET);

    // Make the request using fetch
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    // Parse response
    const data = await response.json();
    console.log('Upload successful:', data);

    // The public_id from Cloudinary doesn't include the folder
    // We need to store it in the format: folder_name/public_id
    const publicId = `${FOLDER_NAME}/${data.public_id}`;

    // Return both the secure URL and the public_id
    return {
      secure_url: data.secure_url,
      public_id: publicId
    };
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Image deletion failed');
    }

    console.log('Image deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};


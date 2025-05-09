import axios from 'axios';
import { 
  CLOUDINARY_CONFIG, 
  getCloudinaryUploadUrl, 
  getUploadPresetForFileType, 
  getResourceTypeForFileType 
} from './configService';

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} uploadPreset - The upload preset to use (optional, will be detected from file type if not provided)
 * @param {string} resourceType - The type of resource (image, raw, video, etc.) (optional, will be detected from file type if not provided)
 * @param {Function} onProgress - Optional callback for upload progress updates
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - The upload response from Cloudinary
 */
const uploadToCloudinary = async (file, uploadPreset, resourceType, onProgress, options = {}) => {
  try {
    // If no upload preset is provided, automatically determine it from file type
    const finalUploadPreset = uploadPreset || getUploadPresetForFileType(file.type || file.name);
    // If no resource type is provided, automatically determine it from file type
    const finalResourceType = resourceType || getResourceTypeForFileType(file.type || file.name);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', finalUploadPreset);
    
    // Add any transformation parameters if provided
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }
    
    // For profile pictures, add specific transformations
    if (options.isProfilePicture) {
      formData.append('eager', 'c_fill,g_face,w_400,h_400,q_auto:best');
      formData.append('eager_async', 'true');
    }
    
    console.log(`Uploading file to Cloudinary with preset: ${finalUploadPreset}, resourceType: ${finalResourceType}`);

    // Make the upload request
    const response = await axios.post(
      getCloudinaryUploadUrl(finalResourceType),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        } : undefined
      }
    );

    console.log('Cloudinary response:', response.data);

    // Ensure the response has the necessary data
    if (!response.data || !response.data.secure_url) {
      console.error('Invalid Cloudinary response:', response.data);
      return {
        success: false,
        error: 'Invalid response from Cloudinary server'
      };
    }

    return {
      success: true,
      data: response.data,
      url: response.data.secure_url,
      publicId: response.data.public_id
    };
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    // Extract error details if available
    const errorMessage = error.response?.data?.error?.message || 
                         error.response?.data?.message || 
                         error.message || 
                         'Unknown error occurred';
    
    return {
      success: false,
      error: errorMessage,
      details: error.response?.data || {}
    };
  }
};

/**
 * Uploads a PDF file to Cloudinary
 * @param {File} file - The PDF file to upload
 * @param {Function} onProgress - Optional callback for upload progress updates
 * @returns {Promise<Object>} - The upload response
 */
const uploadPDF = async (file, onProgress) => {
  // Validate that the file is a PDF
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return {
      success: false,
      error: 'The file must be a PDF document.'
    };
  }

  // Use the PDF upload preset
  try {
    const result = await uploadToCloudinary(
      file, 
      CLOUDINARY_CONFIG.uploadPresets.pdf, 
      CLOUDINARY_CONFIG.resourceTypes.pdf,
      onProgress
    );
    console.log('PDF upload result:', result);
    return result;
  } catch (error) {
    console.error('Error in uploadPDF:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload PDF'
    };
  }
};

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Optional callback for upload progress updates
 * @param {Object} options - Additional options for image upload
 * @returns {Promise<Object>} - The upload response
 */
const uploadImage = async (file, onProgress, options = {}) => {
  // Validate that the file is an image
  if (!file.type.startsWith('image/')) {
    console.warn('File is not an image type, but attempting to upload anyway:', file.type);
    // We'll continue anyway since Facebook images might have unusual MIME types
  }

  // Add transformations for profile pictures if specified
  const transformations = options.isProfilePicture ? {
    transformation: 'c_fill,g_face,w_400,h_400,q_auto:best'
  } : {};

  console.log(`Uploading image file: ${file.name}, size: ${Math.round(file.size/1024)}KB, type: ${file.type}`);
  
  try {
    const result = await uploadToCloudinary(
      file, 
      CLOUDINARY_CONFIG.uploadPresets.image, 
      CLOUDINARY_CONFIG.resourceTypes.image,
      onProgress
    );
    
    if (result.success) {
      console.log('Image upload successful:', result.url);
    } else {
      console.error('Image upload failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in uploadImage:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The type of resource
 * @returns {Promise<Object>} - The deletion response
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    // This would normally need backend involvement for security
    // You should implement a backend endpoint for this
    console.warn('File deletion should be handled through a secure backend endpoint');
    return {
      success: false,
      error: 'File deletion not implemented on frontend'
    };
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Specialized function to fetch a profile image from Facebook and upload to Cloudinary
 * @param {string} imageUrl - The Facebook profile image URL
 * @param {string} userId - The user ID for identification
 * @returns {Promise<Object>} - The upload result
 */
const uploadFacebookProfileImage = async (imageUrl, userId) => {
  try {
    console.log(`Attempting to upload Facebook profile image for user ${userId}`);
    
    if (!imageUrl) {
      console.error('No image URL provided');
      return { success: false, error: 'No image URL provided' };
    }
    
    // Add cache busting parameter
    const fetchUrl = imageUrl.includes('?') 
      ? `${imageUrl}&_t=${Date.now()}` 
      : `${imageUrl}?_t=${Date.now()}`;
    
    console.log(`Fetching image from: ${fetchUrl}`);
    
    // Fetch the image with axios
    const response = await axios.get(fetchUrl, {
      responseType: 'blob',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'image/jpeg,image/png,image/*'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data) {
      throw new Error('Empty response when fetching image');
    }
    
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const imageBlob = response.data;
    const fileSize = imageBlob.size;
    
    console.log(`Image fetched: size=${fileSize}bytes, type=${contentType}`);
    
    if (fileSize === 0) {
      throw new Error('Downloaded image has zero size');
    }
    
    // Create a File object
    const fileName = `facebook_profile_${userId}_${Date.now()}.jpg`;
    const imageFile = new File([imageBlob], fileName, { type: contentType });
    
    // Profile picture specific transformations
    const options = {
      isProfilePicture: true,
      transformation: 'c_fill,g_face,w_500,h_500,q_auto:good'
    };
    
    // Upload to Cloudinary with the image preset
    console.log(`Uploading to Cloudinary with preset: ${CLOUDINARY_CONFIG.uploadPresets.image}`);
    
    const uploadResult = await uploadToCloudinary(
      imageFile,
      CLOUDINARY_CONFIG.uploadPresets.image,
      CLOUDINARY_CONFIG.resourceTypes.image,
      null, // No progress callback
      options
    );
    
    if (uploadResult.success) {
      console.log(`Successfully uploaded Facebook profile image: ${uploadResult.url}`);
      
      return {
        success: true,
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    } else {
      console.error('Failed to upload Facebook profile image:', uploadResult.error);
      return uploadResult;
    }
  } catch (error) {
    console.error('Error in uploadFacebookProfileImage:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to process Facebook profile image',
      originalUrl: imageUrl
    };
  }
};

export {
  uploadToCloudinary,
  uploadPDF,
  uploadImage,
  deleteFile,
  uploadFacebookProfileImage
};

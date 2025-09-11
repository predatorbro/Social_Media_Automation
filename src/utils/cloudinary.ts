import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
}

/**
 * Upload a single image to Cloudinary
 * @param imageData - Base64 string or file path
 * @param folder - Optional folder name
 * @returns Promise<UploadResult>
 */
export const uploadImage = async (
  imageData: string,
  folder: string = 'social-media-uploads'
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(imageData, {
      folder,
      resource_type: 'image',
      quality: 'auto',
      format: 'auto',
    });
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param images - Array of base64 strings
 * @param folder - Optional folder name
 * @returns Promise<UploadResult[]>
 */
export const uploadImages = async (
  images: string[],
  folder: string = 'social-media-uploads'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = images.map(image => uploadImage(image, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Batch upload error:', error);
    throw new Error('Failed to upload images to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image
 * @returns Promise<any>
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

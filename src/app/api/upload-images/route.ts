import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadPromises = images.map(async (imageData: string) => {
      try {
        const result = await cloudinary.uploader.upload(imageData, {
          folder: 'social-media-uploads',
          resource_type: 'image',
          quality: 'auto',
        });
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      images: results,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

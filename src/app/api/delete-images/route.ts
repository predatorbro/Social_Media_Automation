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
    const { publicIds } = await request.json();

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'No public IDs provided' },
        { status: 400 }
      );
    }

    // Delete images from Cloudinary
    const deletePromises = publicIds.map(async (publicId: string) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
      } catch (error) {
        console.error(`Failed to delete image ${publicId}:`, error);
        // Don't throw error, continue with other deletions
        return { result: 'error', publicId };
      }
    });

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: 'Images deleted successfully',
    });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}

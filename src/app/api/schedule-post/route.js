// API route for scheduling posts
import { NextResponse } from 'next/server';

// Convert image URL/data to base64 (without data URL prefix)
const convertToBase64 = async (imageData) => {
  try {
    let base64Data = '';

    // If it's already a data URL (base64), extract just the base64 part
    if (imageData.startsWith('data:')) {
      base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    }
    // If it's a URL, fetch and convert
    else if (imageData.startsWith('http')) {
      const response = await fetch(imageData);
      const arrayBuffer = await response.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    }
    // If it's a file path or other format, return as-is
    else {
      return imageData;
    }

    return base64Data;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return imageData; // Return original if conversion fails
  }
};

const scheduleToZapier = async (postData) => {
  const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;

  try {
    // Format hashtags as a single string with # prefix and space separation
    const formattedHashtags = postData.hashtags && postData.hashtags.length > 0
      ? postData.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
      : '';

    // Convert images to base64
    let base64Images = [];
    if (postData.images && postData.images.length > 0) {
      base64Images = await Promise.all(
        postData.images.map(image => convertToBase64(image))
      );
    }

    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: postData.platform || 'facebook',
        content: postData.content,
        scheduledTime: postData.scheduledTime,
        pageId: postData.pageId,
        hashtags: formattedHashtags, // Send as formatted string
        images: base64Images, // Send as base64 encoded images
        mediaUrls: postData.mediaUrls || []
      })
    });

    console.log('Sending to Zapier:', {
      platform: postData.platform,
      contentLength: postData.content?.length,
      hashtags: formattedHashtags,
      imageCount: base64Images.length
    });

    return response.ok;
  } catch (error) {
    console.error('Zapier webhook failed:', error);
    return false;
  }
};

export async function POST(request) {
  try {
    const postData = await request.json();

    // Validate required fields
    if (!postData.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!postData.platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // For Facebook posts, validate character limit
    if (postData.platform === 'facebook' && postData.content.length > 63206) {
      return NextResponse.json(
        { error: 'Content exceeds Facebook character limit (63,206)' },
        { status: 400 }
      );
    }

    // Schedule the post via Zapier
    const success = await scheduleToZapier(postData);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Post scheduled successfully for ${postData.platform}`,
        data: {
          platform: postData.platform,
          scheduledTime: postData.scheduledTime,
          contentLength: postData.content.length
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to schedule post via Zapier' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in schedule-post API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Schedule Post API is running',
    endpoints: {
      POST: '/api/schedule-post - Schedule a post via Zapier'
    }
  });
}

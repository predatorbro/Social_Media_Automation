// API route for scheduling posts
import { NextResponse } from 'next/server';
import axios from 'axios';

const scheduleToZapier = async (postData) => {
  // Choose the correct webhook URL based on platform
  let zapierWebhookUrl;

  switch (postData.platform) {
    case 'instagram':
      zapierWebhookUrl = process.env.ZAPIER_INSTAGRAM_WEBHOOK_URL;
      break;
    case 'linkedin':
      zapierWebhookUrl = process.env.ZAPIER_LINKEDIN_WEBHOOK_URL;
      break;
    default:
      zapierWebhookUrl = process.env.ZAPIER_FACEBOOK_WEBHOOK_URL;
  }

  try {
    // Format hashtags as a single string with # prefix and space separation
    const formattedHashtags = postData.hashtags && postData.hashtags.length > 0
      ? postData.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
      : '';

    const response = await axios.post(zapierWebhookUrl, {
      platform: postData.platform,
      content: postData.content,
      scheduledTime: postData.scheduledTime,
      pageId: postData.pageId,
      hashtags: formattedHashtags, // Send as formatted string
      images: postData.images || [], // Send Cloudinary URLs directly
      mediaUrls: postData.mediaUrls || []
    });
    console.log(response)

    console.log("PostData send to Zapier:", postData)

    return response.status >= 200 && response.status < 300;
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

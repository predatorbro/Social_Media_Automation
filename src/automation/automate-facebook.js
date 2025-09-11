import axios from 'axios';

class FacebookAutomation {
    constructor() {
        this.zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/24557250/ud03e5q/";
    }

    /**
     * Post content to Facebook via Zapier webhook
     * @param {Object} postData - The post data
     * @param {string} postData.content - The content to post
     * @param {string} postData.pageId - Facebook page ID
     * @param {Date} postData.scheduledTime - When to post (optional)
     * @returns {Promise<boolean>} - Success status
     */
    async postToFacebook(postData) {
        try {
      // Format hashtags as a single string with # prefix and space separation
      const formattedHashtags = postData.hashtags && postData.hashtags.length > 0
        ? postData.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
        : '';

      const payload = {
        platform: 'facebook',
        content: postData.content,
        pageId: postData.pageId || process.env.FACEBOOK_PAGE_ID,
        scheduledTime: postData.scheduledTime || new Date().toISOString(),
        hashtags: formattedHashtags, // Send as formatted string, not array
        mediaUrls: postData.mediaUrls || []
      };

            console.log('Posting to Facebook:', payload);

            const response = await axios.post(this.zapierWebhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000 // 30 second timeout
            });

            if (response.status === 200) {
                console.log('Successfully posted to Facebook');
                return true;
            } else {
                console.error('Failed to post to Facebook:', response.status, response.data);
                return false;
            }
        } catch (error) {
            console.error('Error posting to Facebook:', error.message);
            return false;
        }
    }

    /**
     * Schedule a Facebook post
     * @param {Object} postData - The post data
     * @returns {Promise<boolean>} - Success status
     */
    async scheduleFacebookPost(postData) {
        return this.postToFacebook({
            ...postData,
            scheduledTime: postData.scheduledTime || new Date().toISOString()
        });
    }

    /**
     * Post immediately to Facebook
     * @param {Object} postData - The post data
     * @returns {Promise<boolean>} - Success status
     */
    async postNowToFacebook(postData) {
        return this.postToFacebook({
            ...postData,
            scheduledTime: new Date().toISOString() // Immediate posting
        });
    }

    /**
     * Validate Facebook post data
     * @param {Object} postData - The post data to validate
     * @returns {Object} - Validation result with isValid and errors
     */
    validatePostData(postData) {
        const errors = [];

        if (!postData.content || postData.content.trim().length === 0) {
            errors.push('Content is required');
        }

        if (postData.content && postData.content.length > 63206) {
            errors.push('Content exceeds Facebook character limit (63,206)');
        }

        if (!postData.pageId && !process.env.FACEBOOK_PAGE_ID) {
            errors.push('Facebook Page ID is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Export for use in other modules
module.exports = FacebookAutomation;

// Example usage:
/*
const fbAutomation = new FacebookAutomation();

const postData = {
  content: "Hello Facebook! This is an automated post.",
  pageId: "your-facebook-page-id",
  hashtags: ["automation", "socialmedia"],
  mediaUrls: ["https://example.com/image.jpg"]
};

// Post immediately
fbAutomation.postNowToFacebook(postData);

// Schedule for later
fbAutomation.scheduleFacebookPost({
  ...postData,
  scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
});
*/

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { saveContent as saveContentToDB, updateContent } from "@/app/actions/content";
import axios from "axios";
import {
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Wand2,
  Copy,
  Save,
  Calendar as CalendarIcon,
  RotateCcw,
  CircleCheckBig,
  Pen,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/Loader";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/layout/Navigation";
import PlatformPreview from "@/components/platform/PlatformPreview";
import SuggestedPrompts from "@/components/content/SuggestedPrompts";
import ScheduleModal, { ScheduleData } from "@/components/content/ScheduleModal";
import { useToast } from "@/hooks/use-toast";
import {
  saveContent,
  saveCalendarEvent,
  getCalendarEvents,
  getUserProfile,
  saveCreatePageState,
  getCreatePageState,
  clearCreatePageState,
  type SavedContent,
  type CalendarEvent
} from "@/utils/storage";
import { saveUserCalendar } from "@/app/actions/calendar";

const CreateContent = () => {
  const { data: session, status } = useSession();
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, { content: string; hashtags: string[]; characterCount: number }>>({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPlatformForSchedule, setSelectedPlatformForSchedule] = useState("");
  const [selectedContentForSchedule, setSelectedContentForSchedule] = useState("");
  const [currentContentId, setCurrentContentId] = useState<string>("");
  const [currentViewingPlatform, setCurrentViewingPlatform] = useState<string>("");
  const [wordCount, setWordCount] = useState([12]);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState(false);
  const [cloudinaryUrls, setCloudinaryUrls] = useState<string[]>([]);
  const [hasLocalImages, setHasLocalImages] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true); // Track loading state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();
  // Handle Cloudinary URL updates from PlatformPreview
  const handleCloudinaryUrlsUpdate = useCallback((urls: string[]) => {
    setCloudinaryUrls(urls);
  }, []);
  //edit and save
  const handleEditGenerateContent = () => {
    if (isEditing) {
      // Save changes
      setGeneratedContent(prev => ({
        ...prev,
        [currentViewingPlatform]: {
          ...prev[currentViewingPlatform],
          content: editedContent,
          characterCount: editedContent.length
        }
      }));
      setIsEditing(false);
      toast({
        title: "Content Updated! ✨",
        description: "Your edited content has been saved."
      });
    } else {
      // Enter edit mode
      setEditedContent(generatedContent[currentViewingPlatform]?.content || "");
      setIsEditing(true);
    }
  }


  // Handle local images and uploading state from PlatformPreview
  const handleLocalImagesChange = useCallback((hasLocalImages: boolean, isUploading: boolean) => {
    setHasLocalImages(hasLocalImages);
    setIsImageUploading(isUploading);
  }, []);
  // Load saved state on component mount
  useEffect(() => {
    const savedState = getCreatePageState();

    // Only load if we have actual saved data (not empty defaults)
    const hasSavedData = savedState && Object.keys(savedState).length > 0 &&
      (savedState.originalContent || savedState.generatedContent ||
        savedState.selectedPlatforms || savedState.currentViewingPlatform);

    if (hasSavedData) {
      if (savedState.originalContent !== undefined) setOriginalContent(savedState.originalContent || "");
      if (savedState.selectedPlatforms) setSelectedPlatforms(savedState.selectedPlatforms || ["instagram"]);
      if (savedState.wordCount !== undefined) {
        const wc = Array.isArray(savedState.wordCount) ? savedState.wordCount[0] : savedState.wordCount;
        setWordCount([wc || 150]);
      }
      if (savedState.isStrictMode !== undefined) setIsStrictMode(savedState.isStrictMode || false);
      if (savedState.generatedContent) setGeneratedContent(savedState.generatedContent || {});
      if (savedState.currentViewingPlatform) setCurrentViewingPlatform(savedState.currentViewingPlatform || "");
      if (savedState.currentContentId) setCurrentContentId(savedState.currentContentId || "");
      if (savedState.cloudinaryUrls) setCloudinaryUrls(savedState.cloudinaryUrls || []);
    }

    // Mark loading as complete after a short delay to prevent race conditions
    setTimeout(() => setIsLoadingState(false), 100);
  }, []);

  // Save state whenever it changes (but not during initial load)
  useEffect(() => {
    if (isLoadingState) return; // Don't save during initial load

    const stateToSave = {
      originalContent,
      selectedPlatforms,
      wordCount: wordCount[0],
      isStrictMode,
      generatedContent,
      currentViewingPlatform,
      currentContentId,
      cloudinaryUrls
    };
    saveCreatePageState(stateToSave);
  }, [originalContent, selectedPlatforms, wordCount, isStrictMode, generatedContent, currentViewingPlatform, currentContentId, cloudinaryUrls, isLoadingState]);

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "instagram",
      limit: 2200,
      description: "Visual storytelling with engaging captions",
      contentStyle: "Engaging, visual-focused, conversational tone with emojis. Use storytelling techniques, ask questions to encourage engagement. Include calls-to-action like 'Double tap if you agree!' or 'Tag a friend who needs this!'"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "facebook",
      limit: 63206,
      description: "Community-focused engagement",
      contentStyle: "Community-oriented, conversational, and relatable. Share personal stories, ask for opinions, create discussions. Use warm, friendly language that builds connections and encourages shares and comments."
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "linkedin",
      limit: 3000,
      description: "Professional insights and thought leadership",
      contentStyle: "Professional, insightful, and value-driven. Focus on industry knowledge, career advice, thought leadership. Use industry-specific language, data-driven insights, and calls-to-action for professional networking."
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: Twitter,
      color: "twitter",
      limit: 280,
      description: "Concise, trending conversations",
      contentStyle: "Concise, punchy, and timely. Use trending topics, witty observations, quick insights. Include relevant hashtags, engage with current conversations, and encourage retweets and replies."
    },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!originalContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content to generate platform-specific versions.",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform to generate content for.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    const generatedContent: Record<string, { content: string; hashtags: string[]; characterCount: number }> = {};

    const promises = selectedPlatforms.map(async (platform) => {
      const platformData = platforms.find(p => p.id === platform);
      const characterLimit = platformData?.limit || 280;
      const contentStyle = platformData?.contentStyle || "engaging and professional";

      const wordCountInstruction = isStrictMode
        ? `EXACTLY ${wordCount[0]} words (count them precisely)`
        : `approximately ${wordCount[0]} words (roughly this amount)`;

      const prompt = `You are a seasoned social media strategist and content creator with over 20 years of experience managing successful campaigns for Fortune 500 companies, influencers, and brands across all major platforms. You've generated millions of impressions and have deep expertise in platform-specific audience psychology, engagement patterns, and viral content mechanics.
       
       TASK: Create exceptional ${platform} content based on: "${originalContent}"
       
       PLATFORM EXPERTISE FOR ${platform.toUpperCase()}:
       ${contentStyle}
       
       CONTENT SPECIFICATIONS:
       - Target length: ${wordCountInstruction} words
       - Hard limit: ${characterLimit} characters maximum (Strict & Precise)
       - Platform: ${platform} audience optimization
       - Engagement goal: Maximize likes, shares, comments, and saves
       
       ADVANCED CONTENT STRATEGY:
       - Hook readers within first few words
       - Use psychological triggers (curiosity, emotion, urgency)
       - Include platform-native language and trending phrases  
       - Apply proven engagement formulas for ${platform}
       - Balance informational and emotional value
       - Create content that users want to share/save
       
       OUTPUT REQUIREMENTS - CRITICAL:
       - Return ONLY the final, polished content
       - NO explanations, introductions, or meta-commentary
       - NO markdown formatting except new line (*bold*, *italic* etc. should be removed)
       - Moderate emoji use for enhanced engagement
       - Content must be 100% ready-to-publish
       - Structure: Title+
         (always a new line after title) +
         Main content +
         (always a new line after content) +
         relevant hashtags
       - If Target length/Word count is less than 50 words, do NOT create a separate title - just deliver the content and hashtags  
       - Ensure perfect grammar and flow
       - Content should feel authentic, not AI-generated
       
       Generate content that performs in the top 10% of ${platform} posts - engaging, shareable, and conversion-focused within ${characterLimit} characters.`;

      try {
        const res = await axios.post('/api/gemini', { prompt });
        let fullContent = res.data.text;
        // Remove markdown formatting
        fullContent = fullContent
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
          .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
          .replace(/__(.*?)__/g, '$1')     // Remove __underline__
          .replace(/~~(.*?)~~/g, '$1')     // Remove ~~strikethrough~~
          .replace(/`(.*?)`/g, '$1')       // Remove `code`
          .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
          .replace(/^\s*[-*+]\s+/gm, '')   // Remove list markers
          .replace(/^\s*\d+\.\s+/gm, '')   // Remove numbered list markers
          .trim();
        // Extract hashtags from the response (more robust pattern)
        const hashtagMatches = fullContent.match(/#\w+/g) || [];
        // Remove hashtags and any trailing/leading whitespace
        let contentWithoutHashtags = fullContent
          .replace(/#\w+/g, '') // Remove hashtags
          .trim(); // Remove leading/trailing whitespace

        // Additional cleanup for common AI artifacts
        contentWithoutHashtags = contentWithoutHashtags
          .replace(/^\s*#.*$/gm, '') // Remove any remaining hashtag lines
          .trim();

        const hashtags = hashtagMatches.map((h: string) => h.slice(1));

        generatedContent[platform] = {
          content: contentWithoutHashtags,
          hashtags,
          characterCount: fullContent.length
        };
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        // Fallback content
        generatedContent[platform] = {
          content: `Error generating content for ${platform}. Please try again.`,
          hashtags: [],
          characterCount: 0
        };
      }
    });

    await Promise.all(promises);

    setGeneratedContent(generatedContent);
    setIsGenerating(false);

    // Set the first selected platform as the default viewing platform
    if (selectedPlatforms.length > 0) {
      setCurrentViewingPlatform(selectedPlatforms[0]);
    }

    // Auto-save to content library using proper data structure
    const contentId = Date.now().toString();
    setCurrentContentId(contentId);

    const contentItem: SavedContent = {
      id: contentId,
      originalPrompt: originalContent,
      generatedContent,
      selectedPlatforms: selectedPlatforms,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage using storage utility (this saves to content library)
    saveContent(contentItem);

    // Save to database if user is logged in
    if (session?.user?.email) {
      try {
        await saveContentToDB(session.user.email, contentItem);
      } catch (error) {
        console.error('Error saving to database:', error);
        // Don't show error to user, content is still saved locally
      }
    }

    toast({
      title: "Content Generated! ✨",
      description: `Successfully created content for ${selectedPlatforms.length} platform(s) and saved to library.`
    });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const handlePostNow = async (platformId: string, content: string, hashtags: string[]) => {
    // Check if Twitter automation is disabled
    if (platformId === 'twitter') {
      toast({
        title: "Twitter Automation Unavailable",
        description: "Twitter automation feature is still in development phase. Coming soon!!!.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "No Content",
        description: "Please generate content first before posting.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are local images that haven't been uploaded yet
    if (hasLocalImages) {
      toast({
        title: "Please Confirm Upload",
        description: "You have images that need to be uploaded. Please click 'Confirm Upload' in the three dots before posting.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);

    try {
      // Use current time for immediate posting (convert to ISO string for API)
      const currentTime = new Date().toISOString();

      const postData = {
        platform: platformId,
        content: content,
        hashtags: hashtags,
        scheduledTime: currentTime,
        pageId: getUserProfile().page || process.env.FACEBOOK_PAGE_ID,
        images: cloudinaryUrls // Include Cloudinary URLs
      };

      const response = await axios.post('/api/schedule-post', postData);

      if (response.data.success) {
        // Update content status to published
        if (currentContentId && session?.user?.email) {
          try {
            const updatedContent = {
              id: currentContentId,
              status: 'published',
              updatedAt: new Date().toISOString()
            };
            await updateContent(session.user.email, updatedContent);
          } catch (error) {
            console.error('Error updating content status:', error);
          }
        }

        const platformName = platformId === 'instagram' ? 'Instagram' :
          platformId === 'facebook' ? 'Facebook' :
            platformId === 'twitter' ? 'Twitter/X' :
              platformId === 'linkedin' ? 'LinkedIn' : platformId;
        const localTime = new Date().toLocaleString();
        toast({
          title: "Posted Successfully! 🎉",
          description: `Your content has been posted to ${platformName}.` +
            `\nPosted at: ${localTime}`,
        });
      } else {
        throw new Error(response.data.error || 'Failed to post');
      }
    } catch (error: any) {
      console.error(`Error posting to ${platformId}:`, error);
      const platformName = platformId === 'instagram' ? 'Instagram' :
        platformId === 'facebook' ? 'Facebook' :
          platformId === 'twitter' ? 'Twitter/X' :
            platformId === 'linkedin' ? 'LinkedIn' : platformId;
      toast({
        title: "Posting Failed",
        description: error.response?.data?.error || error.message || `Failed to post to ${platformName}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedulePost = (platformId: string, content: string) => {
    // Check if Twitter automation is disabled
    if (platformId === 'twitter') {
      toast({
        title: "Twitter Automation Unavailable",
        description: "Twitter automation feature is still in development phase. Coming soon!!",
        variant: "destructive"
      });
      return;
    }

    // Check if there are local images that haven't been uploaded yet
    if (hasLocalImages) {
      toast({
        title: "Please Confirm Upload",
        description: "You have images that need to be uploaded. Please click 'Confirm Upload' in the three dots before scheduling.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlatformForSchedule(platformId);
    setSelectedContentForSchedule(content);
    setScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async (scheduleData: ScheduleData) => {
    if (!currentContentId) return;

    try {
      // Use the scheduled date/time in ISO format for API
      const scheduledTime = scheduleData.date.toISOString();

      // If scheduling for all platforms, get supported platforms (exclude Twitter)
      const platformsToSchedule = selectedPlatformForSchedule === 'all'
        ? selectedPlatforms.filter(platform => platform === 'facebook' || platform === 'instagram' || platform === 'linkedin')
        : [selectedPlatformForSchedule];

      let successCount = 0;
      let errorCount = 0;

      // Collect all calendar events to save at once
      const calendarEventsToSave: CalendarEvent[] = [];

      for (const platformId of platformsToSchedule) {
        const content = selectedPlatformForSchedule === 'all'
          ? generatedContent[platformId] || generatedContent[currentViewingPlatform]
          : { content: selectedContentForSchedule, hashtags: [] };

        if (!content || !content.content.trim()) continue;

        try {
          // Prepare post data for API call
          const postData = {
            platform: platformId,
            content: content.content,
            hashtags: content.hashtags || [],
            scheduledTime: scheduledTime,
            pageId: getUserProfile().page || process.env.FACEBOOK_PAGE_ID,
            images: cloudinaryUrls
          };

          // Call the API to schedule the post
          const response = await axios.post('/api/schedule-post', postData);

          if (response.data.success) {
            successCount++;

            // Create unified calendar event for local storage
            const localDate = new Date(scheduleData.date.getTime() - (scheduleData.date.getTimezoneOffset() * 60000));
            const calendarEvent: CalendarEvent = {
              id: `${Date.now()}-${platformId}-${Math.random().toString(36).substr(2, 9)}`,
              date: localDate.toISOString().split('T')[0],
              title: `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} Post`,
              content: content.content,
              platform: [platformId],
              type: 'post',
              time: scheduleData.time,
              scheduledPostId: currentContentId,
              status: 'scheduled',
              createdAt: new Date().toISOString()
            };

            // Add to collection for batch saving
            calendarEventsToSave.push(calendarEvent);
          } else {
            errorCount++;
          }
        } catch (error: any) {
          console.error(`Error scheduling post for ${platformId}:`, error);
          errorCount++;
        }
      }

      // Save all calendar events to localStorage at once
      if (calendarEventsToSave.length > 0) {
        const existingEvents = getCalendarEvents();
        const updatedEvents = [...existingEvents, ...calendarEventsToSave];
        localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
        console.log('Calendar events saved to localStorage:', calendarEventsToSave);

        // Save to database if user is logged in
        if (session?.user?.email) {
          try {
            await saveUserCalendar(session.user.email, updatedEvents);
            console.log('Calendar events saved to database');
          } catch (error) {
            console.error('Error saving calendar to database:', error);
          }
        }
      }

      if (successCount > 0) {
        const platformText = selectedPlatformForSchedule === 'all'
          ? `${successCount} platform(s)`
          : `${selectedPlatformForSchedule.charAt(0).toUpperCase() + selectedPlatformForSchedule.slice(1)}`;

        toast({
          title: "Posts Scheduled Successfully! 📅",
          description: `${platformText} scheduled for ${scheduleData.date.toLocaleDateString()} at ${scheduleData.time}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
        });
      } else {
        throw new Error('Failed to schedule any posts');
      }
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Scheduling Failed",
        description: error.response?.data?.error || error.message || "Failed to schedule post. Please try again.",
        variant: "destructive"
      });
    }

    setScheduleModalOpen(false);
  };

  const handlePostAll = async () => {
    const supportedPlatforms = selectedPlatforms.filter(platform =>
      platform === 'facebook' || platform === 'instagram' || platform === 'linkedin'
    );

    if (supportedPlatforms.length === 0) {
      toast({
        title: "No Supported Platforms",
        description: "Post All is available for Facebook, Instagram, and LinkedIn.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are local images that haven't been uploaded yet
    if (hasLocalImages) {
      toast({
        title: "Please Confirm Upload",
        description: "You have images that need to be uploaded. Please click 'Confirm Upload' in the three dots before posting.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    let successCount = 0;
    let errorCount = 0;

    // Use current time for all posts (convert to ISO string for API)
    const currentTime = new Date().toISOString();

    for (const platformId of supportedPlatforms) {
      const content = generatedContent[platformId];
      if (!content || !content.content.trim()) continue;

      try {
        const postData = {
          platform: platformId,
          content: content.content,
          hashtags: content.hashtags,
          scheduledTime: currentTime,
          pageId: getUserProfile().page || process.env.FACEBOOK_PAGE_ID,
          images: cloudinaryUrls // Include Cloudinary URLs
        };

        const response = await axios.post('/api/schedule-post', postData);

        if (response.data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error: any) {
        console.error(`Error posting to ${platformId}:`, error);
        errorCount++;
      }
    }

    setIsPosting(false);

    if (successCount > 0) {
      // Update content status to published
      if (currentContentId && session?.user?.email) {
        try {
          const updatedContent = {
            id: currentContentId,
            status: 'published',
            updatedAt: new Date().toISOString()
          };
          await updateContent(session.user.email, updatedContent);
        } catch (error) {
          console.error('Error updating content status:', error);
        }
      }

      const localTime = new Date().toLocaleString();
      toast({
        title: "Posts Completed! 🎉",
        description: `Successfully posted to ${successCount} platform(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}.` +
          `\nPosted at: ${localTime}`,
      });
    } else {
      toast({
        title: "Posting Failed",
        description: "Failed to post to any platforms. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleAll = async () => {
    const supportedPlatforms = selectedPlatforms.filter(platform => platform === 'facebook' || platform === 'instagram' || platform === 'linkedin');

    if (supportedPlatforms.length === 0) {
      toast({
        title: "No Supported Platforms",
        description: "Schedule All is currently only available for Facebook, Instagram, and LinkedIn.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are local images that haven't been uploaded yet
    if (hasLocalImages) {
      toast({
        title: "Please Confirm Upload",
        description: "You have images that need to be uploaded. Please click 'Confirm Upload' in the three dots before scheduling.",
        variant: "destructive"
      });
      return;
    }

    // For Schedule All, we'll use the current viewing platform's content for all platforms
    const currentContent = generatedContent[currentViewingPlatform];
    if (!currentContent) {
      toast({
        title: "No Content",
        description: "Please generate content first before scheduling.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlatformForSchedule('all'); // Special identifier for all platforms
    setSelectedContentForSchedule(currentContent.content + '\n\n' + currentContent.hashtags.map((h: string) => `#${h}`).join(' '));
    setScheduleModalOpen(true);
  };

  const handleGenerateNewFromScratch = async () => {
    // Clear all state completely
    setOriginalContent("");
    setSelectedPlatforms(["instagram"]);
    setGeneratedContent({});
    setCurrentViewingPlatform("");
    setCurrentContentId("");
    setWordCount([12]);
    setIsStrictMode(false);
    setHasLocalImages(false);
    setIsImageUploading(false);
    setCloudinaryUrls([]); // Clear Cloudinary URLs

    // Clear localStorage completely (now properly awaited)
    await clearCreatePageState();

    // Reset images in PlatformPreview component
    if ((window as any).platformPreviewReset) {
      (window as any).platformPreviewReset();
    }

    toast({
      title: "Started Fresh! 🧹",
      description: "All content, settings, and images have been cleared. Ready for new creation!"
    });

    window.scrollTo({ top: 0, behavior: 'smooth' })
  };

  // Show loading state while session is being determined
  if (status === "loading") {
    return <Loading message="Loading content creation..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Create Amazing Content
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into platform-optimized content with AI-powered generation
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Content Input */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Your Original Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Enter your content idea, script, or message here. Our AI will adapt it for each platform..."
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                className="min-h-[200px] text-base"
              />
              <div className="text-sm text-muted-foreground">
                {originalContent.length} characters
              </div>

              {/* Content Generation Settings */}
              <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Content Settings</h4>
                </div>

                {/* Word Count Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Word Count</Label>
                    <div className="text-lg font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-lg">
                      {wordCount[0]}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Slider
                      value={wordCount}
                      onValueChange={setWordCount}
                      max={500}
                      min={5}
                      step={1}
                      className="w-full"
                    />

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span>500</span>
                    </div>
                  </div>
                </div>

                {/* Strict Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                        Strict Mode
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Generate content exactly matching word count
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setIsStrictMode(!isStrictMode)}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${isStrictMode
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${isStrictMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                    ></div>
                  </div>
                </div>
              </div>

              <SuggestedPrompts onPromptSelect={setOriginalContent} />
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CircleCheckBig className="w-5 h-5 text-primary" />
                <span>Select Platform</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                        ? `border-primary bg-primary/5`
                        : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePlatformToggle(platform.id)}
                        />
                        <Icon className={`w-6 h-6 ${platform.color === 'instagram' ? 'text-instagram' :
                          platform.color === 'twitter' ? 'text-twitter' :
                            platform.color === 'linkedin' ? 'text-linkedin' : 'text-facebook'}`} />
                        <div>
                          <Label className="font-medium cursor-pointer text-base">
                            {platform.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {platform.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Max {platform.limit.toLocaleString()} chars
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <HeroButton
            variant="hero"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 text-lg"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-6 h-6 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                Generate AI Content
              </>
            )}
          </HeroButton>


          {/* Generated Content & Preview */}
          <div className="space-y-4">
            {Object.keys(generatedContent).length > 0 && currentViewingPlatform ? (
              <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex text-2xl items-center space-x-2">
                      <Wand2 className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Generated Content</span>
                    </div>
                    <div className="flex space-x-2">
                      {selectedPlatforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId);
                        if (!platform) return null;

                        const Icon = platform.icon;
                        const isActive = currentViewingPlatform === platformId;

                        return (
                          <Button
                            key={platformId}
                            variant={"outline"}
                            size="sm"
                            onClick={() => setCurrentViewingPlatform(platformId)}
                            className={`flex items-center space-x-2 ${isActive ? 'border-primary text-primary hover:text-primary border-2' : ''}`}
                          >
                            <Icon className={`w-6 h-6 ${platform.color === 'instagram' ? 'text-instagram' :
                              platform.color === 'twitter' ? 'text-twitter' :
                                platform.color === 'linkedin' ? 'text-linkedin' : 'text-facebook'}`} />
                            <span className="hidden sm:inline">{platform.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const platform = platforms.find(p => p.id === currentViewingPlatform);
                    const content = generatedContent[currentViewingPlatform];
                    if (!platform) return null;
                    if (content) {
                      return (
                        <>
                          <div className="p-6 bg-muted/30 rounded-lg">
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                {isEditing ? (
                                  <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="min-h-[120px] text-base leading-relaxed"
                                    placeholder="Edit your content here..."
                                  />
                                ) : (
                                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                                    {content.content}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={handleEditGenerateContent}
                                variant="outline"
                                className={`mr-0 p-2 rounded-full border-2 shadow-lg transition-all duration-300  
                                  bg-gradient-to-r from-purple-400 to-pink-400 border-purple-300 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-400/50 hover:scale-105'
                                  `}
                                title="Enhance prompt with AI magic ✨"
                              >
                                {isEditing ? (
                                  <Check className="w-4 h-4 " />
                                ) : (
                                  <Pen className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            {content.hashtags.length > 0 && (
                              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border/50">
                                <div className="w-5 h-5 text-primary/70">
                                  <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.5 12l-.5-1h-1l-.5 1v1h2v-1zm4 0l-.5-1h-1l-.5 1v1h2v-1z" />
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                                  </svg>
                                </div>
                                <p className="text-primary text-sm font-medium">
                                  {content.hashtags.map((tag: string) => `#${tag}`).join(' ')}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{isEditing ? editedContent.length : content.characterCount} characters</span>
                            <span className={(isEditing ? editedContent.length : content.characterCount) > platform.limit ? 'text-destructive' : 'text-success'}>
                              {platform.limit - (isEditing ? editedContent.length : content.characterCount)} remaining
                            </span>
                          </div>



                          {/* Platform Preview */}
                          <div className="border-t pt-6">
                            <h4 className="text-lg font-medium mb-4">Live Preview</h4>
                            <PlatformPreview
                              content={isEditing ? editedContent : content.content}
                              platform={currentViewingPlatform}
                              hashtags={content.hashtags}
                              pageName={getUserProfile().page}
                              ownerName={getUserProfile().name}
                              onCloudinaryUrls={handleCloudinaryUrlsUpdate}
                              onLocalImagesChange={handleLocalImagesChange}
                            />
                          </div>


                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                              className="flex-1 min-w-[120px]"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePostNow(currentViewingPlatform, content.content, content.hashtags)}
                              className={`flex-1 min-w-[120px] ${currentViewingPlatform === 'instagram'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                : currentViewingPlatform === 'facebook'
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : currentViewingPlatform === 'linkedin'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : currentViewingPlatform === 'twitter'
                                      ? 'bg-sky-500 hover:bg-sky-600'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              disabled={isPosting || isImageUploading}
                            >
                              {isPosting ? (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                <>
                                  {currentViewingPlatform === 'instagram' && <Instagram className={`w-6 h-6 mr-2 ${currentViewingPlatform === 'instagram' ? 'text-white' : 'text-instagram'}`} />}
                                  {currentViewingPlatform === 'facebook' && <Facebook className={`w-6 h-6 mr-2 ${currentViewingPlatform === 'facebook' ? 'text-white' : 'text-facebook'}`} />}
                                  {currentViewingPlatform === 'linkedin' && <Linkedin className={`w-6 h-6 mr-2 ${currentViewingPlatform === 'linkedin' ? 'text-white' : 'text-linkedin'}`} />}
                                  {currentViewingPlatform === 'twitter' && <Twitter className={`w-6 h-6 mr-2 ${currentViewingPlatform === 'twitter' ? 'text-white' : 'text-twitter'}`} />}
                                  Post Now
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSchedulePost(currentViewingPlatform, content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                              className="flex-1 min-w-[120px]"
                              disabled={isImageUploading}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule
                            </Button>
                          </div>

                          {/* Bulk Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePostAll()}
                              className="flex-1 w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                              disabled={isPosting || isImageUploading}
                            >
                              {isPosting ? (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                                  Posting All...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Post All
                                </>
                              )}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleScheduleAll()}
                              className="flex-1 w-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                              disabled={isImageUploading}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule All
                            </Button>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div className="p-6 bg-muted/30 rounded-lg">
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <Wand2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No generated content to show</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">Content will appear here after generation</p>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center w-full">
                <CardContent className="text-center">
                  <Wand2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-medium text-muted-foreground mb-3">
                    No content to show
                  </h3>
                  <p className="text-muted-foreground">
                    Enter your content and select platforms to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Generate New From Scratch Section - Only show when there's content */}
          {Object.keys(generatedContent).length > 0 && (
            <Card className="w-full mt-8 border-2 border-dashed border-primary/30">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Create Something New
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-wrap mx-auto">
                      Ready to try a different idea? Start fresh with a clean workspace and create new content.
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateNewFromScratch}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Start Fresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        platform={selectedPlatformForSchedule}
        content={selectedContentForSchedule}
        onSchedule={handleScheduleConfirm}
      />
    </div>
  );
};

export default CreateContent;

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { saveContent as saveContentToDB } from "@/app/actions/content";
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
  CircleCheckBig
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/layout/Navigation";
import PlatformPreview from "@/components/platform/PlatformPreview";
import SuggestedPrompts from "@/components/content/SuggestedPrompts";
import ScheduleModal, { ScheduleData } from "@/components/content/ScheduleModal";
import { useToast } from "@/hooks/use-toast";
import {
  saveContent,
  saveScheduledPost,
  saveCalendarEvent,
  getUserProfile,
  saveCreatePageState,
  getCreatePageState,
  clearCreatePageState,
  type SavedContent,
  type ScheduledPost,
  type CalendarEvent
} from "@/utils/storage";

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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  // Load saved state on component mount
  useEffect(() => {
    const savedState = getCreatePageState();
    if (savedState.originalContent) setOriginalContent(savedState.originalContent || "");
    if (savedState.selectedPlatforms) setSelectedPlatforms(savedState.selectedPlatforms || ["instagram"]);
    if (savedState.wordCount !== undefined) {
      const wc = Array.isArray(savedState.wordCount) ? savedState.wordCount[0] : savedState.wordCount;
      setWordCount([wc || 150]);
    }
    if (savedState.isStrictMode !== undefined) setIsStrictMode(savedState.isStrictMode || false);
    if (savedState.generatedContent) setGeneratedContent(savedState.generatedContent || {});
    if (savedState.currentViewingPlatform) setCurrentViewingPlatform(savedState.currentViewingPlatform || "");
    if (savedState.currentContentId) setCurrentContentId(savedState.currentContentId || "");

    // Also try to load generated content from the separate key
    const generatedContentData = localStorage.getItem('create-page-generated-content');
    if (generatedContentData) {
      try {
        const parsed = JSON.parse(generatedContentData);
        if (parsed.generatedContent) {
          setGeneratedContent(parsed.generatedContent);
        }
        if (parsed.currentViewingPlatform) {
          setCurrentViewingPlatform(parsed.currentViewingPlatform);
        }
        if (parsed.currentContentId) {
          setCurrentContentId(parsed.currentContentId);
        }
        if (parsed.originalPrompt) {
          setOriginalContent(parsed.originalPrompt);
        }
        if (parsed.selectedPlatforms) {
          setSelectedPlatforms(parsed.selectedPlatforms);
        }
      } catch (error) {
        console.error('Error loading generated content from localStorage:', error);
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    const stateToSave = {
      originalContent,
      selectedPlatforms,
      wordCount: wordCount[0],
      isStrictMode,
      generatedContent,
      currentViewingPlatform,
      currentContentId
    };
    saveCreatePageState(stateToSave);
  }, [originalContent, selectedPlatforms, wordCount, isStrictMode, generatedContent, currentViewingPlatform, currentContentId]);

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "instagram",
      limit: 2200,
      description: "Visual storytelling with engaging captions"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "facebook",
      limit: 63206,
      description: "Community-focused engagement"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "linkedin",
      limit: 3000,
      description: "Professional insights and thought leadership"
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: Twitter,
      color: "twitter",
      limit: 280,
      description: "Concise, trending conversations"
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
      const prompt = `Generate engaging social media content for ${platform} based on this idea: "${originalContent}".
            Target word count: approximately ${wordCount[0]} words.
            Make it suitable for ${platform} audience.

            CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
            - Respond with ONLY the main content text
            - NO explanations, NO introductions, NO additional text
            - NO markdown formatting (*bold*, **italic**, etc.)
            - NO separate lines for hashtags
            - Put ALL hashtags at the very END of the content on the SAME line
            - Example format: "Main content here #hashtag1 #hashtag2 #hashtag3"
            - Keep response clean and ready to post directly`;

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
        // Remove hashtags and any trailing/leading whitespace, also remove extra spaces
        let contentWithoutHashtags = fullContent
          .replace(/#\w+/g, '') // Remove hashtags
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim(); // Remove leading/trailing whitespace

        // Additional cleanup for common AI artifacts
        contentWithoutHashtags = contentWithoutHashtags
          .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
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

    // Also save to a separate key for create page persistence
    const createPageContent = {
      ...contentItem,
      generatedContent,
      currentViewingPlatform: selectedPlatforms[0] || '',
      currentContentId: contentId
    };
    localStorage.setItem('create-page-generated-content', JSON.stringify(createPageContent));

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

  const handleSaveToLibrary = (platformId: string) => {
    if (!currentContentId) return;

    toast({
      title: "Already Saved!",
      description: "Content is automatically saved to your library when generated."
    });
  };

  const handlePostNow = async (platformId: string, content: string, hashtags: string[]) => {
    if (platformId !== 'facebook') {
      toast({
        title: "Platform Not Supported",
        description: "Post Now is currently only available for Facebook. Use Schedule for other platforms.",
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

    setIsPosting(true);

    try {
      const postData = {
        platform: platformId,
        content: content,
        hashtags: hashtags,
        scheduledTime: new Date().toISOString(),
        pageId: getUserProfile().page || process.env.FACEBOOK_PAGE_ID,
        images: uploadedImages // Include uploaded images
      };

      const response = await axios.post('/api/schedule-post', postData);

      if (response.data.success) {
        toast({
          title: "Posted Successfully! 🎉",
          description: `Your content has been posted to Facebook.`,
        });
      } else {
        throw new Error(response.data.error || 'Failed to post');
      }
    } catch (error: any) {
      console.error('Error posting to Facebook:', error);
      toast({
        title: "Posting Failed",
        description: error.response?.data?.error || error.message || "Failed to post to Facebook. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedulePost = (platformId: string, content: string) => {
    setSelectedPlatformForSchedule(platformId);
    setSelectedContentForSchedule(content);
    setScheduleModalOpen(true);
  };

  const handleScheduleConfirm = (scheduleData: ScheduleData) => {
    if (!currentContentId) return;

    // Create scheduled post
    const scheduledPost: ScheduledPost = {
      id: Date.now().toString(),
      contentId: currentContentId,
      platform: selectedPlatformForSchedule,
      content: selectedContentForSchedule,
      scheduledDate: scheduleData.date.toISOString(),
      scheduledTime: scheduleData.time,
      timezone: scheduleData.timezone,
      recurring: scheduleData.recurring ? {
        ...scheduleData.recurring,
        endDate: scheduleData.recurring.endDate?.toISOString()
      } : undefined,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    saveScheduledPost(scheduledPost);

    // Create calendar event for the scheduled post
    const calendarEvent: CalendarEvent = {
      id: Date.now().toString() + '_cal',
      date: scheduleData.date.toISOString().split('T')[0],
      title: `${selectedPlatformForSchedule.charAt(0).toUpperCase() + selectedPlatformForSchedule.slice(1)} Post`,
      content: selectedContentForSchedule.substring(0, 100) + '...',
      platform: [selectedPlatformForSchedule],
      type: 'post',
      time: scheduleData.time,
      scheduledPostId: scheduledPost.id
    };

    saveCalendarEvent(calendarEvent);

    toast({
      title: "Post Scheduled! 📅",
      description: `${selectedPlatformForSchedule.charAt(0).toUpperCase() + selectedPlatformForSchedule.slice(1)} post scheduled for ${scheduleData.date.toLocaleDateString()}`
    });

    setScheduleModalOpen(false);
  };

  const handleGenerateNewFromScratch = () => {
    // Clear all state
    setOriginalContent("");
    setSelectedPlatforms(["instagram"]);
    setGeneratedContent({});
    setCurrentViewingPlatform("");
    setCurrentContentId("");
    setWordCount([150]);
    setIsStrictMode(false);

    // Clear localStorage
    clearCreatePageState();

    toast({
      title: "Started Fresh! 🧹",
      description: "All content and settings have been cleared. Ready for new creation!"
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
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentViewingPlatform(platformId)}
                            className="flex items-center space-x-2"
                          >
                            <Icon className={`w-4 h-4 ${platform.color === 'instagram' ? 'text-white' :
                              platform.color === 'twitter' ? 'text-white' :
                                platform.color === 'linkedin' ? 'text-white' : 'text-white'}`} />
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
                                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                                  {content.content}
                                </p>
                              </div>
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
                            <span>{content.characterCount} characters</span>
                            <span className={content.characterCount > platform.limit ? 'text-destructive' : 'text-success'}>
                              {platform.limit - content.characterCount} remaining
                            </span>
                          </div>



                          {/* Platform Preview */}
                          <div className="border-t pt-6">
                            <h4 className="text-lg font-medium mb-4">Live Preview</h4>
                            <PlatformPreview
                              content={content.content}
                              platform={currentViewingPlatform}
                              hashtags={content.hashtags}
                              pageName={getUserProfile().page}
                              ownerName={getUserProfile().name}
                              uploadedImages={uploadedImages}
                              onImageUpload={setUploadedImages}
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
                              className={`flex-1 min-w-[120px] ${
                                currentViewingPlatform === 'instagram'
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                  : currentViewingPlatform === 'facebook'
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : currentViewingPlatform === 'linkedin'
                                  ? 'bg-blue-500 hover:bg-blue-600'
                                  : currentViewingPlatform === 'twitter'
                                  ? 'bg-sky-500 hover:bg-sky-600'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                              disabled={isPosting}
                            >
                              {isPosting ? (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                <>
                                  {currentViewingPlatform === 'instagram' && <Instagram className="w-4 h-4 mr-2" />}
                                  {currentViewingPlatform === 'facebook' && <Facebook className="w-4 h-4 mr-2" />}
                                  {currentViewingPlatform === 'linkedin' && <Linkedin className="w-4 h-4 mr-2" />}
                                  {currentViewingPlatform === 'twitter' && <Twitter className="w-4 h-4 mr-2" />}
                                  Post Now
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSchedulePost(currentViewingPlatform, content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                              className="flex-1 min-w-[120px]"
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule
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

"use client";

import { useState } from "react";
import {
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Wand2,
  Copy,
  Download,
  Save,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/layout/Navigation";
import PlatformPreview from "@/components/platform/PlatformPreview";
import SuggestedPrompts from "@/components/content/SuggestedPrompts";
import ScheduleModal, { ScheduleData } from "@/components/content/ScheduleModal";
import { useToast } from "@/hooks/use-toast";
import {
  saveContent,
  saveScheduledPost,
  saveCalendarEvent,
  type SavedContent,
  type ScheduledPost,
  type CalendarEvent
} from "@/utils/storage";

const CreateContent = () => {
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPlatformForSchedule, setSelectedPlatformForSchedule] = useState("");
  const [selectedContentForSchedule, setSelectedContentForSchedule] = useState("");
  const [currentContentId, setCurrentContentId] = useState<string>("");
  const { toast } = useToast();

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
      id: "twitter",
      name: "Twitter/X",
      icon: Twitter,
      color: "twitter",
      limit: 280,
      description: "Concise, trending conversations"
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
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "facebook",
      limit: 63206,
      description: "Community-focused engagement"
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

    // Simulate AI content generation (in real app, this would call Supabase edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockGeneratedContent: Record<string, any> = {};

    selectedPlatforms.forEach(platform => {
      // Mock content generation based on platform
      let content = originalContent;
      let hashtags: string[] = [];

      switch (platform) {
        case "instagram":
          content = `✨ ${originalContent}\n\nWhat do you think? Let me know in the comments! 👇`;
          hashtags = ["content", "creator", "socialmedia", "inspiration", "community"];
          break;
        case "twitter":
          content = originalContent.length > 250 ?
            `${originalContent.substring(0, 250)}...` :
            `${originalContent}\n\n#Thread 🧵`;
          hashtags = ["twitter", "content", "creator"];
          break;
        case "linkedin":
          content = `${originalContent}\n\nWhat's your experience with this? I'd love to hear your thoughts in the comments.\n\n#ProfessionalGrowth #Leadership`;
          hashtags = ["professional", "leadership", "growth", "networking"];
          break;
        case "facebook":
          content = `${originalContent}\n\nTag someone who needs to see this! 👥`;
          hashtags = ["community", "facebook", "social"];
          break;
      }

      mockGeneratedContent[platform] = {
        content,
        hashtags,
        characterCount: content.length
      };
    });

    setGeneratedContent(mockGeneratedContent);
    setIsGenerating(false);

    // Auto-save to content library using proper data structure
    const contentId = Date.now().toString();
    setCurrentContentId(contentId);

    const contentItem: SavedContent = {
      id: contentId,
      originalPrompt: originalContent,
      generatedContent: mockGeneratedContent,
      selectedPlatforms: selectedPlatforms,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage using storage utility
    saveContent(contentItem);

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

              <SuggestedPrompts onPromptSelect={setOriginalContent} />
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Select Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
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

          {/* Note about Supabase */}
          <Card className="bg-muted/50 w-full">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> For full AI content generation, connect to Supabase to enable Gemini API integration.
                Currently showing mock content for demonstration.
              </p>
            </CardContent>
          </Card>

          {/* Generated Content & Preview */}
          {Object.keys(generatedContent).length > 0 ? (
            <div className="space-y-8">
              {selectedPlatforms.map(platformId => {
                const platform = platforms.find(p => p.id === platformId);
                const content = generatedContent[platformId];

                if (!platform || !content) return null;

                const Icon = platform.icon;

                return (
                  <Card key={platformId} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-6 h-6 ${platform.color === 'instagram' ? 'text-instagram' :
                            platform.color === 'twitter' ? 'text-twitter' :
                            platform.color === 'linkedin' ? 'text-linkedin' : 'text-facebook'}`} />
                          <span className="text-xl">{platform.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveToLibrary(platformId)}
                            title="Save to library"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSchedulePost(platformId, content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                            title="Schedule post"
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 bg-muted/30 rounded-lg">
                        <p className="whitespace-pre-wrap mb-4 text-base leading-relaxed">{content.content}</p>
                        {content.hashtags.length > 0 && (
                          <p className="text-primary text-base">
                            {content.hashtags.map((tag: string) => `#${tag}`).join(' ')}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{content.characterCount} characters</span>
                        <span className={content.characterCount > platform.limit ? 'text-destructive' : 'text-success'}>
                          {platform.limit - content.characterCount} remaining
                        </span>
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveToLibrary(platformId)}
                          className="flex-1 min-w-[120px]"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSchedulePost(platformId, content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                          className="flex-1 min-w-[120px]"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>

                      {/* Platform Preview */}
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-medium mb-4">Live Preview</h4>
                        <PlatformPreview
                          content={content.content}
                          platform={platformId}
                          hashtags={content.hashtags}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center w-full">
              <CardContent className="text-center">
                <Wand2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-medium text-muted-foreground mb-3">
                  Generated content will appear here
                </h3>
                <p className="text-muted-foreground">
                  Enter your content and select platforms to get started
                </p>
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

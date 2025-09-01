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
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/layout/Navigation";
import PlatformPreview from "@/components/platform/PlatformPreview";
import { useToast } from "@/hooks/use-toast";

const CreateContent = () => {
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
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

    toast({
      title: "Content Generated! ✨",
      description: `Successfully created content for ${selectedPlatforms.length} platform(s).`
    });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Your Original Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your content idea, script, or message here. Our AI will adapt it for each platform..."
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  className="min-h-[200px] text-base"
                />
                <div className="text-sm text-muted-foreground">
                  {originalContent.length} characters
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    
                    return (
                      <div
                        key={platform.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                          <Icon className={`w-5 h-5 ${platform.color === 'instagram' ? 'text-instagram' : 
                            platform.color === 'twitter' ? 'text-twitter' :
                            platform.color === 'linkedin' ? 'text-linkedin' : 'text-facebook'}`} />
                          <div>
                            <Label className="font-medium cursor-pointer">
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
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Content
                </>
              )}
            </HeroButton>

            {/* Note about Supabase */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> For full AI content generation, connect to Supabase to enable Gemini API integration. 
                  Currently showing mock content for demonstration.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content & Preview */}
          <div className="space-y-6">
            {Object.keys(generatedContent).length > 0 ? (
              <div className="space-y-6">
                {selectedPlatforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  const content = generatedContent[platformId];
                  
                  if (!platform || !content) return null;
                  
                  const Icon = platform.icon;
                  
                  return (
                    <Card key={platformId}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${platform.color === 'instagram' ? 'text-instagram' : 
                              platform.color === 'twitter' ? 'text-twitter' :
                              platform.color === 'linkedin' ? 'text-linkedin' : 'text-facebook'}`} />
                            <span>{platform.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(content.content + '\n\n' + content.hashtags.map((h: string) => `#${h}`).join(' '))}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Save className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="whitespace-pre-wrap mb-2">{content.content}</p>
                          {content.hashtags.length > 0 && (
                            <p className="text-primary">
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
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Platform Preview */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                  <PlatformPreview
                    content={generatedContent[selectedPlatforms[0]]?.content || ""}
                    platform={selectedPlatforms[0] || "instagram"}
                    hashtags={generatedContent[selectedPlatforms[0]]?.hashtags || []}
                  />
                </div>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Generated content will appear here
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your content and select platforms to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
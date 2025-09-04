"use client";

import { useState } from 'react';
import {
  Wand2,
  Upload,
  Download,
  Heart,
  Share2,
  Sparkles,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/layout/Navigation';
import { CreditDisplay, useCredits } from '@/components/credit/CreditDisplay';
import { ImageUpload } from '@/components/image/ImageUpload';
import { ImageSkeleton } from '@/components/ui/skeleton';
import SuggestedPrompts from '@/components/content/SuggestedPrompts';
import { toast } from 'sonner';

const ImageStudio = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { credits, deductCredits, hasCredits } = useCredits();

  const imageSuggestions = [
    "Professional headshot with clean background",
    "Product showcase with modern lighting",
    "Lifestyle photo with natural setting",
    "Brand logo design with minimalist style",
    "Social media story background",
    "Event banner with bold typography",
    "Artistic portrait with dramatic lighting",
    "Abstract background for presentations"
  ];

  const editSuggestions = [
    "make it darker",
    "add sunset lighting",
    "remove background",
    "make it more colorful",
    "add professional lighting",
    "convert to black and white",
    "enhance the contrast",
    "add blur effect to background"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    if (imageData && mode === 'generate') {
      setMode('edit');
    }
  };

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!hasCredits(10)) {
      toast.error('Insufficient credits. You need ₹10 to generate images.');
      return;
    }

    if (mode === 'edit' && !uploadedImage) {
      toast.error('Please upload an image to edit');
      return;
    }

    // This functionality requires AI API integration
    toast.error('Image generation requires Supabase integration with AI APIs');
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToFavorites = (imageUrl: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorite-images') || '[]');
    favorites.push({
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
      timestamp: new Date().toISOString(),
      mode
    });
    localStorage.setItem('favorite-images', JSON.stringify(favorites));
    toast.success('Image saved to favorites!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Image Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate and edit images with AI-powered tools
          </p>
          <div className="flex justify-center mt-6">
            <CreditDisplay />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant={mode === 'generate' ? 'default' : 'outline'}
              onClick={() => setMode('generate')}
              className="flex-1 sm:flex-none"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate from Prompt
            </Button>
            <Button
              variant={mode === 'edit' ? 'default' : 'outline'}
              onClick={() => setMode('edit')}
              className="flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload & Edit
            </Button>
          </div>

          {/* Supabase Integration Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Image generation and editing requires Supabase integration with AI APIs.
              Connect to Supabase to unlock this feature with Google Gemini or other AI providers.
            </AlertDescription>
          </Alert>

          {/* Input Section */}
          <div className="space-y-8">
            {mode === 'edit' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Upload Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  disabled={isGenerating}
                />
              </CardContent>
            </Card>
            )}

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{mode === 'generate' ? 'Generation Prompt' : 'Edit Instructions'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'generate'
                    ? "Describe the image you want to generate..."
                    : "Describe how you want to edit the image..."
                  }
                  className="min-h-24 resize-none"
                  disabled={isGenerating}
                />

                <SuggestedPrompts
                  prompts={mode === 'generate' ? imageSuggestions : editSuggestions}
                  onPromptSelect={handleSuggestionClick}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <HeroButton
                    variant="hero"
                    onClick={generateImages}
                    disabled={isGenerating || !hasCredits(10)}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Images (₹10)
                      </>
                    )}
                  </HeroButton>

                  {credits < 50 && (
                    <Badge variant="destructive" className="self-center whitespace-nowrap">
                      Low Credits
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Each generation creates 3 image variations and costs ₹10
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;

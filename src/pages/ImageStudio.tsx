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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Image Studio
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate and edit images with AI-powered tools
            </p>
          </div>
          <CreditDisplay />
        </div>

        {/* Mode Selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Image generation and editing requires Supabase integration with AI APIs. 
            Connect to Supabase to unlock this feature with Google Gemini or other AI providers.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {mode === 'edit' && (
              <Card>
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

            <Card>
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

          {/* Results Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Images</span>
                  {generatedImages.length > 0 && (
                    <Badge variant="secondary">
                      {generatedImages.length} results
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {isGenerating ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, index) => (
                      <ImageSkeleton 
                        key={index} 
                        className="aspect-square"
                      />
                    ))
                  ) : generatedImages.length > 0 ? (
                    // Generated images
                    generatedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={imageUrl} 
                          alt={`Generated image ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => downloadImage(imageUrl, index)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => saveToFavorites(imageUrl)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Empty state
                    <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Generated images will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
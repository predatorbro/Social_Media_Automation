"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Wand2,
  Upload,
  Download,
  Heart,
  Share2,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import Navigation from '@/components/layout/Navigation';
import { CreditDisplay, useCredits } from '@/components/credit/CreditDisplay';
import { ImageUpload } from '@/components/image/ImageUpload';

import SuggestedPrompts from '@/components/content/SuggestedPrompts';
import { toast } from 'sonner';

const ImageStudio = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numImages, setNumImages] = useState(1);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const { credits, hasCredits } = useCredits();

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

    setIsGenerating(true);
    // Use actual images from public folder
    const availableImages = [
      '/ai-generated-8794203_1280.png',
      '/AI-generated-art-copyright.jpg',
      '/ai-images.jpeg'
    ];
    const selectedImages = availableImages.slice(0, numImages);
    setGeneratedImages(selectedImages);
    setIsGenerating(false);
    toast.success(`Generated ${numImages} image${numImages > 1 ? 's' : ''}!`);
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

  const openImageCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setCarouselOpen(true);
  };

  // Update current image index when carousel changes
  useEffect(() => {
    if (!carouselApi) {
      console.log('Carousel API not available');
      return;
    }

    console.log('Carousel API available:', carouselApi);

    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap();
      console.log('Carousel selected index:', newIndex);
      setCurrentImageIndex(newIndex);
    };

    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Initialize carousel when modal opens
  useEffect(() => {
    if (carouselOpen && carouselApi && generatedImages.length > 0) {
      // Small delay to ensure carousel is fully rendered
      setTimeout(() => {
        carouselApi.scrollTo(currentImageIndex);
      }, 100);
    }
  }, [carouselOpen, carouselApi, generatedImages.length, currentImageIndex]);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!carouselOpen || !carouselApi) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          carouselApi.scrollPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          carouselApi.scrollNext();
          break;
        case 'Escape':
          event.preventDefault();
          setCarouselOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [carouselOpen, carouselApi]);

  // Prevent page navigation/refresh when there are generated images
  useEffect(() => {
    if (generatedImages.length === 0) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'No data is saved and cannot be accessed back. Are you sure you want to leave this page?';
      return 'No data is saved and cannot be accessed back. Are you sure you want to leave this page?';
    };

    // Intercept client-side navigation
    const handleNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.href.includes(window.location.origin + '/studio')) {
        const confirmLeave = window.confirm('No data is saved and cannot be accessed back. Are you sure you want to leave this page?');
        if (!confirmLeave) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleNavigation, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleNavigation, true);
    };
  }, [generatedImages.length]);

  // Auto-scroll to generated images section when images are generated
  useEffect(() => {
    if (generatedImages.length > 0) {
      const generatedImagesSection = document.querySelector('[data-generated-images]');
      if (generatedImagesSection) {
        setTimeout(() => {
          generatedImagesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [generatedImages.length]);

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
                  className="min-h-40 resize-none"
                  disabled={isGenerating}
                />

                <SuggestedPrompts
                  prompts={mode === 'generate' ? imageSuggestions : editSuggestions}
                  onPromptSelect={handleSuggestionClick}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Images: {numImages}</label>
                  <Slider
                    value={[numImages]}
                    onValueChange={(value) => setNumImages(value[0])}
                    max={3}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

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
                        Generate Images (₹{`${10 * numImages}`})
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
                  Each generation creates {numImages} image variation{numImages > 1 ? 's' : ''} and costs ₹{`${10 * numImages}`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generated Images Section */}
          {generatedImages.length > 0 && (
            <Card className="w-full" data-generated-images>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Generated Images</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => openImageCarousel(index)}>
                      <div className="w-full aspect-square relative rounded-lg border overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
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
                            onClick={() => {
                              navigator.share?.({
                                title: 'Generated Image',
                                url: imageUrl
                              });
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Full Page Image Carousel Modal */}
      <Dialog open={carouselOpen} onOpenChange={setCarouselOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95">
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <div className="relative w-full h-full flex flex-col">
            {/* Main Carousel */}
            <div className="flex-1 flex items-center justify-center p-4">
              <Carousel
                setApi={setCarouselApi}
                className="w-full max-w-4xl h-full"
                opts={{
                  loop: true,
                  align: 'center',
                }}
              >
                <CarouselContent>
                  {generatedImages.map((imageUrl, index) => (
                    <CarouselItem
                      key={index}
                      className="flex items-center justify-center"
                    >
                      <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          fill
                          className="object-contain cursor-grab"
                          unoptimized
                          onError={(e) => {
                            console.error("Image failed to load:", imageUrl);
                            e.currentTarget.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log("Image loaded successfully:", imageUrl);
                          }}
                        />
                        {/* Image counter */}
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {index + 1} / {generatedImages.length}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/70 border-white/20 text-white" />
                <CarouselNext className="right-4 bg-black/50 hover:bg-black/70 border-white/20 text-white" />
              </Carousel>
            </div>

            {/* Thumbnail Navigation */}
            <div className="p-4 bg-black/80">
              <div className="flex justify-center gap-2 max-w-4xl mx-auto ">
                {generatedImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                      }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadImage(generatedImages[currentImageIndex], currentImageIndex)}
                className="bg-black/50 hover:bg-black/70 border-white/20 text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => saveToFavorites(generatedImages[currentImageIndex])}
                className="bg-black/50 hover:bg-black/70 border-white/20 text-white"
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigator.share?.({
                    title: 'Generated Image',
                    url: generatedImages[currentImageIndex]
                  });
                }}
                className="bg-black/50 hover:bg-black/70 border-white/20 text-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ImageStudio;

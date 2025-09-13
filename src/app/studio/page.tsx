"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Wand2,
  Upload,
  Download,
  Heart,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Save,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import Navigation from '@/components/layout/Navigation';
import { CreditDisplay, useCredits, refreshAllCredits } from '@/components/credit/CreditDisplay';
import { ImageUpload } from '@/components/image/ImageUpload';

import SuggestedPrompts from '@/components/content/SuggestedPrompts';
import { Loading } from '@/components/ui/Loader';
import { toast } from 'sonner';

// Studio cache interface (without images to save space)
interface StudioCache {
  mode: 'generate' | 'edit';
  prompt: string;
  generatedImages: string[];
  numImages: number;
  carouselOpen: boolean;
  currentImageIndex: number;
  switches: SwitchConfig;
  allowEnhancement: boolean;
  enhancementType: 'general' | 'specific' | null;
  promptEnhanced: boolean;
  timestamp: number;
}

// Switch configuration interface
interface SwitchConfig {
  // STYLE SWITCHES (Choose one primary style)
  photorealistic: boolean;
  artistic: boolean;
  anime: boolean;
  vintage: boolean;
  minimalist: boolean;
  // LIGHTING SWITCHES
  naturalLighting: boolean;
  dramaticLighting: boolean;
  // COMPOSITION SWITCHES
  instagramReady: boolean;
  professionalPhoto: boolean;
  // CONTENT ENHANCEMENT SWITCHES
  addText: boolean;
  ugcStyle: boolean;
}

// Cache utilities (simplified, no image compression)
const CACHE_KEY = 'studio-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const saveStudioCache = (data: Omit<StudioCache, 'timestamp'>): void => {
  try {
    const cacheData: StudioCache = {
      ...data,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Studio cache saved');
  } catch (error) {
    console.error('Failed to save studio cache:', error);
  }
};

const loadStudioCache = (): StudioCache | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: StudioCache = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log('Studio cache loaded');
    return cacheData;
  } catch (error) {
    console.error('Failed to load studio cache:', error);
    return null;
  }
};

const clearStudioCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Studio cache cleared');
  } catch (error) {
    console.error('Failed to clear studio cache:', error);
  }
};

const ImageStudio = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numImages, setNumImages] = useState(1);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [allowEnhancement, setAllowEnhancement] = useState(false);
  const [enhancementType, setEnhancementType] = useState<'general' | 'specific' | null>(null);
  const [promptEnhanced, setPromptEnhanced] = useState(false);
  const [switches, setSwitches] = useState({
    // STYLE SWITCHES (Choose one primary style)
    photorealistic: false,
    artistic: false,
    anime: false,
    vintage: false,
    minimalist: false,
    // LIGHTING SWITCHES
    naturalLighting: false,
    dramaticLighting: false,
    // COMPOSITION SWITCHES
    instagramReady: false,
    professionalPhoto: false,
    // CONTENT ENHANCEMENT SWITCHES
    addText: false,
    ugcStyle: false
  });
  const { credits, hasCredits, deductCredits } = useCredits();

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
    setPromptEnhanced(false); // Reset enhancement state when new prompt is selected
  };

  const generatePrompt = (prompt: string, switches: SwitchConfig) => {
    let additionalInstructions = '';

    // STYLE SWITCHES (Choose one primary style)
    if (switches.photorealistic) {
      additionalInstructions += '\n- PHOTOREALISTIC: Natural lighting, authentic textures, genuine photography feel, DSLR camera quality';
    }

    if (switches.artistic) {
      additionalInstructions += '\n- ARTISTIC STYLE: Hand-drawn sketch, watercolor, or oil painting aesthetic with creative interpretation';
    }

    if (switches.anime) {
      additionalInstructions += '\n- ANIME/GHIBLI: Studio Ghibli art style, soft anime aesthetic, warm colors, whimsical atmosphere';
    }

    if (switches.vintage) {
      additionalInstructions += '\n- VINTAGE: Film grain, muted colors, retro aesthetic, aged photograph feel, nostalgic mood';
    }

    if (switches.minimalist) {
      additionalInstructions += '\n- MINIMALIST: Clean lines, simple composition, limited color palette, modern design, negative space';
    }

    // LIGHTING SWITCHES
    if (switches.naturalLighting) {
      additionalInstructions += '\n- NATURAL LIGHTING: Soft daylight, window light, realistic shadows, authentic illumination';
    }

    if (switches.dramaticLighting) {
      additionalInstructions += '\n- DRAMATIC LIGHTING: Golden hour, cinematic contrasts, moody shadows, strong visual impact';
    }

    // COMPOSITION SWITCHES
    if (switches.instagramReady) {
      additionalInstructions += '\n- INSTAGRAM OPTIMIZED: Social media friendly, engaging composition, modern aesthetics, shareable content';
    }

    if (switches.professionalPhoto) {
      additionalInstructions += '\n- PROFESSIONAL PHOTOGRAPHY: DSLR settings, proper framing, depth of field, studio quality';
    }

    // CONTENT ENHANCEMENT SWITCHES
    if (switches.addText) {
      additionalInstructions += '\n- INCLUDE TEXT: Add relevant text overlay or typography that fits naturally with the image';
    }

    if (switches.ugcStyle) {
      additionalInstructions += '\n- UGC STYLE: User-generated content aesthetic, authentic and relatable, casual composition, natural imperfections, smartphone photography feel, genuine moments';
    }

    const enhancementPrompt = `Transform this basic prompt into an enhanced image generation prompt while STRICTLY preserving the original subject and concept. Do not change what the user requested - only enhance HOW it looks based on the selected style preferences.

CORE PRINCIPLES:
- Preserve user's original concept completely
- 60% describing user's exact subject, 40% style enhancements
- Create engaging, high-quality imagery
- Avoid overly artificial or "AI-generated" appearance${additionalInstructions}

AVOID:
- Changing the main subject or adding unwanted elements
- "Hyper-realistic", "highly detailed", "perfect" unless specifically chosen
- Conflicting style elements
- Over-processing that looks artificial

RULES:
- Output ONLY the enhanced prompt
- No introductory text or commentary
- No markdown formatting
- No quotation marks around output
- Newlines allowed for readability
- Keep 60-120 words depending on complexity
- Focus on the EXACT subject requested

Original prompt: "${prompt}"`;

    return enhancementPrompt;
  };

  const handleSwitchChange = (switchName: string, checked: boolean) => {
    setSwitches(prev => ({
      ...prev,
      [switchName]: checked
    }));
    // Switches now only update state - they will influence the enhancement prompt sent to Gemini
  };

  const handleImageUpload = (imageData: string[]) => {
    setUploadedImages(imageData);
    if (imageData.length > 0 && mode === 'generate') {
      setMode('edit');
    }
  };

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // If enhancement is allowed and prompt hasn't been enhanced yet, enhance it first
    if (allowEnhancement && !promptEnhanced) {
      await enhancePrompt();
      setPromptEnhanced(true);
      return;
    }

    // Otherwise, generate the images
    const creditCost = 10 * numImages;
    if (!hasCredits(creditCost)) {
      toast.error(`Insufficient credits. You need ₹${creditCost} to generate ${numImages} image${numImages > 1 ? 's' : ''}.`);
      return;
    }

    if (mode === 'edit' && uploadedImages.length === 0) {
      toast.error('Please upload an image to edit');
      return;
    }

    setIsGenerating(true);

    try {
      // Deduct credits from database
      const newCredits = await deductCredits(creditCost, `Generated ${numImages} image${numImages > 1 ? 's' : ''}`);

      // Refresh all credit displays across the app
      refreshAllCredits();

      // Use actual images from public folder
      const availableImages = [
        '/ai-generated-8794203_1280.png',
        '/AI-generated-art-copyright.jpg',
        '/ai-images.jpeg'
      ];
      const selectedImages = availableImages.slice(0, numImages);
      setGeneratedImages(selectedImages);

      toast.success(`Generated ${numImages} image${numImages > 1 ? 's' : ''}! Credits remaining: ₹${newCredits}`);
    } catch (error) {
      console.error('Failed to generate images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    setStreamingText('');
    setEnhancedPrompt('');

    try {
      let enhancementPrompt = '';

      if (enhancementType === 'general') {
        // Simple general prompt general enhancement prompt
        enhancementPrompt = `Enhance this prompt for better AI image generation while keeping the original concept EXACTLY the same. Only add essential visual improvements like basic lighting, image quality, and composition details. Do not change the subject, setting, or main elements - just make the existing concept clearer and more detailed for the AI to understand.

        ENHANCEMENT FOCUS:
        - Add basic lighting conditions (natural light, indoor light, etc.)
        - Include simple composition details (close-up, full shot, angle)
        - Specify image quality (clear, sharp, well-lit)
        - Add minimal environmental context if needed
        - Keep all original subjects, objects, and scenarios identical

        CRITICAL RULES:
        - DO NOT change what the user requested
        - DO NOT add new subjects or remove existing ones
        - DO NOT alter the main concept or scenario
        - Only clarify and enhance what's already there
        - Output ONLY the enhanced prompt
        - No commentary, explanations, or introductory text
        - No markdown formatting or quotation marks
        - Keep between 50-100 words
        - Preserve the user's exact intent

        Original prompt: "${prompt}"`;

      } else if (enhancementType === 'specific') {
        // Use the complex specific enhancement prompt
        enhancementPrompt = generatePrompt(prompt, switches);
      }

      console.log("The ultimate enhancement prompt : ", enhancementPrompt)

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: enhancementPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      const enhancedText = data.text;

      // Create streaming effect
      const words = enhancedText.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingText(currentText);
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay per word
      }

      setEnhancedPrompt(enhancedText);
      setPrompt(enhancedText); // Replace the original prompt with enhanced one
      toast.success('Prompt enhanced successfully!');
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
      toast.error('Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
      setStreamingText('');
    }
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

  // Load cache on component mount
  useEffect(() => {
    const cached = loadStudioCache();
    if (cached) {
      setMode(cached.mode);
      setPrompt(cached.prompt);
      setGeneratedImages(cached.generatedImages);
      setNumImages(cached.numImages);
      setCarouselOpen(cached.carouselOpen);
      setCurrentImageIndex(cached.currentImageIndex);
      setSwitches(cached.switches);
      setAllowEnhancement(cached.allowEnhancement);
      setEnhancementType(cached.enhancementType);
      setPromptEnhanced(cached.promptEnhanced);
    }
    setCacheLoaded(true);
  }, []);

  // Auto-save cache when state changes (debounced)
  useEffect(() => {
    if (!cacheLoaded) return;

    const timeoutId = setTimeout(() => {
      saveStudioCache({
        mode,
        prompt,
        generatedImages,
        numImages,
        carouselOpen,
        currentImageIndex,
        switches,
        allowEnhancement,
        enhancementType,
        promptEnhanced
      });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [mode, prompt, uploadedImages, generatedImages, numImages, carouselOpen, currentImageIndex, switches, allowEnhancement, enhancementType, promptEnhanced, cacheLoaded]);

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

  // Cache management functions
  const handleSaveCache = useCallback(async () => {
    await saveStudioCache({
      mode,
      prompt,
      generatedImages,
      numImages,
      carouselOpen,
      currentImageIndex,
      switches,
      allowEnhancement,
      enhancementType,
      promptEnhanced
    });
    toast.success('Studio data saved to cache');
  }, [mode, prompt, generatedImages, numImages, carouselOpen, currentImageIndex, switches, allowEnhancement, enhancementType, promptEnhanced]);

  const handleClearCache = useCallback(() => {
    clearStudioCache();
    toast.success('Cache cleared');
  }, []);

  const handleGenerateNewFromScratch = useCallback(() => {
    // Clear all state
    setMode('generate');
    setPrompt('');
    setUploadedImages([]);
    setGeneratedImages([]);
    setNumImages(1);
    setCarouselOpen(false);
    setCurrentImageIndex(0);
    setSwitches({
      photorealistic: false,
      artistic: false,
      anime: false,
      vintage: false,
      minimalist: false,
      naturalLighting: false,
      dramaticLighting: false,
      instagramReady: false,
      professionalPhoto: false,
      addText: false,
      ugcStyle: false
    });
    setAllowEnhancement(false);
    setEnhancementType(null);
    setPromptEnhanced(false);

    // Clear cache
    clearStudioCache();

    toast.success('Started fresh! All content and settings have been cleared.');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Full Page Loader */}
      {(!cacheLoaded || isGenerating || isEnhancing) && <Loading />}

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
                    <span>Upload Images</span>
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
                  id="texarea-for-prompt-for-image-generation"
                  value={isEnhancing ? streamingText : prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'generate'
                    ? "Describe the image you want to generate..."
                    : "Describe how you want to edit the image..."
                  }
                  className="min-h-40 resize-none"
                  disabled={isGenerating || isEnhancing}
                />

                {isEnhancing && (
                  <div className="text-sm text-purple-600 flex items-center gap-2 font-medium">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ✨ Casting magic spell...
                  </div>
                )}

                <SuggestedPrompts
                  prompts={mode === 'generate' ? imageSuggestions : editSuggestions}
                  onPromptSelect={handleSuggestionClick}
                />

                {/* Number of Images Selection - Enhanced Visibility */}
                <Card className="w-full bg-gradient-to-r from-blue-50/60 to-cyan-50/60 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">Number of Images</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            {numImages} selected
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">Cost per image</div>
                          <div className="text-lg font-bold text-blue-600">₹10</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Slider
                          value={[numImages]}
                          onValueChange={(value) => setNumImages(value[0])}
                          max={3}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 image</span>
                          <span>2 images</span>
                          <span>3 images</span>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="bg-blue-100/50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Cost:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              ₹{10 * numImages}
                            </span>
                            <Badge variant={numImages > 1 ? "destructive" : "secondary"} className="text-xs">
                              {numImages} × ₹10
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <p className="text-xs text-muted-foreground">
                            Each generation creates {numImages} image variation{numImages > 1 ? 's' : ''} and costs ₹{`${10 * numImages}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings Section */}
                <Card className={`w-full transition-all duration-500 ${allowEnhancement
                  ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-700'
                  : 'bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-800/30 dark:to-gray-800/30'
                  }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between space-x-3">
                      {/* Enhancement Type Selection */}
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground">Choose Enhancement Type:</div>
                        <div className="flex flex-col gap-4">
                          {/* General Enhancement */}
                          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                            <div className="relative">
                              <Checkbox
                                id="general-enhancement"
                                checked={enhancementType === 'general'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEnhancementType('general');
                                    setAllowEnhancement(true);
                                    setPromptEnhanced(false);
                                  } else {
                                    setEnhancementType(null);
                                    setAllowEnhancement(false);
                                    setPromptEnhanced(false);
                                    // Reset switches when enhancement is disabled
                                    setSwitches({
                                      photorealistic: false,
                                      artistic: false,
                                      anime: false,
                                      vintage: false,
                                      minimalist: false,
                                      naturalLighting: false,
                                      dramaticLighting: false,
                                      instagramReady: false,
                                      professionalPhoto: false,
                                      addText: false,
                                      ugcStyle: false
                                    });
                                  }
                                }}
                                className={`w-5 h-5 transition-all duration-300 rounded-md border-2 ${enhancementType === 'general'
                                  ? 'border-green-500 bg-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 shadow-lg shadow-green-500/30'
                                  : 'border-slate-400 bg-white dark:bg-slate-800 hover:border-green-400 hover:shadow-md hover:shadow-green-400/20'
                                  }`}
                              />
                              {enhancementType === 'general' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-75" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="general-enhancement" className={`text-sm font-medium cursor-pointer select-none transition-all duration-300 ${enhancementType === 'general'
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                🌟 General Enhancement
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Simple, quick enhancement that adds basic visual details, lighting, and style to your prompt. Perfect for straightforward improvements without complex customization.
                              </p>
                            </div>
                          </div>

                          {/* Specific Prompt Enhancement */}
                          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                            <div className="relative">
                              <Checkbox
                                id="specific-enhancement"
                                checked={enhancementType === 'specific'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEnhancementType('specific');
                                    setAllowEnhancement(true);
                                    setPromptEnhanced(false);
                                  } else {
                                    setEnhancementType(null);
                                    setAllowEnhancement(false);
                                    setPromptEnhanced(false);
                                    // Reset switches when enhancement is disabled
                                    setSwitches({
                                      photorealistic: false,
                                      artistic: false,
                                      anime: false,
                                      vintage: false,
                                      minimalist: false,
                                      naturalLighting: false,
                                      dramaticLighting: false,
                                      instagramReady: false,
                                      professionalPhoto: false,
                                      addText: false,
                                      ugcStyle: false
                                    });
                                  }
                                }}
                                className={`w-5 h-5 transition-all duration-300 rounded-md border-2 ${enhancementType === 'specific'
                                  ? 'border-indigo-500 bg-indigo-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 shadow-lg shadow-indigo-500/30'
                                  : 'border-slate-400 bg-white dark:bg-slate-800 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-400/20'
                                  }`}
                              />
                              {enhancementType === 'specific' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-ping opacity-75" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="specific-enhancement" className={`text-sm font-medium cursor-pointer select-none transition-all duration-300 ${enhancementType === 'specific'
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                🎯 Specific Prompt Enhancement
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Advanced enhancement with detailed style controls, lighting options, composition settings, and content customization. Use the switches below for precise control over your prompt.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`space-y-6 ${enhancementType == "specific" ? "block" : "hidden"}`}>
                    {/* STYLE SWITCHES */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🎨 Style</h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">5 options</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="photorealistic" className="text-xs font-medium cursor-pointer">
                            📸 Photorealistic
                          </Label>
                          <Switch
                            id="photorealistic"
                            checked={switches.photorealistic}
                            onCheckedChange={(checked) => handleSwitchChange('photorealistic', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="artistic" className="text-xs font-medium cursor-pointer">
                            🎨 Artistic
                          </Label>
                          <Switch
                            id="artistic"
                            checked={switches.artistic}
                            onCheckedChange={(checked) => handleSwitchChange('artistic', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="anime" className="text-xs font-medium cursor-pointer">
                            🎭 Ghibli
                          </Label>
                          <Switch
                            id="anime"
                            checked={switches.anime}
                            onCheckedChange={(checked) => handleSwitchChange('anime', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="vintage" className="text-xs font-medium cursor-pointer">
                            📻 Vintage
                          </Label>
                          <Switch
                            id="vintage"
                            checked={switches.vintage}
                            onCheckedChange={(checked) => handleSwitchChange('vintage', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="minimalist" className="text-xs font-medium cursor-pointer">
                            ⚪ Minimalist
                          </Label>
                          <Switch
                            id="minimalist"
                            checked={switches.minimalist}
                            onCheckedChange={(checked) => handleSwitchChange('minimalist', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>
                      </div>
                    </div>

                    {/* LIGHTING SWITCHES */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">💡 Lighting</h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">2 options</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="natural-lighting" className="text-sm font-medium cursor-pointer">
                            🌅 Natural Lighting
                          </Label>
                          <Switch
                            id="natural-lighting"
                            checked={switches.naturalLighting}
                            onCheckedChange={(checked) => handleSwitchChange('naturalLighting', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="dramatic-lighting" className="text-sm font-medium cursor-pointer">
                            🎬 Dramatic Lighting
                          </Label>
                          <Switch
                            id="dramatic-lighting"
                            checked={switches.dramaticLighting}
                            onCheckedChange={(checked) => handleSwitchChange('dramaticLighting', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>
                      </div>
                    </div>

                    {/* COMPOSITION SWITCHES */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">📐 Composition</h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">2 options</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="instagram-ready" className="text-sm font-medium cursor-pointer">
                            📱 Instagram Ready
                          </Label>
                          <Switch
                            id="instagram-ready"
                            checked={switches.instagramReady}
                            onCheckedChange={(checked) => handleSwitchChange('instagramReady', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="professional-photo" className="text-sm font-medium cursor-pointer">
                            📷 Professional Photo
                          </Label>
                          <Switch
                            id="professional-photo"
                            checked={switches.professionalPhoto}
                            onCheckedChange={(checked) => handleSwitchChange('professionalPhoto', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTENT ENHANCEMENT SWITCHES */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">✨ Content</h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">2 options</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="add-text" className="text-sm font-medium cursor-pointer">
                            📝 Add Text
                          </Label>
                          <Switch
                            id="add-text"
                            checked={switches.addText}
                            onCheckedChange={(checked) => handleSwitchChange('addText', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <Label htmlFor="ugc-style" className="text-sm font-medium cursor-pointer">
                            📸 UGC Commercial
                          </Label>
                          <Switch
                            id="ugc-style"
                            checked={switches.ugcStyle}
                            onCheckedChange={(checked) => handleSwitchChange('ugcStyle', checked)}
                            disabled={!allowEnhancement}
                          />
                        </div>
                      </div>
                    </div>

                    {allowEnhancement && (
                      <div className="text-xs text-muted-foreground pt-3 border-t">
                        💡 Toggle switches to add specific styles to your prompt. First click enhances prompt, second click generates images.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <HeroButton
                    variant="hero"
                    onClick={handleGenerateClick}
                    disabled={(isGenerating || isEnhancing) || !hasCredits(10)}
                    className={`flex-1 transition-all duration-300 ${isEnhancing
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/50 shadow-lg animate-pulse'
                      : allowEnhancement && !promptEnhanced
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-400/50 hover:shadow-purple-500/70 hover:shadow-lg hover:scale-105'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-400/50 hover:shadow-blue-500/70 hover:shadow-lg hover:scale-105'
                      }`}
                  >
                    {isEnhancing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="text-lg font-semibold">Enhancing Prompt...</span>
                      </>
                    ) : isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="text-lg font-semibold">Generating...</span>
                      </>
                    ) : allowEnhancement && !promptEnhanced ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                        <span className="text-lg font-semibold">Enhance Prompt</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-3" />
                        <span className="text-lg font-semibold">Generate Images (₹{`${10 * numImages}`})</span>
                      </>
                    )}
                  </HeroButton>

                  {credits < 50 && (
                    <Badge variant="destructive" className="self-center whitespace-nowrap">
                      Low Credits
                    </Badge>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Generated Images Section */}
          <Card className="w-full" data-generated-images>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Generated Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImages.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Your Generated Images Will Display Here
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure your prompt and enhancement settings above, then click "Generate Images" to see your AI-generated artwork appear in this section.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Wand2 className="w-4 h-4" />
                    <span>Ready to create something amazing!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate New From Scratch Section - Show when there's content or generated images */}
          {(generatedImages.length > 0 || prompt.trim().length > 0) && (
            <Card className="w-full mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-dashed border-primary/30">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Wand2 className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Create Something New
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ready to try a different idea? Start fresh with a clean workspace and create new images.
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateNewFromScratch}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Start Fresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cache Status */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="w-4 h-4" />
            <span>Auto-saving to cache</span>
          </div>
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

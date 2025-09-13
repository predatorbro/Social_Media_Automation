import { useState, useRef, useEffect } from "react";
import { User, Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp, Upload, X, RotateCcw, BadgeCheck, Globe, Globe2, GlobeLock, Check, Loader2, PlaneIcon, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSharedImages, saveSharedImages, clearSharedImages, SharedImageData } from "@/utils/storage";
import { toast } from "sonner";
import axios from "axios";

interface PlatformPreviewProps {
  content: string;
  platform: string;
  hashtags?: string[];
  pageName?: string;
  ownerName?: string;
  onCloudinaryUrls?: (urls: string[]) => void;
  onLocalImagesChange?: (hasLocalImages: boolean, isUploading: boolean) => void;
  onResetImages?: () => void;
}

const PlatformPreview = ({
  content,
  platform,
  hashtags = [],
  pageName,
  ownerName,
  onCloudinaryUrls,
  onLocalImagesChange,
  onResetImages
}: PlatformPreviewProps) => {
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [sharedUploadedImages, setSharedUploadedImages] = useState<SharedImageData[]>([]);
  const [isImagesUploaded, setIsImagesUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearingImages, setIsClearingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Load shared images from localStorage on mount
  useEffect(() => {
    const storedImages = getSharedImages();
    if (storedImages.length > 0) {
      setSharedUploadedImages(storedImages);
      setIsImagesUploaded(true);
    }
  }, []);

  // Pass Cloudinary URLs to parent component whenever images change
  useEffect(() => {
    const cloudinaryUrls = sharedUploadedImages.map((img: any) => img.url);
    onCloudinaryUrls?.(cloudinaryUrls);
  }, [sharedUploadedImages, onCloudinaryUrls]);

  // Notify parent about local images and uploading state
  useEffect(() => {
    const hasLocalImages = localImages.length > 0 && !isImagesUploaded;
    onLocalImagesChange?.(hasLocalImages, isUploading);
  }, [localImages, isImagesUploaded, isUploading, onLocalImagesChange]);

  // Handle reset from parent component
  useEffect(() => {
    if (onResetImages) {
      const resetImages = () => {
        setLocalImages([]);
        setSharedUploadedImages([]);
        setIsImagesUploaded(false);
        clearSharedImages();
      };

      // Store the reset function for parent to call
      // This is a bit of a hack, but we need to expose the reset function to parent
      (window as any).platformPreviewReset = resetImages;
    }
  }, [onResetImages]);

  // Format content with line breaks and truncate for preview
  const formatContent = (text: string, maxLength: number = 150) => {
    // First, convert newlines to <br> tags for HTML display
    const formattedText = text.replace(/\n/g, '<br />');

    if (formattedText.length <= maxLength) return formattedText;
    return formattedText.substring(0, maxLength).trim() + "...";
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent upload if images are already uploaded
    if (isImagesUploaded) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentCount = displayImages.length;
    const filesToProcess = Array.from(files).slice(0, maxImages - currentCount);

    if (filesToProcess.length === 0) {
      return; // Already at max capacity
    }

    const newImages: string[] = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        processedCount++;

        // When all files are processed, update the state
        if (processedCount === filesToProcess.length) {
          const updatedImages = [...displayImages, ...newImages];
          setLocalImages(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle replacing a specific image
  const handleReplaceImage = (index: number) => {
    // Prevent replace if images are already uploaded
    if (isImagesUploaded) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const updatedImages = [...displayImages];
        updatedImages[index] = result;
        setLocalImages(updatedImages);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Handle reset all images
  const handleResetImages = async () => {
    // Add confirmation dialog to prevent accidental clearing
    const confirmClear = window.confirm(
      'Are you sure you want to clear all images? This will permanently delete uploaded images from the server.'
    );

    if (!confirmClear) return;

    setIsClearingImages(true);

    // If images are uploaded, delete them from Cloudinary first
    if (isImagesUploaded && sharedUploadedImages.length > 0) {
      try {
        const publicIds = sharedUploadedImages.map(img => img.public_id);
        await axios.post('/api/delete-images', { publicIds });
        // Show success toast for deletion
        toast.success('Images deleted from Cloudinary');
      } catch (error) {
        console.error('Failed to delete images from Cloudinary:', error);
        toast.error('Failed to delete images from Cloudinary');
        // Still proceed with clearing local state
      }
    }

    // Clear local state
    setLocalImages([]);
    setSharedUploadedImages([]);
    setIsImagesUploaded(false);
    clearSharedImages();
    setIsClearingImages(false);
  };

  // Handle confirm upload for all platforms
  const handleConfirmUpload = async () => {
    if (displayImages.length === 0 || isImagesUploaded) return;

    setIsUploading(true);
    try {
      const response = await axios.post('/api/upload-images', { images: displayImages });

      const data = response.data;
      const imageData = data.images.map((result: any) => ({
        url: result.url,
        public_id: result.public_id,
      }));

      saveSharedImages(imageData);
      setSharedUploadedImages(imageData);
      setIsImagesUploaded(true);

      // Clear local images since we now have uploaded ones
      setLocalImages([]);

      // Show success toast
      toast.success(`Successfully uploaded ${imageData.length} image${imageData.length > 1 ? 's' : ''} to Cloudinary!`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle click on image placeholder
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Get aspect ratio for platform
  const getAspectRatio = () => {
    switch (platform) {
      case 'instagram':
        return 'aspect-square'; // 1:1
      case 'facebook':
        return 'aspect-[16/11]'; // 16:9
      case 'twitter':
        return 'aspect-video'; // 16:9
      case 'linkedin':
        return 'aspect-video'; // 16:9
      default:
        return 'aspect-square';
    }
  };

  // Get current images to display
  const displayImages = isImagesUploaded
    ? sharedUploadedImages.map(img => img.url)
    : localImages.length > 0
      ? localImages
      : [];
  const maxImages = 4; // Maximum 4 images allowed
  const maxDisplayImages = 4; // Show all 4 images in grid

  // Get grid layout based on number of images
  const getGridLayout = (imageCount: number) => {
    if (imageCount === 1) return 'grid-cols-1';
    if (imageCount === 2) return 'grid-cols-2';
    if (imageCount === 3) return 'grid-cols-2 grid-rows-2';
    if (imageCount >= 4) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-1';
  };

  // Get individual image classes for positioning
  const getImageClasses = (index: number, total: number) => {
    if (total === 1) return 'col-span-1 row-span-1';
    if (total === 2) return 'col-span-1 row-span-1';
    if (total === 3) {
      if (index === 0) return 'col-span-2 row-span-1';
      return 'col-span-1 row-span-1';
    }
    if (total === 4) return 'col-span-1 row-span-1';
    return 'col-span-1 row-span-1';
  };
  const renderInstagramPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{pageName || "your_brand"}</p>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">Sponsored · 📍 New York</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors outline-none focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {displayImages.length > 0 && (
              <DropdownMenuItem
                onClick={isImagesUploaded ? undefined : handleConfirmUpload}
                disabled={isUploading}
                className={isImagesUploaded ? 'text-green-600 focus:text-green-600' : ''}
              >
                <Check className={`w-4 h-4 mr-2 ${isImagesUploaded ? 'text-green-600' : ''}`} />
                {isUploading ? 'Uploading...' : isImagesUploaded ? 'Uploaded' : 'Confirm Upload'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleResetImages}
              disabled={isClearingImages}
              className="text-red-600 focus:text-red-600"
            >
              {isClearingImages ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              {isClearingImages ? 'Clearing...' : 'Clear Images'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Section */}
      <div className={`relative ${getAspectRatio()} bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
        {displayImages.length > 0 ? (
          <div className={`grid ${getGridLayout(displayImages.length)} gap-1 h-full`}>
            {displayImages.slice(0, maxDisplayImages).map((image: string, index: number) => (
              <div
                key={index}
                className={`relative ${getImageClasses(index, Math.min(displayImages.length, maxDisplayImages))} overflow-hidden cursor-pointer group`}
                onClick={() => handleReplaceImage(index)}
              >
                <img
                  src={image}
                  alt={`Uploaded content ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay for change/upload - only show if not uploaded */}
                {!isImagesUploaded ? (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                      <p className="text-white text-xs font-medium">Change</p>
                    </div>
                  </div>
                ) : null}

              </div>
            ))}
          </div>
        ) : (
          <div
            className={`h-full ${isImagesUploaded ? 'cursor-not-allowed' : 'cursor-pointer'} group`}
            onClick={isImagesUploaded ? undefined : handleImageClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
                <p className="text-white text-sm font-medium">Your images</p>
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">Click to upload images (max 4)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors cursor-pointer" />
            <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors cursor-pointer" />
            <Share className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors cursor-pointer" />
          </div>
          <div className="text-gray-700 dark:text-gray-300 cursor-pointer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-900 dark:text-white">
            <span className="font-semibold">{pageName || "your_brand"}</span>{" "}
            <span className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: formatContent(content) }}></span>
          </p>
        </div>

        {hashtags.length > 0 && (
          <p className="text-sm text-blue-500 mb-2">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}

        <div className="text-xs text-gray-500 mt-2">
          <span className="font-medium">2,847 likes</span>
          <span className="mx-1">·</span>
          <span>View all 127 comments</span>
        </div>
      </div>
    </div>
  );

  const renderTwitterPreview = () => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 dark:text-white text-sm">{pageName || "Your Brand"}</span>
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
            </svg>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors outline-none focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="text-gray-400">
              <span className="text-sm">Image upload not available for Twitter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tweet Content */}
      <div className="p-4">
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">{ownerName || pageName || "Your Brand"}</h3>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span className="text-gray-500 text-sm">@{pageName?.toLowerCase().replace(/\s+/g, '') || 'yourbrand'}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">2h</span>
            </div>

            <div className="text-gray-900 dark:text-white text-base leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: formatContent(content) }}>
            </div>

            {hashtags.length > 0 && (
              <p className="text-blue-500 text-sm mb-3">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            )}



            {/* Engagement Stats */}
            <div className="flex items-center justify-between max-w-md pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">247</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-green-500 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48 0 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46L19.5 20.12 15.068 16l1.364-1.46L18.5 16V8c0-1.1-.896-2-2-2z" />
                </svg>
                <span className="text-sm">1.2K</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-red-500 cursor-pointer transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">3.4K</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.807 0 6.874 3.067 6.874 6.874 0 3.807-3.067 6.874-6.874 6.874-3.807 0-6.874-3.067-6.874-6.874C5.126 5.23 8.193 2.163 12 2.163zm0 10.73c2.596 0 4.707-2.111 4.707-4.707S14.596 3.48 12 3.48 7.293 5.591 7.293 8.187s2.111 4.707 4.707 4.707zm0-6.854c1.384 0 2.506 1.122 2.506 2.506S13.384 10.1 12 10.1s-2.506-1.122-2.506-2.506S10.616 6.34 12 6.34z" />
                </svg>
                <span className="text-sm">892</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z" />
                  <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">{ownerName || "Your Professional Brand"}</h3>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-blue-600 font-medium text-sm">1st</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">CEO at {pageName || "Your Company"}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">2h</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <Globe className="w-3 h-3 rounded-full" />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors outline-none focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="text-gray-400">
              <span className="text-sm">Image upload not available for LinkedIn</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="text-gray-900 dark:text-white text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatContent(content) }}>
        </div>

        {hashtags.length > 0 && (
          <div className="mb-4">
            <p className="text-blue-600 text-sm font-medium">
              {hashtags.map(tag => `#${tag}`).join(' ')}
            </p>
          </div>
        )}


      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Engagement Section */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">1,247 likes · 89 comments</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-medium">Like</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span className="text-sm font-medium">Repost</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto rounded-lg overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{pageName || "Your Brand Page"}</h3>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">2h</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <Globe className="w-3 h-3 rounded-full" />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors outline-none focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {displayImages.length > 0 && (
              <DropdownMenuItem
                onClick={isImagesUploaded ? undefined : handleConfirmUpload}
                disabled={isUploading}
                className={isImagesUploaded ? 'text-green-600 focus:text-green-600' : ''}
              >
                <Check className={`w-4 h-4 mr-2 ${isImagesUploaded ? 'text-green-600' : ''}`} />
                {isUploading ? 'Uploading...' : isImagesUploaded ? 'Uploaded' : 'Confirm Upload'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleResetImages}
              disabled={isClearingImages}
              className="text-red-600 focus:text-red-600"
            >
              {isClearingImages ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              {isClearingImages ? 'Clearing...' : 'Clear Images'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="text-gray-900 dark:text-white text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatContent(content) }}>
        </div>

        {hashtags.length > 0 && (
          <p className="text-blue-600 text-sm mb-4">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}

        {/* Image Section */}
        <div className={`relative ${getAspectRatio()} bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4 rounded-lg`}>
          {displayImages.length > 0 ? (
            <div className={`grid ${getGridLayout(displayImages.length)} gap-1 h-full`}>
              {displayImages.slice(0, maxDisplayImages).map((image: string, index: number) => (
                <div
                  key={index}
                  className={`relative ${getImageClasses(index, Math.min(displayImages.length, maxDisplayImages))} overflow-hidden cursor-pointer group`}
                  onClick={() => handleReplaceImage(index)}
                >
                  <img
                    src={image}
                    alt={`Uploaded content ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay for change/upload - only show if not uploaded */}
                  {!isImagesUploaded ? (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-medium">Change</p>
                      </div>
                    </div>
                  ) : null}

                </div>
              ))}
            </div>
          ) : (
            <div className="h-full cursor-pointer group" onClick={handleImageClick}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
                  <p className="text-white text-sm font-medium">Your images</p>
                  <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">Click to upload images (max 4)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Engagement Stats */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <ThumbsUp color={"white"} size={12} />
              </div>
              <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <span>2.8K</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>127 comments</span>
            <span>45 shares</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors flex-1 justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-medium">Loved</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors flex-1 justify-center">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors flex-1 justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (platform) {
      case "instagram":
        return renderInstagramPreview();
      case "twitter":
        return renderTwitterPreview();
      case "linkedin":
        return renderLinkedInPreview();
      case "facebook":
        return renderFacebookPreview();
      default:
        return renderInstagramPreview();
    }
  };

  return (
    <div className="flex justify-center">
      {renderPreview()}
    </div>
  );
};

export default PlatformPreview;

import { useState, useCallback, useEffect } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (imageData: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ImageUpload = ({ onImageUpload, disabled, maxImages = 3 }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleFiles = useCallback((files: FileList) => {
    const filesArray = Array.from(files);

    // Check if adding these files would exceed the max limit
    if (uploadedImages.length + filesArray.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    // Process each file
    const newImages: string[] = [];
    let processedCount = 0;

    filesArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload image files only');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        processedCount++;

        // When all files are processed, update the state
        if (processedCount === filesArray.length) {
          setUploadedImages(prev => [...prev, ...newImages]);
          toast.success(`${filesArray.length} image${filesArray.length > 1 ? 's' : ''} uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [uploadedImages.length, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !disabled) {
      handleFiles(e.target.files);
    }
  }, [handleFiles, disabled]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setUploadedImages([]);
  };

  // Call the callback whenever uploadedImages changes
  useEffect(() => {
    onImageUpload(uploadedImages);
  }, [uploadedImages, onImageUpload]);

  return (
    <div className="w-full">
      {uploadedImages.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          {uploadedImages.length > 1 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllImages}
                disabled={disabled}
              >
                Clear All Images
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 min-h-[200px] text-center cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
            disabled={disabled}
          />

          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              {dragActive ? (
                <Upload className="w-5 h-5 text-primary" />
              ) : (
                <Image className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {dragActive ? 'Drop your images here' : `Upload up to ${maxImages} images to edit`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to select • Max 10MB each • PNG, JPG, WEBP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

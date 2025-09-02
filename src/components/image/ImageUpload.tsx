import { useState, useCallback } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ onImageUpload, disabled }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
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
      setUploadedImage(result);
      onImageUpload(result);
      toast.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

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

  const clearImage = () => {
    setUploadedImage(null);
    onImageUpload('');
  };

  return (
    <div className="w-full">
      {uploadedImage ? (
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded image" 
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
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
                {dragActive ? 'Drop your image here' : 'Upload an image to edit'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to select • Max 10MB • PNG, JPG, WEBP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
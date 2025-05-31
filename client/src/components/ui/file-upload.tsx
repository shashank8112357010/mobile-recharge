import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

export default function FileUpload({
  onFilesUploaded,
  maxFiles = 6,
  acceptedTypes = ["image/*"],
  maxFileSize = 5
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file type
      const isValidType = acceptedTypes.some(type => 
        type === "*/*" || file.type.match(type.replace("*", ".*"))
      );
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `File ${file.name} is not a supported format.`,
          variant: "destructive",
        });
        return;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `File ${file.name} exceeds ${maxFileSize}MB limit.`,
          variant: "destructive",
        });
        return;
      }

      // Check total files limit
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${maxFiles} files.`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === validFiles.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      // Simulate file upload - In a real app, upload to your storage service
      setIsUploading(true);
      setTimeout(() => {
        const mockUrls = validFiles.map((file, index) => 
          `https://picsum.photos/400/300?random=${Date.now() + index}`
        );
        
        setIsUploading(false);
        onFilesUploaded([...previews, ...mockUrls]);
        
        toast({
          title: "Files uploaded successfully",
          description: `${validFiles.length} file(s) have been uploaded.`,
        });
      }, 2000);
    }
  }, [uploadedFiles, acceptedTypes, maxFileSize, maxFiles, previews, onFilesUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Update the parent component
    const newPreviews = previews.filter((_, i) => i !== index);
    onFilesUploaded(newPreviews);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
            <p className="text-sm text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, up to {maxFileSize}MB each
            </p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </div>
          ))}
          
          {/* Add More Button */}
          {previews.length < maxFiles && (
            <button
              type="button"
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              onClick={triggerFileSelect}
            >
              <i className="fas fa-plus text-xl mb-1"></i>
              <span className="text-xs">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Upload Button for Empty State */}
      {previews.length === 0 && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={triggerFileSelect}
          disabled={isUploading}
        >
          <i className="fas fa-camera mr-2"></i>
          Select Photos
        </Button>
      )}
    </div>
  );
}

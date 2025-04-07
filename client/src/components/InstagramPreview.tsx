import React, { useRef, useState, useEffect } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, FileUp, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { processImageUrl } from '@/lib/imageUtils';

const InstagramPreview: React.FC = () => {
  const { state, dispatch } = useArticleContext();
  const { article, selectedTemplate, templates } = state;
  const previewRef = useRef<HTMLDivElement>(null);
  const [customOverlay, setCustomOverlay] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateChange = () => {
    const currentIndex = templates.findIndex(t => t.id === selectedTemplate.id);
    const nextIndex = (currentIndex + 1) % templates.length;
    dispatch({
      type: 'SET_SELECTED_TEMPLATE',
      payload: templates[nextIndex]
    });
  };

  const downloadPost = async () => {
    if (!previewRef.current) return;
    
    try {
      // Setting the width and height explicitly to capture the entire content
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,  // To handle cross-origin images
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = image;
      link.download = `instagram-post-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleCustomOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomOverlay(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Process image URL to handle potential CORS issues
  const processedArticleImage = article.imageUrl ? processImageUrl(article.imageUrl) : null;
  
  // Use article image if available, otherwise use template image
  const backgroundImage = processedArticleImage || selectedTemplate.imageUrl;
  const hasArticleImage = !!processedArticleImage;
  
  // Handle image loading error
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    // Reset image error when the article changes
    setImageError(false);
  }, [article.imageUrl]);
  
  const actualBackgroundImage = (imageError && hasArticleImage) 
    ? selectedTemplate.imageUrl // Fallback to template if article image fails
    : backgroundImage;
  
  // Determine which overlay to use: custom uploaded one or the template's overlay
  const overlayImage = customOverlay || selectedTemplate.overlayUrl;

  return (
    <Card className="bg-white sticky top-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Instagram Preview</h2>
        
        <div 
          ref={previewRef}
          className="instagram-template bg-gray-200 mx-auto max-w-sm relative"
        >
          {/* Background image */}
          {actualBackgroundImage ? (
            <div className="w-full h-full relative bg-gray-200 overflow-hidden">
              <img 
                src={actualBackgroundImage} 
                className="w-full h-full object-cover absolute inset-0" 
                alt={hasArticleImage && !imageError ? "Article image" : "Template background"}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                onError={() => {
                  console.log('Image failed to load:', actualBackgroundImage);
                  setImageError(true);
                }}
              />
              {/* Backup div if image fails to load but error doesn't trigger */}
              <div className={`w-full h-full flex items-center justify-center absolute inset-0 ${imageError ? 'opacity-100' : 'opacity-0'}`}>
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay with semi-transparent gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
          
          {/* Template overlay image (PNG with transparency) */}
          {overlayImage && (
            <img 
              src={overlayImage}
              className="template-overlay"
              alt="Template overlay"
              crossOrigin="anonymous"
            />
          )}
          
          {/* Dynamic text overlay */}
          <div className="template-text template-title">
            <h3 className="font-roboto font-bold text-white text-xl shadow-text">
              {article.title || "Your Article Title"}
            </h3>
          </div>
          
          <div className="template-text template-author">
            <p className="font-sans text-white text-sm">
              {article.author || "Author Name"}
            </p>
          </div>
          
          <div className="template-text template-source">
            <p className="font-sans text-white text-xs">
              {article.source || "Source Name"}
            </p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={downloadPost}
              className="w-full"
              disabled={!article.title}
            >
              <Download className="mr-2 h-5 w-5" />
              Download Post
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="w-full"
            >
              <FileUp className="mr-2 h-5 w-5" />
              Upload Overlay
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="sr-only"
              onChange={handleCustomOverlayUpload}
            />
          </div>
          
          {/* Template button removed as requested */}
          
          {customOverlay && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setCustomOverlay(null)}
              className="w-full"
            >
              Remove Custom Overlay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramPreview;

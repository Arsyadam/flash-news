import React, { useRef } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Image } from 'lucide-react';
import html2canvas from 'html2canvas';

const InstagramPreview: React.FC = () => {
  const { state, dispatch } = useArticleContext();
  const { article, selectedTemplate, templates } = state;
  const previewRef = useRef<HTMLDivElement>(null);

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
      const canvas = await html2canvas(previewRef.current);
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

  // Use article image if available, otherwise use template image
  const backgroundImage = article.imageUrl || selectedTemplate.imageUrl;
  const hasArticleImage = !!article.imageUrl;

  return (
    <Card className="bg-white sticky top-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Instagram Preview</h2>
        
        <div 
          ref={previewRef}
          className="instagram-template bg-gray-200 mx-auto max-w-sm"
        >
          {backgroundImage ? (
            <img 
              src={backgroundImage} 
              className="w-full h-full object-cover" 
              alt={hasArticleImage ? "Article image" : "Template background"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <Image className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay with semi-transparent gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
          
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
          <Button
            type="button"
            onClick={downloadPost}
            className="w-full"
            disabled={!article.title}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Instagram Post
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleTemplateChange}
            className="w-full"
            disabled={hasArticleImage}
            title={hasArticleImage ? "Using article image - template switching disabled" : "Try a different template"}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            {hasArticleImage ? "Using Article Image" : "Try Different Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramPreview;

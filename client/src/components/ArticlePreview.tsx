import React, { useRef, useState } from 'react';
import { useArticleExtractor } from '../hooks/useArticleExtractor';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

const ArticlePreview: React.FC = () => {
  const { article, updateArticleField } = useArticleExtractor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateArticleField('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Article Preview</h2>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></span>
            Extracted
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="article-title">Title</Label>
            <div className="flex mt-1 gap-2">
              <div className="flex-grow">
                <Input 
                  id="article-title"
                  value={article.title}
                  onChange={(e) => updateArticleField('title', e.target.value)}
                  placeholder="Article title"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={generateHookTitle}
                disabled={!article.title}
              >
                🔁 Generate Hook Title
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="article-author">Author</Label>
            <Input 
              id="article-author"
              value={article.author}
              onChange={(e) => updateArticleField('author', e.target.value)}
              placeholder="Article author"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="article-source">Source</Label>
            <Input 
              id="article-source"
              value={article.source}
              onChange={(e) => updateArticleField('source', e.target.value)}
              placeholder="Article source"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="block">Featured Image</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {article.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={article.imageUrl.startsWith('data:') ? article.imageUrl : getProxiedImageUrl(article.imageUrl)} 
                      alt="Featured article" 
                      className="mx-auto h-48 object-cover rounded-md"
                      crossOrigin="anonymous"
                    />
                    <Button 
                      type="button" 
                      onClick={triggerFileInput}
                      size="icon"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">
                      No image extracted
                    </p>
                  </div>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>{article.imageUrl ? 'Upload a different image' : 'Upload an image'}</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticlePreview;
import React, { useState } from 'react';
import { useArticleExtractor } from '../hooks/useArticleExtractor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, InfoIcon } from 'lucide-react';

const InputSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const { extractArticle, isSubmitting } = useArticleExtractor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extractArticle(url);
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Enter News Article URL</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="news-url">News URL</Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="url"
                id="news-url"
                placeholder="https://www.example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="submit" 
                className="ml-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Extract Content
                    <Zap className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Enter URLs from sources like Kompas, WSJ, Medium, etc.</p>
          </div>
          
          <div className="bg-blue-50 rounded-md p-4 flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                The application will automatically extract the article title, author, source, and featured image.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputSection;

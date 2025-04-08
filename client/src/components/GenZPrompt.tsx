import React, { useState } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const GenZPrompt: React.FC = () => {
  const { state } = useArticleContext();
  const { article } = state;
  const { toast } = useToast();
  const [genZCaption, setGenZCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const generateGenZCaption = async () => {
    if (!article.title) {
      toast({
        title: 'Tidak ada artikel',
        description: 'Silakan ekstrak artikel terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(
        'POST',
        '/api/ai/generate-description',
        {
          title: article.title,
          author: article.author,
          source: article.source,
          content: article.content,
          genZStyle: true,
        }
      );

      const data = await response.json();
      setGenZCaption(data.content);
    } catch (error) {
      console.error('Error generating Gen-Z caption:', error);
      toast({
        title: 'Gagal membuat caption',
        description: 'Terjadi kesalahan saat membuat caption gaya Gen-Z',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!genZCaption) return;
    
    navigator.clipboard.writeText(genZCaption);
    setIsCopied(true);
    
    toast({
      title: 'Disalin!',
      description: 'Caption telah disalin ke clipboard',
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Caption Gen-Z</h2>
          <div className="flex space-x-1 items-center text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded-full">
            <Lightbulb className="h-3 w-3" />
            <span>Fitur Baru</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Ubah judul artikel menjadi caption Instagram bergaya Gen-Z yang menarik perhatian dan membuat penasaran.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={generateGenZCaption}
            disabled={isLoading || !article.title}
            className="w-full"
            variant="default"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sedang Membuat...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Buat Caption Gen-Z
              </>
            )}
          </Button>
          
          {genZCaption && (
            <div className="mt-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 relative">
                <div className="whitespace-pre-line text-sm">{genZCaption}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyToClipboard}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Klik di pojok kanan atas untuk menyalin caption
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenZPrompt;
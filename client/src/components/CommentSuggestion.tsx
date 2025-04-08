import React, { useState } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const CommentSuggestion: React.FC = () => {
  const { state } = useArticleContext();
  const { article } = state;
  const { toast } = useToast();
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const generateComment = async () => {
    if (!article.title || !article.content) {
      toast({
        title: 'Artikel tidak lengkap',
        description: 'Konten artikel diperlukan untuk membuat rekomendasi komentar',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(
        'POST',
        '/api/ai/generate-comment',
        {
          title: article.title,
          content: article.content,
        }
      );

      const data = await response.json();
      setComment(data.content);
      setIsVisible(true);
    } catch (error) {
      console.error('Error generating comment:', error);
      toast({
        title: 'Gagal membuat komentar',
        description: 'Terjadi kesalahan saat membuat rekomendasi komentar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!comment) return;
    
    navigator.clipboard.writeText(comment);
    setIsCopied(true);
    
    toast({
      title: 'Disalin!',
      description: 'Komentar telah disalin ke clipboard',
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card className="bg-white border-dashed border-gray-300">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-gray-500" />
            Rekomendasi Komentar Kritis
          </h2>
          <div className="flex space-x-1 items-center text-purple-600 text-xs bg-purple-100 px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" />
            <span>Fitur Tersembunyi</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Dapatkan saran komentar kritis yang dapat memicu diskusi menarik di kolom komentar artikel Anda.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={generateComment}
            disabled={isLoading || !article.content}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Menyusun Komentar...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Buat Rekomendasi Komentar
              </>
            )}
          </Button>
          
          {comment && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">Rekomendasi Komentar:</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 w-8"
                  onClick={toggleVisibility}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {isVisible ? (
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 relative">
                  <div className="whitespace-pre-line text-sm">{comment}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyToClipboard}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center text-sm text-gray-400">
                  Klik ikon mata untuk melihat rekomendasi komentar
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSuggestion;
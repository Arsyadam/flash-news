import React, { useState, useEffect } from 'react';
import { useArticleContext } from '@/contexts/ArticleContext';
import { useNewsComment } from '@/hooks/useNewsComment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Copy, 
  RefreshCw,
  RotateCw,
  ThumbsUp,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsCommentSection: React.FC = () => {
  const { state } = useArticleContext();
  const { getPresetComments, generateRandomComment } = useNewsComment();
  const { toast } = useToast();
  
  // We'll use this state to track our generated comments
  const [generatedComments, setGeneratedComments] = useState<{id: string, text: string}[]>([]);
  
  // When the article title changes, generate new comments
  useEffect(() => {
    if (state.article.title) {
      regenerateAllComments();
    }
  }, [state.article.title]);
  
  // Function to regenerate all comments
  const regenerateAllComments = () => {
    if (!state.article.title) return;
    
    // Get preset comments
    const presets = getPresetComments(state.article.title);
    
    // Generate some random ones too
    const randomComments = Array(5).fill(0).map(() => 
      generateRandomComment(state.article.title)
    );
    
    // Combine and shuffle them
    const allComments = [...presets, ...randomComments]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8); // Keep only 8 comments
    
    // Set as generated comments with unique IDs
    setGeneratedComments(
      allComments.map(text => ({
        id: Math.random().toString(36).substring(2, 9),
        text
      }))
    );
  };
  
  // Function to regenerate a single comment
  const regenerateSingleComment = (id: string) => {
    const newComment = generateRandomComment(state.article.title);
    
    setGeneratedComments(prev => 
      prev.map(comment => 
        comment.id === id 
          ? { ...comment, text: newComment } 
          : comment
      )
    );
    
    toast({
      title: "✨ Komentar Baru!",
      description: "Komentar baru dibuat buat kamu",
      duration: 1500
    });
  };
  
  // Function to copy a comment to clipboard
  const copyComment = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Tersalin!",
      description: "Komentar sudah disalin ke clipboard",
      duration: 1500
    });
  };
  
  if (!state.article.title) {
    return null; // Don't show anything if no article is loaded
  }
  
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold">Kritik Berita</h2>
        </div>
        
        <Button
          onClick={regenerateAllComments}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RotateCw className="w-4 h-4" />
          <span>Refresh Semua</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {generatedComments.map((comment) => (
          <Card key={comment.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="px-2 py-0 text-xs font-normal bg-blue-50">
                <Zap className="w-3 h-3 mr-1" />
                kritik kritis
              </Badge>
              <div className="flex space-x-1">
                <Button
                  onClick={() => regenerateSingleComment(comment.id)}
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                </Button>
                <Button
                  onClick={() => copyComment(comment.text)}
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed">{comment.text}</p>
            
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 h-6"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                <span>mantap!</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {generatedComments.length === 0 && state.article.title && (
        <Card className="p-4 text-center">
          <Button onClick={regenerateAllComments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Generate Komentar Kritis</span>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default NewsCommentSection;
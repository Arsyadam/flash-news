import React, { useState, useEffect } from 'react';
import { useArticleContext } from '@/contexts/ArticleContext';
import { useNewsComment } from '@/hooks/useNewsComment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Copy, 
  RefreshCw,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Scale,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define types for our comment with category
type CommentWithCategory = {
  id: string;
  text: string;
  category: 'positive' | 'neutral' | 'negative' | 'critical';
};

const NewsCommentSection: React.FC = () => {
  const { state } = useArticleContext();
  const { generateCommentsByCategory } = useNewsComment();
  const { toast } = useToast();
  
  // Keep track of generated comments with categories
  const [generatedComments, setGeneratedComments] = useState<CommentWithCategory[]>([]);
  
  // Set up active tab
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // When the article title changes, generate new comments
  useEffect(() => {
    if (state.article.title) {
      regenerateAllComments();
    }
  }, [state.article.title]);
  
  // Function to regenerate all comments
  const regenerateAllComments = () => {
    if (!state.article.title) return;
    
    // Generate comments in different categories
    const newComments = generateCommentsByCategory(
      state.article.title, 
      state.article.content
    );
    
    setGeneratedComments(newComments);
  };
  
  // Function to regenerate a single comment
  const regenerateSingleComment = (id: string) => {
    // Find the comment to regenerate
    const commentToRegenerate = generatedComments.find(c => c.id === id);
    
    if (!commentToRegenerate) return;
    
    // Generate a new comment in the same category
    const newComment = {
      id,
      text: generateCommentsByCategory(state.article.title, state.article.content)
        .find(c => c.category === commentToRegenerate.category)?.text || '',
      category: commentToRegenerate.category
    };
    
    // Update comments
    setGeneratedComments(prev => 
      prev.map(comment => comment.id === id ? newComment : comment)
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
  
  // Get comments filtered by active category
  const getFilteredComments = () => {
    if (activeCategory === 'all') {
      return generatedComments;
    }
    
    return generatedComments.filter(
      comment => comment.category === activeCategory
    );
  };
  
  // Category label and icon mapping
  const categoryInfo = {
    positive: { 
      label: 'positif', 
      icon: <ThumbsUp className="w-3 h-3 mr-1" />,
      bgColor: 'bg-green-50'
    },
    neutral: { 
      label: 'netral', 
      icon: <Scale className="w-3 h-3 mr-1" />,
      bgColor: 'bg-gray-50'
    },
    negative: { 
      label: 'negatif', 
      icon: <ThumbsDown className="w-3 h-3 mr-1" />,
      bgColor: 'bg-red-50'
    },
    critical: { 
      label: 'kritis', 
      icon: <HelpCircle className="w-3 h-3 mr-1" />,
      bgColor: 'bg-blue-50'
    }
  };
  
  if (!state.article.title) {
    return null; // Don't show anything if no article is loaded
  }
  
  const filteredComments = getFilteredComments();
  
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold">Ide Komentar</h2>
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
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="positive">Positif</TabsTrigger>
          <TabsTrigger value="neutral">Netral</TabsTrigger>
          <TabsTrigger value="negative">Negatif</TabsTrigger>
          <TabsTrigger value="critical">Kritis</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-0">
          <div className="grid grid-cols-1 gap-3">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <Badge 
                    variant="outline" 
                    className={`px-2 py-0 text-xs font-normal ${categoryInfo[comment.category].bgColor}`}
                  >
                    {categoryInfo[comment.category].icon}
                    {categoryInfo[comment.category].label}
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
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {generatedComments.length === 0 && state.article.title && (
        <Card className="p-4 text-center">
          <Button onClick={regenerateAllComments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Generate Komentar</span>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default NewsCommentSection;
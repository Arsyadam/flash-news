import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Comment, CommentAnalysis } from '@shared/schema';

export function useNewsComment() {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<CommentAnalysis | null>(null);
  const [commentValue, setCommentValue] = useState<string>('');
  const [commentName, setCommentName] = useState<string>('');
  const [comments, setComments] = useState<(Comment & { 
    id: string;
    analysis?: CommentAnalysis;
    timestamp: Date;
  })[]>([]);
  
  const { toast } = useToast();
  
  const analyzeComment = async (
    comment: string, 
    articleTitle: string, 
    articleContent?: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/analyze-comment', {
        comment,
        articleTitle,
        articleContent
      });
      
      const analysisResult: CommentAnalysis = await response.json();
      setAnalysis(analysisResult);
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze comment',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const submitComment = async (
    comment: string,
    name: string | undefined,
    articleTitle: string,
    articleContent?: string
  ) => {
    if (!comment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    // Create new comment object with timestamp
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      name: name ? name.trim() : 'Anonymous',
      timestamp: new Date(),
    };
    
    // Add comment to list
    setComments((prev) => [newComment, ...prev]);
    
    // Reset comment input
    setCommentValue('');
    
    // Analyze comment
    const analysisResult = await analyzeComment(comment, articleTitle, articleContent);
    
    // If analysis shows we should respond, update the comment with analysis
    if (analysisResult && analysisResult.shouldRespond) {
      setComments((prev) => 
        prev.map((c) => 
          c.id === newComment.id 
            ? { ...c, analysis: analysisResult } 
            : c
        )
      );
    }
  };
  
  const getPresetComments = (articleTitle: string): string[] => {
    // Generate preset example comments containing critical thinking elements
    return [
      `Tapi menurutku, ${articleTitle} ini terlalu fokus pada aspek teknisnya saja tanpa membahas dampak sosialnya.`,
      `Bagaimana jika teknologi ini justru bikin ketergantungan? ${articleTitle} nggak bahas itu sama sekali.`,
      `Kenapa gak ada pembahasan tentang keamanan data di ${articleTitle}? Padahal itu penting banget.`,
      `Masalahnya itu implementasi dari teknologi di ${articleTitle} butuh infrastruktur yang mahal. Solusinya apa dong?`,
      `Sebenarnya ${articleTitle} ini bisa jadi terobosan keren, tapi apakah sudah memikirkan akses untuk semua kalangan?`
    ];
  };
  
  return {
    commentValue,
    setCommentValue,
    commentName,
    setCommentName,
    comments,
    submitComment,
    analyzeComment,
    getPresetComments,
    isAnalyzing,
    analysis
  };
}
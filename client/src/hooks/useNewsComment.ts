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
    // Generate varied preset example comments with more casual tone and emojis
    const titleShort = articleTitle.length > 30 
      ? articleTitle.substring(0, 30) + '...' 
      : articleTitle;
    
    // Create variations with different styles
    return [
      `tapi menurutku, ${titleShort} ini terlalu fokus ke teknis doang tanpa bahas dampak sosialnya 🤔 gmn menurut lo?`,
      `hmmm... gimana kalo teknologi di ${titleShort} malah bikin ketergantungan? beritanya ga bahas sisi ini sama sekali 😕`,
      `kenapa sih ga ada pembahasan soal keamanan data di ${titleShort}?? padahal itu penting BGT tau!! 🔒`,
      `masalahnya tuh implementasi dari teknologi di ${titleShort} butuh infrastruktur mahal. solusinya apa dong? 💸`,
      `sebenernya ${titleShort} ini bisa jadi terobosan keren, tp apa udah mikirin akses buat semua kalangan? 🤷‍♀️`,
      `menurut gw nih ya, ${titleShort} ini kurang mendalam analisisnya. ada yg setuju? 👀`,
      `wah ${titleShort} bener2 bikin gw mikir... tp kok ya masih ada gap implementasinya ya? 🧐`,
      `lo yakin ${titleShort} bakal sukses? aku ragu sih soalnya blm ada bukti konkretnya 😬`,
      `kok rasanya ${titleShort} ini cuma ikut2an tren doang ya? inovasinya dimana coba? 🙄`,
      `tapi kalo dipikir2 lagi, ${titleShort} ini bisa berdampak negatif ke pekerjaan orang ga sih? 💭`
    ];
  };
  
  // Function to generate a new random comment
  const generateRandomComment = (articleTitle: string): string => {
    // More casual phrases with emoji and less formal capitalization
    const starters = [
      "menurut gw sih", "hmm sebenernya", "gue rasa", "kalo dipikir2", 
      "tapi aneh ga sih", "kok kayaknya", "aku tuh heran", "ga ngerti deh", 
      "jujur aja nih", "coba deh pikirin"
    ];
    
    const critiques = [
      "beritanya kurang mendalam 🤔", 
      "datanya ga lengkap gitu 📊", 
      "perspektifnya satu sisi banget 👁️",
      "kurang ngebahas dampaknya ke masyarakat 🏙️",
      "terlalu teknis tanpa solusi praktis 🛠️",
      "kayak iklan terselubung deh 🎯",
      "kurang bukti pendukung yang kuat 🔍",
      "ga mempertimbangkan sisi ekonominya 💰",
      "lupa bahas etika dan privasi 🔒",
      "terlalu optimis tanpa lihat risikonya 📉"
    ];
    
    const questions = [
      "menurut lo gimana?", 
      "ada yg setuju?", 
      "apa cuma gw yg mikir gini?",
      "bener ga sih pemikiran gw?",
      "kira2 solusinya apa ya?",
      "apa dampaknya ke kita?",
      "bakal sukses ga ya?",
      "worth it ga sih?",
      "emang segitu pentingnya?",
      "buang2 duit ga sih ini?"
    ];
    
    const starter = starters[Math.floor(Math.random() * starters.length)];
    const critique = critiques[Math.floor(Math.random() * critiques.length)];
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    return `${starter} ${articleTitle} ${critique}... ${question}`;
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
    generateRandomComment,
    isAnalyzing,
    analysis
  };
}
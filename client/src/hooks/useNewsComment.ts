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
  // Generate a random comment based on article content and a specific sentiment category
  const generateRandomComment = (
    articleTitle: string, 
    articleContent?: string, 
    category: 'positive' | 'neutral' | 'negative' | 'critical' = 'critical'
  ): string => {
    // Extract a few content fragments for more context-aware comments
    const contentSnippet = articleContent 
      ? articleContent.substring(0, 300)
      : articleTitle;
    
    // Arrays of phrases by category
    const positivePhrases = [
      "sebenernya gua suka banget sama", 
      "wah keren nih soal", 
      "gua setuju bgt sama", 
      "akhirnyaaa ada yg bahas", 
      "ini bagus sih tentang"
    ];
    
    const neutralPhrases = [
      "gua penasaran deh sama", 
      "hmm menarik juga tentang", 
      "belum bisa ambil kesimpulan soal", 
      "masih fifty-fifty nih tentang", 
      "perlu dikaji lebih lanjut soal"
    ];
    
    const negativePhrases = [
      "gua kurang sreg sih sama", 
      "kok agak aneh ya tentang", 
      "ga yakin deh soal", 
      "kayaknya kurang tepat deh", 
      "masih ada yg janggal dari"
    ];
    
    const criticalPhrases = [
      "tapi kalo dipikir2 lagi", 
      "sebenernya ada yg terlupakan di", 
      "nah ini nih yg jadi masalah di", 
      "coba deh pikirin lagi soal", 
      "tapi kita juga harus kritis sama"
    ];
    
    // Select phrase array based on category
    let phrases: string[];
    let emoji: string;
    let badgeText: string;
    
    switch(category) {
      case 'positive':
        phrases = positivePhrases;
        emoji = '👍';
        badgeText = 'positif';
        break;
      case 'neutral':
        phrases = neutralPhrases;
        emoji = '🤔';
        badgeText = 'netral';
        break;
      case 'negative':
        phrases = negativePhrases;
        emoji = '👎';
        badgeText = 'negatif';
        break;
      case 'critical':
      default:
        phrases = criticalPhrases;
        emoji = '🧐';
        badgeText = 'kritis';
        break;
    }
    
    // Keywords from content for more contextual comments
    const contentWords = contentSnippet.toLowerCase().split(/\s+/);
    const importantWords = contentWords
      .filter(word => word.length > 5)
      .filter(word => !['adalah', 'dengan', 'karena', 'tetapi', 'namun', 'seperti', 'bahwa'].includes(word));
    
    // Get some random keywords from content if available
    const keyword1 = importantWords.length > 0 
      ? importantWords[Math.floor(Math.random() * importantWords.length)] 
      : '';
    const keyword2 = importantWords.length > 1
      ? importantWords[Math.floor(Math.random() * importantWords.length)]
      : '';
    
    // Generate more contextual comments based on category
    if (category === 'positive') {
      const positiveComments = [
        `${phrases[Math.floor(Math.random() * phrases.length)]} ${keyword1}! ini bener2 informatif dan jelas ${emoji}`,
        `${emoji} yessss! berita kayak gini yg aku tunggu2. apalagi pas bahas ${keyword1} dan ${keyword2}`,
        `wah keren bgt infonya! gua baru tau soal ${keyword1}. udah lama nyari pembahasan begini ${emoji}`,
        `finally ada berita yg bahas ${keyword1} secara detail! thx infonya, jadi paham banget ${emoji}`,
        `ini sih konten berkualitas! sukaa banget sama bahasan tentang ${keyword1} nya ${emoji}`
      ];
      return positiveComments[Math.floor(Math.random() * positiveComments.length)];
    }
    
    if (category === 'neutral') {
      const neutralComments = [
        `${phrases[Math.floor(Math.random() * phrases.length)]} ${keyword1}. masih butuh lebih banyak data sih menurut gw ${emoji}`,
        `${emoji} hmm, soal ${keyword1} ini masih abu2 ya. ada yg punya info lebih ga?`,
        `gua sih 50:50 sama berita ini. yg bahas ${keyword1} ok, tp kurang dalem juga sih ${emoji}`,
        `mungkin perlu pembahasan lebih lanjut ya soal ${keyword1} ini. ada yg punya sumber lain? ${emoji}`,
        `baca berita ini bikin penasaran aja sih, terutama pas nyinggung ${keyword1}. ada yg tau lebih banyak? ${emoji}`
      ];
      return neutralComments[Math.floor(Math.random() * neutralComments.length)];
    }
    
    if (category === 'negative') {
      const negativeComments = [
        `${phrases[Math.floor(Math.random() * phrases.length)]} ${keyword1}. harusnya dijelasin lebih detail dong ${emoji}`,
        `${emoji} ga sreg bgt sm bahasannya. masa iya ${keyword1} cuma dibahas sekilas doang?`,
        `kok malah bikin bingung ya infonya? ${keyword1} nya ga jelas, ${keyword2} nya simpang siur ${emoji}`,
        `sebel deh sama berita model gini. ${keyword1} dibahas setengah2, trus kesimpulannya ngambang ${emoji}`,
        `beritanya kurang kredibel nih. sumbernya dari mana coba pas bahas ${keyword1}? ga detail banget ${emoji}`
      ];
      return negativeComments[Math.floor(Math.random() * negativeComments.length)];
    }
    
    if (category === 'critical') {
      const criticalComments = [
        `${phrases[Math.floor(Math.random() * phrases.length)]} ${keyword1}. sebenernya ada angle lain yg blm dibahas nih ${emoji}`,
        `${emoji} tp kita jg perlu ngomongin dampak etikanya dong, ga cuma fokus ke ${keyword1} aja`,
        `kalo dipikir2, bahasannya ttg ${keyword1} kurang mengaitkan dengan konteks sosial yg lebih luas ${emoji}`,
        `menarik sih, tp kok ga ada pembahasan ttg implikasi jangka panjang dari ${keyword1}? ini kan penting ${emoji}`,
        `ada yg mikir ga sih, ${keyword1} ini bisa berdampak negatif ke kelompok marjinal? kok ga dibahas ya? ${emoji}`
      ];
      return criticalComments[Math.floor(Math.random() * criticalComments.length)];
    }
    
    // Fallback if somehow we didn't match any category
    return `hmm... ada yg kepikiran ga gimana dampak ${keyword1} ke masyarakat luas? ${emoji}`;
  };
  
  // Generate comments in different categories
  const generateCommentsByCategory = (articleTitle: string, articleContent?: string) => {
    const categories: Array<'positive' | 'neutral' | 'negative' | 'critical'> = [
      'positive', 'neutral', 'negative', 'critical'
    ];
    
    // Generate 3 comments per category
    return categories.flatMap(category => 
      Array(2).fill(0).map(() => ({
        id: Math.random().toString(36).substring(2, 9),
        text: generateRandomComment(articleTitle, articleContent, category),
        category
      }))
    );
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
    generateCommentsByCategory,
    isAnalyzing,
    analysis
  };
}
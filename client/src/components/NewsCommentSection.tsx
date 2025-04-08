import React, { useState } from 'react';
import { useArticleContext } from '@/contexts/ArticleContext';
import { useNewsComment } from '@/hooks/useNewsComment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  HelpCircle,
  RefreshCw 
} from 'lucide-react';

const NewsCommentSection: React.FC = () => {
  const { state } = useArticleContext();
  const { 
    commentValue, 
    setCommentValue, 
    commentName, 
    setCommentName, 
    comments, 
    submitComment, 
    getPresetComments,
    isAnalyzing
  } = useNewsComment();
  
  const [showPresets, setShowPresets] = useState(false);
  
  const presetComments = getPresetComments(state.article.title);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComment(
      commentValue, 
      commentName, 
      state.article.title, 
      state.article.content
    );
  };
  
  const handlePresetClick = (preset: string) => {
    setCommentValue(preset);
    setShowPresets(false);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto mt-6 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-xl font-bold">Kritik Berita</h2>
      </div>
      
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              placeholder="Nama kamu (opsional)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="mb-2"
            />
            <div className="relative">
              <Textarea
                placeholder="Tulis komentar kritis tentang berita ini... Dimulai dengan 'Tapi menurutku...', 'Kenapa...', dll."
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute bottom-3 right-3"
                disabled={!commentValue.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Kirim
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowPresets(!showPresets)}
            >
              {showPresets ? 'Sembunyikan Contoh' : 'Lihat Contoh Komentar'}
            </Button>
            
            <span className="text-xs text-muted-foreground">
              AI akan merespons jika komentar mengandung pemikiran kritis
            </span>
          </div>
          
          {showPresets && (
            <ScrollArea className="h-48 rounded-md border p-2">
              <div className="space-y-2">
                {presetComments.map((preset, index) => (
                  <div 
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className="p-2 rounded border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <p className="text-sm">{preset}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </form>
      </Card>
      
      {comments.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Diskusi ({comments.length})</h3>
          
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="font-medium">{comment.name}</div>
                <Badge variant="outline" className="text-xs">
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
              
              <p className="mt-2 mb-3">{comment.text}</p>
              
              {comment.analysis && (
                <>
                  <Separator className="my-3" />
                  
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <div className="font-medium text-sm">Insight AI</div>
                    </div>
                    <p className="text-sm mb-3">{comment.analysis.insight}</p>
                    
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium">{comment.analysis.followupQuestion}</p>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCommentSection;
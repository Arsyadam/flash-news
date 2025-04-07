import { useState } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useAIDescription() {
  const { state, dispatch } = useArticleContext();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const updateDescription = (content: string) => {
    dispatch({ 
      type: 'SET_DESCRIPTION_CONTENT',
      payload: content
    });
  };
  
  const regenerateDescription = async () => {
    const { title, author, source } = state.article;
    
    if (!title) {
      toast({
        title: "Error",
        description: "Please extract an article first",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegenerating(true);
    dispatch({ type: 'SET_DESCRIPTION_LOADING' });
    
    try {
      const response = await apiRequest('POST', '/api/ai/generate-description', { 
        title, 
        author, 
        source,
        regenerate: true 
      });
      const data = await response.json();
      
      dispatch({ 
        type: 'SET_DESCRIPTION_CONTENT', 
        payload: data.content 
      });
      
      toast({
        title: "Success",
        description: "Description regenerated",
      });
    } catch (error) {
      console.error('Error regenerating description:', error);
      
      dispatch({ 
        type: 'SET_DESCRIPTION_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to regenerate description' 
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to regenerate description',
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return {
    description: state.description,
    updateDescription,
    regenerateDescription,
    isRegenerating
  };
}

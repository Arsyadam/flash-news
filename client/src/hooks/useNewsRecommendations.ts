import { useArticleContext } from '../contexts/ArticleContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Recommendation } from '../lib/types';

export function useNewsRecommendations() {
  const { state, dispatch } = useArticleContext();
  const { toast } = useToast();
  
  const useRecommendation = async (recommendation: Recommendation) => {
    dispatch({ type: 'SET_ARTICLE_LOADING' });
    
    try {
      const response = await apiRequest('POST', '/api/article/extract', { url: recommendation.url });
      const data = await response.json();
      
      // Update article data in context
      dispatch({ 
        type: 'SET_ARTICLE_DATA', 
        payload: {
          url: recommendation.url,
          title: data.title || recommendation.title,
          author: data.author,
          source: data.source || recommendation.source,
          imageUrl: data.imageUrl || recommendation.imageUrl
        }
      });
      
      // Generate description for the new article
      generateDescriptionFromRecommendation(
        data.title || recommendation.title, 
        data.author, 
        data.source || recommendation.source
      );
      
      toast({
        title: "Success",
        description: "Recommendation applied successfully",
      });
    } catch (error) {
      console.error('Error using recommendation:', error);
      
      // If the extraction fails, we can still use the recommendation data
      dispatch({ 
        type: 'SET_ARTICLE_DATA', 
        payload: {
          url: recommendation.url,
          title: recommendation.title,
          author: "Unknown",
          source: recommendation.source,
          imageUrl: recommendation.imageUrl
        }
      });
      
      // Generate description for the recommendation
      generateDescriptionFromRecommendation(
        recommendation.title, 
        "Unknown", 
        recommendation.source
      );
      
      toast({
        title: "Warning",
        description: "Could not extract full details, using basic recommendation data",
      });
    }
  };
  
  const generateDescriptionFromRecommendation = async (title: string, author: string, source: string) => {
    dispatch({ type: 'SET_DESCRIPTION_LOADING' });
    
    try {
      const response = await apiRequest('POST', '/api/ai/generate-description', { 
        title, 
        author, 
        source 
      });
      const data = await response.json();
      
      dispatch({ 
        type: 'SET_DESCRIPTION_CONTENT', 
        payload: data.content 
      });
    } catch (error) {
      console.error('Error generating description from recommendation:', error);
      
      dispatch({ 
        type: 'SET_DESCRIPTION_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate description' 
      });
      
      toast({
        title: "Warning",
        description: "Failed to generate description. You can still write one manually.",
        variant: "destructive",
      });
    }
  };
  
  return {
    recommendations: state.recommendations,
    useRecommendation
  };
}

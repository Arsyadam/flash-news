import { useState } from 'react';
import { useArticleContext } from '../contexts/ArticleContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useArticleExtractor() {
  const { state, dispatch } = useArticleContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingHookTitle, setIsGeneratingHookTitle] = useState(false);
  
  const extractArticle = async (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    dispatch({ type: 'SET_ARTICLE_LOADING' });
    
    try {
      const response = await apiRequest('POST', '/api/article/extract', { url });
      const data = await response.json();
      
      // Update article data in context
      dispatch({ 
        type: 'SET_ARTICLE_DATA', 
        payload: {
          url,
          title: data.title,
          author: data.author,
          source: data.source,
          imageUrl: data.imageUrl,
          content: data.content || ''
        }
      });
      
      // Generate description and recommendations
      generateDescription(data.title, data.author, data.source);
      generateRecommendations(data.title);
      
      toast({
        title: "Success",
        description: "Article extracted successfully",
      });
    } catch (error) {
      console.error('Error extracting article:', error);
      
      dispatch({ 
        type: 'SET_ARTICLE_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to extract article' 
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to extract article',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const generateDescription = async (title: string, author: string, source: string) => {
    dispatch({ type: 'SET_DESCRIPTION_LOADING' });
    
    try {
      // Get content from the current article state
      const content = state.article.content;
      
      const response = await apiRequest('POST', '/api/ai/generate-description', { 
        title, 
        author, 
        source,
        content
      });
      const data = await response.json();
      
      dispatch({ 
        type: 'SET_DESCRIPTION_CONTENT', 
        payload: data.content 
      });
    } catch (error) {
      console.error('Error generating description:', error);
      
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
  
  const generateRecommendations = async (title: string) => {
    dispatch({ type: 'SET_RECOMMENDATIONS_LOADING' });
    
    try {
      const response = await apiRequest('POST', '/api/news/recommendations', { title });
      const data = await response.json();
      
      dispatch({ 
        type: 'SET_RECOMMENDATIONS_DATA', 
        payload: data 
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      dispatch({ 
        type: 'SET_RECOMMENDATIONS_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to get recommendations' 
      });
      
      toast({
        title: "Warning",
        description: "Failed to get news recommendations.",
        variant: "destructive",
      });
    }
  };
  
  const generateHookTitle = async () => {
    if (!state.article.title) {
      toast({
        title: "Error",
        description: "Article title is missing",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingHookTitle(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/hook-title', { 
        title: state.article.title 
      });
      const data = await response.json();
      
      if (data.hookTitle) {
        dispatch({
          type: 'SET_ARTICLE_DATA',
          payload: { title: data.hookTitle }
        });
        
        toast({
          title: "Success",
          description: "Generated a catchy title for Gen Z audience",
        });
      }
    } catch (error) {
      console.error('Error generating hook title:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate a catchy title',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHookTitle(false);
    }
  };

  const updateArticleField = (field: string, value: string) => {
    dispatch({
      type: 'SET_ARTICLE_DATA',
      payload: { [field]: value } as Partial<typeof state.article>
    });
  };
  
  return {
    article: state.article,
    extractArticle,
    generateHookTitle,
    updateArticleField,
    isSubmitting,
    isGeneratingHookTitle
  };
}

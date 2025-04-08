import { useArticleContext } from '../contexts/ArticleContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Recommendation } from '../lib/types';
import { useState } from 'react';

export function useNewsRecommendations() {
  const { state, dispatch } = useArticleContext();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to refresh recommendations with different keyword mix
  const refreshRecommendations = async () => {
    if (!state.article.title) return;
    
    setRefreshing(true);
    dispatch({ type: 'SET_RECOMMENDATIONS_LOADING' });
    
    try {
      // Add some random keywords to get more varied results
      const keywords = ['tech', 'digital', 'innovation', 'future', 'update'];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      
      // Use title + a random keyword to get more varied recommendations
      const searchTitle = `${state.article.title} ${randomKeyword}`;
      
      const response = await apiRequest('POST', '/api/news/recommendations', { title: searchTitle });
      const data = await response.json();
      
      dispatch({ type: 'SET_RECOMMENDATIONS_DATA', payload: data });
      
      toast({
        title: "Rekomendasi Diperbarui",
        description: "Berhasil mendapatkan artikel terkait baru",
        duration: 3000
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      
      dispatch({ 
        type: 'SET_RECOMMENDATIONS_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to refresh recommendations' 
      });
      
      toast({
        title: "Gagal Memperbarui",
        description: "Tidak bisa mendapatkan rekomendasi baru. Coba lagi nanti.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  };
  
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
          imageUrl: data.imageUrl || recommendation.imageUrl,
          content: data.content || ""
        }
      });
      
      // Generate description for the new article
      generateDescriptionFromRecommendation(
        data.title || recommendation.title, 
        data.author, 
        data.source || recommendation.source,
        data.content
      );
      
      toast({
        title: "Berhasil",
        description: "Artikel berhasil digunakan",
        duration: 3000
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
          imageUrl: recommendation.imageUrl,
          content: ""
        }
      });
      
      // Generate description for the recommendation
      generateDescriptionFromRecommendation(
        recommendation.title, 
        "Unknown", 
        recommendation.source
      );
      
      toast({
        title: "Peringatan",
        description: "Tidak bisa mengekstrak detail lengkap, menggunakan data rekomendasi dasar",
        duration: 3000
      });
    }
  };
  
  const generateDescriptionFromRecommendation = async (
    title: string, 
    author: string, 
    source: string,
    content?: string
  ) => {
    dispatch({ type: 'SET_DESCRIPTION_LOADING' });
    
    try {
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
      console.error('Error generating description from recommendation:', error);
      
      dispatch({ 
        type: 'SET_DESCRIPTION_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate description' 
      });
      
      toast({
        title: "Peringatan",
        description: "Gagal membuat deskripsi. Anda masih bisa membuatnya secara manual.",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  return {
    recommendations: state.recommendations,
    useRecommendation,
    refreshRecommendations,
    refreshing
  };
}

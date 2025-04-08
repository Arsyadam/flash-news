import React, { useRef } from 'react';
import { useNewsRecommendations } from '../hooks/useNewsRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageUtils';

const NewsRecommendations: React.FC = () => {
  const { recommendations, useRecommendation, refreshRecommendations, refreshing } = useNewsRecommendations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <Card className="bg-white mt-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Artikel Terkait</h2>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-2 text-gray-600 hover:text-gray-900"
              onClick={refreshRecommendations}
              disabled={refreshing || !recommendations.items.length}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1.5"></span>
            Auto-generated
          </Badge>
        </div>
        
        <div className="relative">
          <div className="absolute right-0 top-0 -mt-10 flex space-x-2">
            <Button
              type="button"
              onClick={scrollLeft}
              size="icon"
              variant="outline"
              className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <Button
              type="button"
              onClick={scrollRight}
              size="icon"
              variant="outline"
              className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-6 px-6"
        >
          {recommendations.isLoading || refreshing ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Mencari artikel terkait...</span>
            </div>
          ) : recommendations.error ? (
            <div className="flex items-center justify-center h-32 text-red-500">
              {recommendations.error}
            </div>
          ) : recommendations.items.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Tidak ada rekomendasi artikel tersedia
            </div>
          ) : (
            <div className="flex space-x-4 pb-4">
              {recommendations.items.map((recommendation) => (
                <div 
                  key={recommendation.id}
                  className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  {recommendation.imageUrl && (
                    <img 
                      src={getProxiedImageUrl(recommendation.imageUrl)} 
                      className="w-full h-32 object-cover" 
                      alt={recommendation.title}
                      crossOrigin="anonymous" 
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{recommendation.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{recommendation.source}</p>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full text-primary-600 border-primary-500 hover:bg-primary-50"
                        onClick={() => useRecommendation(recommendation)}
                      >
                        Gunakan Artikel Ini
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsRecommendations;
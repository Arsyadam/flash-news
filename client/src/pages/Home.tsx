import React, { useState } from 'react';
import Header from '../components/Header';
import InputSection from '../components/InputSection';
import ArticlePreview from '../components/ArticlePreview';
import AIDescription from '../components/AIDescription';
import NewsRecommendations from '../components/NewsRecommendations';
import InstagramPreview from '../components/InstagramPreview';
import GenZPrompt from '../components/GenZPrompt';
import CommentSuggestion from '../components/CommentSuggestion';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const Home: React.FC = () => {
  const [showCommentSuggestion, setShowCommentSuggestion] = useState(false);

  // Triple-click pada bagian bawah halaman untuk menampilkan fitur tersembunyi
  const handleTripleClick = () => {
    setShowCommentSuggestion(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <InputSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ArticlePreview />
              <AIDescription />
              <GenZPrompt />
              <NewsRecommendations />
              {showCommentSuggestion && <CommentSuggestion />}
            </div>
            
            <div className="lg:col-span-1 space-y-8">
              <InstagramPreview />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Hidden area to activate secret feature - requires triple click */}
      <div 
        className="hidden lg:block fixed bottom-4 right-4 cursor-default select-none"
        onDoubleClick={(e) => {
          // Prevent accidental activation by requiring triple click
          e.preventDefault();
          setTimeout(() => {
            document.addEventListener('click', handleTripleClick, { once: true });
            setTimeout(() => {
              document.removeEventListener('click', handleTripleClick);
            }, 500);
          }, 0);
        }}
      >
        {!showCommentSuggestion && (
          <div className="w-3 h-3 bg-purple-400 rounded-full opacity-30"></div>
        )}
      </div>
      
      {/* Alternative way to activate on mobile */}
      {!showCommentSuggestion && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 left-4 opacity-10 hover:opacity-100 transition-opacity"
          onClick={() => setShowCommentSuggestion(true)}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Home;

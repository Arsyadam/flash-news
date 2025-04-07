import React from 'react';
import Header from '../components/Header';
import InputSection from '../components/InputSection';
import ArticlePreview from '../components/ArticlePreview';
import AIDescription from '../components/AIDescription';
import NewsRecommendations from '../components/NewsRecommendations';
import InstagramPreview from '../components/InstagramPreview';
import Footer from '../components/Footer';

const Home: React.FC = () => {
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
              <NewsRecommendations />
            </div>
            
            <div className="lg:col-span-1 space-y-8">
              <InstagramPreview />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

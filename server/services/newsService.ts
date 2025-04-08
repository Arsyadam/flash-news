import { Recommendation } from '@/lib/types';
import { nanoid } from 'nanoid';

class NewsService {
  /**
   * Get related news recommendations based on an article title
   */
  async getRecommendations(title: string): Promise<Recommendation[]> {
    try {
      // First try to use the News API
      const newsApiRecommendations = await this.tryNewsAPI(title);
      if (newsApiRecommendations.length > 0) {
        return newsApiRecommendations;
      }
      
      // Fallback to hardcoded recommendations with contextual relevance
      return this.generateContextualRecommendations(title);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }
  
  /**
   * Try to use the News API for recommendations
   */
  private async tryNewsAPI(title: string): Promise<Recommendation[]> {
    try {
      // Extract keywords for search
      const keywords = this.extractMainKeywords(title);
      
      // Combine with IT-related keywords to focus on tech news
      const itKeywords = ['teknologi', 'IT', 'software', 'digital'];
      const query = [...keywords, ...itKeywords].join(' OR ');
      
      // Use NewsAPI if API key is available
      const newsApiKey = process.env.NEWS_API_KEY;
      if (!newsApiKey) {
        return [];
      }
      
      // Try to get from Indonesian sources first
      const sources = 'detik.com,tempo.co,kompas.com';
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sources=${encodeURIComponent(sources)}&sortBy=publishedAt&pageSize=6`,
        {
          headers: {
            'X-Api-Key': newsApiKey,
          },
        }
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
        // If no Indonesian sources found, try with language parameter
        const backupResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=id&sortBy=publishedAt&pageSize=6`,
          {
            headers: {
              'X-Api-Key': newsApiKey,
            },
          }
        );
        
        if (!backupResponse.ok) {
          return [];
        }
        
        const backupData = await backupResponse.json();
        if (!backupData.articles || !Array.isArray(backupData.articles)) {
          return [];
        }
        
        // Filter to include only IT-related articles
        const itArticles = backupData.articles.filter((article: any) => {
          const titleLower = article.title.toLowerCase();
          return itKeywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
        });
        
        return itArticles.map((article: any) => ({
          id: nanoid(),
          title: article.title,
          source: article.source.name,
          url: article.url,
          imageUrl: article.urlToImage || this.getRandomTechImage(),
        }));
      }
      
      // Filter to include only IT-related articles
      const itArticles = data.articles.filter((article: any) => {
        const titleLower = article.title.toLowerCase();
        return itKeywords.some(keyword => titleLower.includes(keyword.toLowerCase())) ||
               keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
      });
      
      return itArticles.map((article: any) => ({
        id: nanoid(),
        title: article.title,
        source: article.source.name,
        url: article.url,
        imageUrl: article.urlToImage || this.getRandomTechImage(),
      }));
    } catch (error) {
      console.warn('News API not available:', error);
      return [];
    }
  }
  
  /**
   * Generate recommendations based on keywords in the title
   */
  private generateContextualRecommendations(title: string): Recommendation[] {
    const keywords = this.extractMainKeywords(title);
    
    // Preferred sources as requested by client
    const preferredSources = {
      'detikcom': {
        name: 'detikinet',
        baseUrl: 'https://inet.detik.com'
      },
      'medium': {
        name: 'Medium',
        baseUrl: 'https://medium.com'
      },
      'kompas': {
        name: 'Tekno Kompas',
        baseUrl: 'https://tekno.kompas.com'
      },
      'tempo': {
        name: 'Tekno Tempo',
        baseUrl: 'https://tekno.tempo.co'
      }
    };
    
    // Map of keywords to related content using preferred sources
    const recommendationsByTopic: Record<string, Recommendation[]> = {
      'ai': [
        {
          id: nanoid(),
          title: "Penelitian AI Terbaru dari Google DeepMind Bikin Kejutan di Industri",
          source: preferredSources.detikcom.name,
          url: `${preferredSources.detikcom.baseUrl}/digital-life/d-7139417/penelitian-ai-terbaru-dari-google-deepmind-bikin-kejutan-di-industri`,
          imageUrl: "https://images.unsplash.com/photo-1661956602868-6ae368943878?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "5 Model Machine Learning Terbaru yang Wajib Diketahui Developer Indonesia",
          source: preferredSources.medium.name,
          url: `${preferredSources.medium.baseUrl}/topic/machine-learning`,
          imageUrl: "https://images.unsplash.com/photo-1678983419903-92b075ed3caf?q=80&w=1374&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Mengenal Teknologi Generative AI dan Cara Kerjanya",
          source: preferredSources.kompas.name,
          url: `${preferredSources.kompas.baseUrl}/read/2023/12/10/08140097/mengenal-teknologi-generative-ai-dan-cara-kerjanya`,
          imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1650&auto=format&fit=crop"
        }
      ],
      'cloud': [
        {
          id: nanoid(),
          title: "Tren Cloud Computing di Indonesia 2024, Ini yang Perlu Kamu Tahu",
          source: preferredSources.detikcom.name,
          url: `${preferredSources.detikcom.baseUrl}/business/d-7062095/tren-cloud-computing-di-indonesia-terbaru`,
          imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Keuntungan Adopsi Serverless untuk Startup Indonesia",
          source: preferredSources.medium.name,
          url: `${preferredSources.medium.baseUrl}/topic/serverless`,
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop"
        }
      ],
      'programming': [
        {
          id: nanoid(),
          title: "8 Bahasa Pemrograman Terpopuler di Indonesia 2024",
          source: preferredSources.detikcom.name,
          url: `${preferredSources.detikcom.baseUrl}/inet-tips/d-7054871/8-bahasa-pemrograman-terpopuler-di-indonesia`,
          imageUrl: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Teknik Pengembangan Software Modern untuk Developer Indonesia",
          source: preferredSources.medium.name,
          url: `${preferredSources.medium.baseUrl}/topic/software-development`,
          imageUrl: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1489&auto=format&fit=crop"
        }
      ],
      'security': [
        {
          id: nanoid(),
          title: "Awas! Serangan Siber Meningkat di Indonesia, Ini Cara Melindungi Data",
          source: preferredSources.detikcom.name,
          url: `${preferredSources.detikcom.baseUrl}/news/d-7084536/awas-serangan-siber-meningkat-di-indonesia`,
          imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Zero Trust Architecture: Panduan Keamanan untuk Perusahaan Teknologi",
          source: preferredSources.medium.name,
          url: `${preferredSources.medium.baseUrl}/topic/cybersecurity`,
          imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1470&auto=format&fit=crop"
        }
      ],
      'web': [
        {
          id: nanoid(),
          title: "Perbandingan Framework Frontend 2024 untuk Developer Indonesia",
          source: preferredSources.detikcom.name,
          url: `${preferredSources.detikcom.baseUrl}/inet-tips/d-7035621/perbandingan-framework-frontend-terbaru`,
          imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1464&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Microservices vs Monoliths: Pilihan Tepat untuk Aplikasi Skala Besar",
          source: preferredSources.medium.name,
          url: `${preferredSources.medium.baseUrl}/topic/web-development`,
          imageUrl: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?q=80&w=1450&auto=format&fit=crop"
        }
      ]
    };
    
    // Default tech recommendations (fokus pada IT seperti permintaan)
    const defaultRecommendations: Recommendation[] = [
      {
        id: nanoid(),
        title: "Blockchain dan Cryptocurrency, Peluang Baru di Indonesia",
        source: preferredSources.detikcom.name,
        url: `${preferredSources.detikcom.baseUrl}/news/d-7048576/blockchain-dan-cryptocurrency-peluang-baru-di-indonesia`,
        imageUrl: "https://images.unsplash.com/photo-1590283603385-c1c595235a32?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "5G di Indonesia: Kapan Akan Tersedia Merata?",
        source: preferredSources.kompas.name,
        url: `${preferredSources.kompas.baseUrl}/read/2023/12/15/16453777/5g-di-indonesia-kapan-akan-tersedia-merata`,
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "Quantum Computing dan Masa Depan Komputasi di Indonesia",
        source: preferredSources.detikcom.name,
        url: `${preferredSources.detikcom.baseUrl}/inet-tips/d-7071234/quantum-computing-dan-masa-depan-komputasi`,
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "DevOps dan Agile: Transformasi Budaya IT di Perusahaan Indonesia",
        source: preferredSources.medium.name,
        url: `${preferredSources.medium.baseUrl}/topic/devops`,
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "Internet of Things: Peluang dan Tantangan di Indonesia",
        source: preferredSources.tempo.name,
        url: `${preferredSources.tempo.baseUrl}/tekno/read/1234567/internet-of-things-peluang-dan-tantangan-di-indonesia`,
        imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "Data Science dan Big Data: Karir Menjanjikan di Bidang IT",
        source: preferredSources.detikcom.name,
        url: `${preferredSources.detikcom.baseUrl}/news/d-7092784/data-science-dan-big-data-karir-menjanjikan-di-bidang-it`,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop"
      }
    ];
    
    // Collect relevant recommendations
    let relevantRecommendations: Recommendation[] = [];
    
    // Add recommendations based on keywords found in title
    keywords.forEach(keyword => {
      if (recommendationsByTopic[keyword]) {
        // Shuffle the array to get different recommendations on each refresh
        const shuffled = [...recommendationsByTopic[keyword]].sort(() => 0.5 - Math.random());
        relevantRecommendations.push(...shuffled);
      }
    });
    
    // If we don't have enough, add from default recommendations
    if (relevantRecommendations.length < 4) {
      // Shuffle default recommendations to get variety
      const shuffledDefaults = [...defaultRecommendations].sort(() => 0.5 - Math.random());
      relevantRecommendations.push(
        ...shuffledDefaults.slice(0, 4 - relevantRecommendations.length)
      );
    }
    
    // Ensure we prioritize different sources (mix detik.com, medium, etc.)
    relevantRecommendations = this.diversifySources(relevantRecommendations);
    
    // Limit to 4 recommendations and ensure unique IDs
    return relevantRecommendations
      .slice(0, 4)
      .map(rec => ({ ...rec, id: nanoid() }));
  }
  
  /**
   * Ensure recommendations come from diverse sources
   */
  private diversifySources(recommendations: Recommendation[]): Recommendation[] {
    // Group by source
    const bySource: Record<string, Recommendation[]> = {};
    recommendations.forEach(rec => {
      if (!bySource[rec.source]) {
        bySource[rec.source] = [];
      }
      bySource[rec.source].push(rec);
    });
    
    // Take at most 2 from each source to ensure diversity
    let result: Recommendation[] = [];
    Object.values(bySource).forEach(sourceRecs => {
      result.push(...sourceRecs.slice(0, 2));
    });
    
    // Shuffle the final array to avoid predictable order by source
    return result.sort(() => 0.5 - Math.random());
  }
  
  /**
   * Extract main keywords from title for relevance matching
   */
  private extractMainKeywords(title: string): string[] {
    // Common IT keywords categorized
    const keywordCategories: Record<string, string[]> = {
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network'],
      'cloud': ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'saas', 'paas', 'iaas'],
      'programming': ['programming', 'code', 'software', 'development', 'developer', 'java', 'javascript', 'python'],
      'security': ['security', 'cybersecurity', 'privacy', 'encryption', 'hacking', 'vulnerability'],
      'web': ['web', 'webapp', 'frontend', 'backend', 'fullstack', 'react', 'angular', 'vue']
    };
    
    const titleLower = title.toLowerCase();
    
    // Find which categories have keywords appearing in the title
    const matchedCategories = Object.keys(keywordCategories).filter(category => {
      return keywordCategories[category].some(keyword => titleLower.includes(keyword));
    });
    
    // Return matched categories, or a default set if none matched
    return matchedCategories.length > 0 
      ? matchedCategories 
      : ['ai', 'programming']; // Default categories
  }
  
  /**
   * Get a random tech-related image URL for recommendations without images
   */
  private getRandomTechImage(): string {
    const techImages = [
      "https://images.unsplash.com/photo-1488229297570-58520851e868?q=80&w=1469&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop"
    ];
    
    return techImages[Math.floor(Math.random() * techImages.length)];
  }
}

export const newsService = new NewsService();

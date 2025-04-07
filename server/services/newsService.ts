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
      const query = keywords.join(' OR ');
      
      // Use NewsAPI if API key is available
      const newsApiKey = process.env.NEWS_API_KEY;
      if (!newsApiKey) {
        return [];
      }
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=4`,
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
      if (!data.articles || !Array.isArray(data.articles)) {
        return [];
      }
      
      return data.articles.map((article: any) => ({
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
    
    // Map of keywords to related content
    const recommendationsByTopic: Record<string, Recommendation[]> = {
      'ai': [
        {
          id: nanoid(),
          title: "AI Ethics: Navigating the Complex Landscape",
          source: "Tech Ethics Journal",
          url: "https://example.com/ai-ethics",
          imageUrl: "https://images.unsplash.com/photo-1661956602868-6ae368943878?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Machine Learning Models Breaking New Ground",
          source: "Data Science Monthly",
          url: "https://example.com/ml-models",
          imageUrl: "https://images.unsplash.com/photo-1678983419903-92b075ed3caf?q=80&w=1374&auto=format&fit=crop"
        }
      ],
      'cloud': [
        {
          id: nanoid(),
          title: "Cloud Computing and AI: Perfect Synergy",
          source: "Cloud Innovators",
          url: "https://example.com/cloud-ai-synergy",
          imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Serverless Architecture Reshaping Application Development",
          source: "Cloud Tech Review",
          url: "https://example.com/serverless",
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop"
        }
      ],
      'programming': [
        {
          id: nanoid(),
          title: "New Programming Languages for AI Development",
          source: "Code Magazine",
          url: "https://example.com/programming-languages",
          imageUrl: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Software Design Patterns for Modern Applications",
          source: "Developer Weekly",
          url: "https://example.com/design-patterns",
          imageUrl: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1489&auto=format&fit=crop"
        }
      ],
      'security': [
        {
          id: nanoid(),
          title: "Cybersecurity Threats in the Age of AI",
          source: "Security Insights",
          url: "https://example.com/cyber-threats",
          imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Zero Trust Architecture: Implementation Guide",
          source: "InfoSec Today",
          url: "https://example.com/zero-trust",
          imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1470&auto=format&fit=crop"
        }
      ],
      'web': [
        {
          id: nanoid(),
          title: "Frontend Frameworks Comparison 2023",
          source: "Web Developer Monthly",
          url: "https://example.com/frontend-frameworks",
          imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1464&auto=format&fit=crop"
        },
        {
          id: nanoid(),
          title: "Microservices vs. Monoliths: Making the Right Choice",
          source: "Architecture Digest",
          url: "https://example.com/microservices",
          imageUrl: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?q=80&w=1450&auto=format&fit=crop"
        }
      ]
    };
    
    // Default tech recommendations
    const defaultRecommendations: Recommendation[] = [
      {
        id: nanoid(),
        title: "The Future of Tech: Emerging Trends for 2023",
        source: "Tech Insights",
        url: "https://example.com/future-tech",
        imageUrl: "https://images.unsplash.com/photo-1488229297570-58520851e868?q=80&w=1469&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "How Big Data is Transforming Business Intelligence",
        source: "Data Analytics Weekly",
        url: "https://example.com/big-data",
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "Quantum Computing: A Deep Dive into Future Technology",
        source: "Quantum Tech Review",
        url: "https://example.com/quantum-computing",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1470&auto=format&fit=crop"
      },
      {
        id: nanoid(),
        title: "The Rise of DevOps Culture in Modern Organizations",
        source: "DevOps Insights",
        url: "https://example.com/devops-culture",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop"
      }
    ];
    
    // Collect relevant recommendations
    let relevantRecommendations: Recommendation[] = [];
    
    // Add recommendations based on keywords found in title
    keywords.forEach(keyword => {
      if (recommendationsByTopic[keyword]) {
        relevantRecommendations.push(...recommendationsByTopic[keyword]);
      }
    });
    
    // If we don't have enough, add from default recommendations
    if (relevantRecommendations.length < 4) {
      relevantRecommendations.push(
        ...defaultRecommendations.slice(0, 4 - relevantRecommendations.length)
      );
    }
    
    // Limit to 4 recommendations and ensure unique IDs
    return relevantRecommendations
      .slice(0, 4)
      .map(rec => ({ ...rec, id: nanoid() }));
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

class AIService {
  /**
   * Generate a description for an article using the title, author, and source
   */
  async generateDescription(
    title: string, 
    author: string = 'Unknown', 
    source: string = 'Unknown',
    regenerate: boolean = false
  ): Promise<string> {
    try {
      // Try using Ollama API if it's accessible
      const ollamaResponse = await this.tryOllamaAPI(title, author, source);
      if (ollamaResponse) {
        return ollamaResponse;
      }

      // Fallback to a generated description using the article metadata
      return this.fallbackDescription(title, author, source, regenerate);
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error('Failed to generate description');
    }
  }

  /**
   * Try to use Ollama API for description generation
   */
  private async tryOllamaAPI(title: string, author: string, source: string): Promise<string | null> {
    try {
      // If an Ollama server is running locally or accessible
      // Replace with actual Ollama API endpoint if available
      const ollamaEndpoint = process.env.OLLAMA_API_URL;
      
      if (!ollamaEndpoint) {
        return null;
      }
      
      const response = await fetch(`${ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          prompt: `Generate a concise and engaging Instagram post description (max 200 characters) for an IT news article titled "${title}" by ${author} from ${source}. Include relevant hashtags.`,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.warn('Ollama API not available:', error);
      return null;
    }
  }

  /**
   * Generate a fallback description when Ollama is not available
   */
  private fallbackDescription(
    title: string,
    author: string,
    source: string,
    regenerate: boolean
  ): string {
    // Extract keywords from the title
    const keywords = this.extractKeywords(title);
    
    // Create hashtags from the keywords
    const hashtags = keywords
      .map(keyword => `#${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`)
      .slice(0, 3)
      .join(' ');
    
    // Different templates for variety, especially when regenerating
    const templates = [
      `Check out this insightful article on ${title}. ${author} from ${source} brings valuable perspectives on this important topic. ${hashtags}`,
      `"${title}" - A must-read for IT professionals! ${author} delivers key insights in this comprehensive analysis. ${hashtags}`,
      `Latest in tech: ${title}. Read what ${author} from ${source} has to say about this trending topic. ${hashtags}`,
      `${title} - expertly written by ${author}. This ${source} article is essential reading for staying updated in the tech world. ${hashtags}`,
    ];
    
    // Choose a random template, or a specific one based on regenerate boolean
    const templateIndex = regenerate 
      ? Math.floor(Math.random() * templates.length) 
      : 0;
    
    return templates[templateIndex];
  }

  /**
   * Extract keywords from the title for hashtag generation
   */
  private extractKeywords(title: string): string[] {
    // Common IT-related keywords to look for
    const itKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'cloud', 'cloud computing', 'aws', 'azure', 'gcp',
      'programming', 'code', 'software', 'development', 'developer',
      'tech', 'technology', 'digital', 'data', 'database',
      'security', 'cybersecurity', 'privacy', 'encryption',
      'web', 'webapp', 'application', 'frontend', 'backend',
      'network', 'internet', 'iot', 'blockchain', 'crypto',
      'mobile', 'app', 'devops', 'agile', 'scrum',
      'innovation', 'startup', 'automation', 'robotics',
      'algorithm', 'api', 'microservice', 'serverless',
      'saas', 'paas', 'iaas', 'infrastructure'
    ];
    
    // Extract words from the title
    const titleWords = title.toLowerCase().split(/\s+/);
    
    // Find any IT keywords in the title
    const foundKeywords = itKeywords.filter(keyword => {
      const keywordWords = keyword.split(' ');
      if (keywordWords.length === 1) {
        return titleWords.includes(keyword);
      } else {
        // For multi-word keywords, check if they appear in sequence
        for (let i = 0; i <= titleWords.length - keywordWords.length; i++) {
          if (keywordWords.every((word, index) => titleWords[i + index] === word)) {
            return true;
          }
        }
        return false;
      }
    });
    
    // If we found keywords, use them
    if (foundKeywords.length > 0) {
      // Remove spaces for hashtags
      return foundKeywords.map(keyword => keyword.replace(/\s+/g, ''));
    }
    
    // Fallback to generic tech hashtags
    return ['tech', 'innovation', 'digital'];
  }
}

export const aiService = new AIService();

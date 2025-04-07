class AIService {
  /**
   * Generate a description for an article using the title, author, and source
   */
  async generateDescription(
    title: string, 
    author: string = 'Unknown', 
    source: string = 'Unknown',
    options: {
      content?: string;
      regenerate?: boolean;
      customPrompt?: string;
    } = {}
  ): Promise<string> {
    try {
      const { content, regenerate = false, customPrompt } = options;
      
      // If a custom prompt is provided, use it with the Ollama API
      if (customPrompt) {
        const ollamaResponse = await this.tryOllamaAPI(title, author, source, customPrompt, content);
        if (ollamaResponse) {
          return ollamaResponse;
        }
      } else {
        // Try using Ollama API with the default prompt if it's accessible
        const ollamaResponse = await this.tryOllamaAPI(title, author, source, undefined, content);
        if (ollamaResponse) {
          return ollamaResponse;
        }
      }

      // Fallback to a generated description using the article metadata
      return this.fallbackDescription(title, author, source, regenerate, customPrompt, content);
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error('Failed to generate description');
    }
  }

  /**
   * Try to use Ollama API for description generation
   */
  private async tryOllamaAPI(
    title: string, 
    author: string, 
    source: string, 
    customPrompt?: string,
    content?: string
  ): Promise<string | null> {
    try {
      // If an Ollama server is running locally or accessible
      // Replace with actual Ollama API endpoint if available
      const ollamaEndpoint = process.env.OLLAMA_API_URL;
      
      if (!ollamaEndpoint) {
        return null;
      }
      
      // Use custom prompt if provided, otherwise use default
      let prompt = customPrompt;
      if (!prompt) {
        if (content) {
          prompt = `Buatkan deskripsi berita untuk program Systemetic berdasarkan judul "${title}", disampaikan oleh ${author}, dan bersumber dari ${source}. 
          
KONTEN ARTIKEL: 
${content}

PENTING: 
1. Ambil kalimat-kalimat langsung dari konten artikel di atas, jangan membuat konten baru. 
2. Pilih 3-5 kalimat penting dan susun dengan struktur yang efektif dalam maksimal 3 paragraf.
3. Tugas kamu hanya memilih dan menata kalimat yang ada di konten artikel, bukan membuat kalimat baru.
4. Jangan mengubah substansi atau menambahkan interpretasi.
5. Jangan menyebutkan bahwa kamu AI atau menulis kata "ringkasan".`;
        } else {
          prompt = `Buatkan deskripsi berita untuk program Systemetic berdasarkan judul "${title}", disampaikan oleh ${author}, dan bersumber dari ${source}. PENTING: Ambil kalimat-kalimat langsung dari konten berita aslinya, jangan membuat konten baru. Pilih kalimat-kalimat penting dan susun dengan struktur yang lebih efektif. Tugas AI hanya membantu menata susunan kalimat yang diambil dari konten berita tersebut tanpa mengubah substansi atau menambahkan interpretasi.`;
        }
      } else {
        // Replace placeholders in custom prompt
        prompt = prompt.replace(/{title}/g, title)
                       .replace(/{author}/g, author)
                       .replace(/{source}/g, source);
        
        // Add content to custom prompt if available
        if (content && prompt.includes('{content}')) {
          prompt = prompt.replace(/{content}/g, content);
        }
      }
      
      const response = await fetch(`${ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          prompt,
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
    regenerate: boolean,
    customPrompt?: string,
    content?: string
  ): string {
    // If we have article content and no Ollama, use sentences from the content
    if (content) {
      // Extract 3-5 sentences from the content that seem important
      const sentences = content.split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 30); // Only use substantial sentences
      
      // Get a few sentences from the beginning and middle of the article
      const importantSentences: string[] = [];
      
      // Get first sentence if available (usually important)
      if (sentences.length > 0) {
        importantSentences.push(sentences[0] + '.');
      }
      
      // Get some from the middle (often contains core information)
      const middleIndex = Math.floor(sentences.length / 2);
      if (sentences.length > 2 && middleIndex < sentences.length) {
        importantSentences.push(sentences[middleIndex] + '.');
        
        // Add one more if available
        if (middleIndex + 1 < sentences.length) {
          importantSentences.push(sentences[middleIndex + 1] + '.');
        }
      }
      
      // If we have at least 2 sentences, use them
      if (importantSentences.length >= 2) {
        const hashtags = this.generateHashtags(title);
        return `${importantSentences.join(' ')} ${hashtags}`;
      }
    }
    
    // If there is a custom prompt but no Ollama, we'll use a variation of that prompt as a template
    if (customPrompt) {
      const processedPrompt = customPrompt
        .replace(/{title}/g, title)
        .replace(/{author}/g, author)
        .replace(/{source}/g, source);
      
      if (content && processedPrompt.includes('{content}')) {
        processedPrompt.replace(/{content}/g, content);
      }
      
      // Extract a response from the prompt itself
      const lines = processedPrompt.split('.');
      if (lines.length > 1) {
        return `${title} by ${author} from ${source}. ${this.generateHashtags(title)}`;
      }
    }
    
    // Extract keywords from the title
    const hashtags = this.generateHashtags(title);
    
    // Simple templates that indicate this is just a summary of the original content
    const templates = [
      `${title}. Ringkasan penting dari berita yang ditulis oleh ${author} di ${source}. ${hashtags}`,
      `Artikel dari ${source}: "${title}". Disusun berdasarkan konten asli yang ditulis oleh ${author}. ${hashtags}`,
      `Program Systemetic menyajikan "${title}" - berdasarkan artikel asli ${source}. ${hashtags}`,
      `${title} - Ringkasan artikel ${source} oleh ${author}. ${hashtags}`,
    ];
    
    // Choose a random template, or a specific one based on regenerate boolean
    const templateIndex = regenerate 
      ? Math.floor(Math.random() * templates.length) 
      : 0;
    
    return templates[templateIndex];
  }
  
  /**
   * Generate hashtags based on the title
   */
  private generateHashtags(title: string): string {
    const keywords = this.extractKeywords(title);
    
    // Create hashtags from the keywords
    return keywords
      .map(keyword => `#${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`)
      .slice(0, 3)
      .join(' ');
  }

  /**
   * Extract keywords from the title for hashtag generation
   */
  private extractKeywords(title: string): string[] {
    // Common IT-related keywords to look for (including Indonesian tech terms)
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
      'saas', 'paas', 'iaas', 'infrastructure',
      // Indonesian tech terms
      'teknologi', 'kecerdasan buatan', 'pembelajaran mesin', 'komputasi awan',
      'pengembangan', 'keamanan', 'privasi', 'digital', 'data', 'basis data',
      'jaringan', 'aplikasi', 'inovasi', 'startup', 'otomatisasi',
      'infrastruktur', 'transformasi digital', 'ekonomi digital', 'fintech', 'edtech',
      'sistem', 'kebijakan', 'regulasi', 'layanan', 'program', 'pengembangan',
      'teknologi informasi', 'ti', 'sistemetic', 'strategis'
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
    
    // Fallback to generic Indonesian tech hashtags relevant to Systemetic
    return ['Sistemetic', 'TeknologiInformasi', 'DigitalIndonesia'];
  }
}

export const aiService = new AIService();

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
          prompt = `Buatkan deskripsi berita berdasarkan informasi berikut:
Judul: ${title}
Penulis / Narasumber: ${author}
Sumber Berita: ${source}

KONTEN ARTIKEL: 
${content}

Gunakan struktur narasi yang informatif dan ringkas seperti gaya Narasi Daily. Sertakan kutipan langsung dari ${author} jika tersedia.

Struktur deskripsi yang harus diikuti:

1. Lead / Pembuka Berita:
   Ringkasan peristiwa utama berdasarkan judul. Jawab unsur 5W1H sebisa mungkin.

2. Tindakan atau Rencana yang Diambil:
   Jelaskan langkah konkret yang disampaikan atau dilakukan oleh narasumber.

3. Tujuan atau Dampak:
   Uraikan alasan atau dampak dari langkah tersebut bagi publik atau stakeholder tertentu.

4. Kutipan Langsung (Opsional):
   Tambahkan kutipan dari narasumber untuk menguatkan narasi.

5. Rincian Strategi atau Isi Keputusan:
   Jelaskan solusi, kebijakan, atau rencana lanjutan yang disebutkan.

6. Penutup / Strategi Jangka Panjang:
   Akhiri dengan strategi tambahan, kesimpulan, atau harapan dari narasumber.

Sampaikan dalam minimal 4 paragraf. Gaya bahasa harus formal, padat, dan mudah dicerna pembaca awam. Cantumkan sumber berita di akhir artikel.

PENTING:
- Struktur paragraf harus rapi dan mudah dibaca
- Pastikan deskripsi kompatibel untuk dibagikan di website berita teknologi
- Hindari pengulangan informasi yang sama
- Jangan menyebutkan bahwa kamu AI atau menulis kata "ringkasan"
- Jangan menambahkan konten yang tidak ada di artikel asli`;
        } else {
          prompt = `Buatkan deskripsi berita berdasarkan informasi berikut:
Judul: ${title}
Penulis / Narasumber: ${author}
Sumber Berita: ${source}

Gunakan struktur narasi yang informatif dan ringkas seperti gaya Narasi Daily. Sertakan kutipan langsung dari narasumber jika tersedia.

Struktur deskripsi yang harus diikuti:

1. Lead / Pembuka Berita:
   Ringkasan peristiwa utama berdasarkan judul. Jawab unsur 5W1H sebisa mungkin.

2. Tindakan atau Rencana yang Diambil:
   Jelaskan langkah konkret yang disampaikan atau dilakukan oleh narasumber.

3. Tujuan atau Dampak:
   Uraikan alasan atau dampak dari langkah tersebut bagi publik atau stakeholder tertentu.

4. Kutipan Langsung (Opsional):
   Tambahkan kutipan dari narasumber untuk menguatkan narasi.

5. Rincian Strategi atau Isi Keputusan:
   Jelaskan solusi, kebijakan, atau rencana lanjutan yang disebutkan.

6. Penutup / Strategi Jangka Panjang:
   Akhiri dengan strategi tambahan, kesimpulan, atau harapan dari narasumber.

Sampaikan dalam minimal 4 paragraf. Gaya bahasa harus formal, padat, dan mudah dicerna pembaca awam. Cantumkan sumber berita di akhir artikel.

PENTING:
- Struktur paragraf harus rapi dan mudah dibaca
- Pastikan deskripsi kompatibel untuk dibagikan di website berita teknologi
- Hindari pengulangan informasi yang sama
- Jangan menyebutkan bahwa kamu AI atau menulis kata "ringkasan"`;
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
    // If we have article content and no Ollama, create a structured description
    if (content) {
      // Extract sentences from the content that seem important
      const sentences = content.split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 30); // Only use substantial sentences
      
      if (sentences.length > 0) {
        const hashtags = this.generateHashtags(title);
        
        // Create a structured news description
        let structuredContent = `${title}\n\n`;
        
        // Lead paragraph (2-3 sentences from beginning)
        if (sentences.length >= 2) {
          const leadSentences = sentences.slice(0, Math.min(3, sentences.length));
          structuredContent += leadSentences.map(s => s + '.').join(' ') + '\n\n';
        } else {
          structuredContent += sentences[0] + '.\n\n';
        }
        
        // Middle paragraph (action/impact)
        const middleIndex = Math.floor(sentences.length / 2);
        if (sentences.length > 4 && middleIndex < sentences.length) {
          const middleSentences = sentences.slice(
            middleIndex, 
            Math.min(middleIndex + 2, sentences.length)
          );
          structuredContent += middleSentences.map(s => s + '.').join(' ') + '\n\n';
        }
        
        // Additional information or details
        if (sentences.length > 6) {
          const detailSentences = sentences.slice(
            Math.min(middleIndex + 2, sentences.length - 2),
            Math.min(middleIndex + 4, sentences.length)
          );
          structuredContent += detailSentences.map(s => s + '.').join(' ') + '\n\n';
        }
        
        // Closing with source attribution
        structuredContent += `Sumber: ${source} ${hashtags}`;
        
        return structuredContent;
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
   * Generate a hook title for Gen Z audience based on article content
   */
  async generateHookTitle(title: string, content?: string): Promise<string> {
    try {
      // Try Ollama first for the Gen Z style title
      const ollamaEndpoint = process.env.OLLAMA_API_URL;
      
      if (ollamaEndpoint) {
        try {
          // If we have content, include it in the prompt for better context
          const promptText = content 
            ? `
Ubah judul berita berikut menjadi versi yang menarik perhatian Gen Z dan membuat penasaran.
Gunakan bahasa santai tapi tetap formal, untuk audience muda Indonesia.
Judul harus sesuai dengan konten artikel dan mencerminkan poin-poin utama artikel.

Judul asli:
"${title}"

Konten artikel:
${content?.substring(0, 500)}${content?.length > 500 ? '...' : ''}

Buatkan judul hook versi Gen Z (maksimal 15 kata):
`
            : `
Ubah judul berita berikut menjadi versi yang menarik perhatian Gen Z dan membuat penasaran. 
Gunakan bahasa santai tapi tetap formal, untuk audience muda Indonesia.

Judul asli:
"${title}"

Buatkan judul hook versi Gen Z (maksimal 15 kata):
`;
          
          const response = await fetch(`${ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "mistral", // or "llama2-chat" as suggested in specs
              prompt: promptText,
              stream: false,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.response && data.response.trim()) {
              return data.response.trim();
            }
          }
        } catch (error) {
          console.warn('Ollama API not available for hook title:', error);
        }
      }
      
      // Fallback to a manually generated catchy title
      return this.createHookTitle(title);
    } catch (error) {
      console.error('Error generating hook title:', error);
      throw new Error('Failed to generate hook title');
    }
  }
  
  /**
   * Create a hook title manually based on patterns for Gen Z
   */
  private createHookTitle(title: string): string {
    // Extract important words from the title
    const words = title.split(/\s+/).filter(word => word.length > 3);
    
    // Common Gen Z hook patterns
    const hookPatterns = [
      `${title}? Cek Dulu Gesss!`,
      `${title} - Ini Faktanya yang Bikin Ngakak!`,
      `Beneran Sih?! ${title}`,
      `OMG! ${title} Bikin Netizen Auto Heboh!`,
      `${title}. Gimana Menurut Lo?`,
      `Nggak Nyangka! ${title} Ternyata...`,
      `SERIUS! ${title} Yang Perlu Lo Tau`,
      `${title}. Emang Iya Sih?`,
      `${title} - Jangan Sampai Ketinggalan Info Ini!`,
      `${title}. Udah Tau Belum?`
    ];
    
    // Pick a pattern based on title length
    const patternIndex = title.length % hookPatterns.length;
    let generatedHook = hookPatterns[patternIndex];
    
    // If the hook becomes too long, use a simpler version
    if (generatedHook.length > 80) {
      return `${title}? Wajib Banget Cek Ini!`;
    }
    
    return generatedHook;
  }

  /**
   * Analyze comment to provide AI response if it contains critical thinking elements
   */
  async analyzeNewsComment(comment: string, articleTitle: string, articleContent?: string): Promise<{
    insight: string;
    followupQuestion: string;
    shouldRespond: boolean;
  }> {
    try {
      // Check if the comment contains critical thinking keywords
      const criticalKeywords = [
        'tapi', 'menurutku', 'menurut', 'gimana kalau', 'gimana kalo', 'bagaimana jika',
        'kenapa', 'kenapa gak', 'kenapa tidak', 'masalahnya', 'solusinya', 
        'sebenarnya', 'padahal', 'namun', 'mungkin', 'sepertinya', 'harusnya',
        'apakah', 'apakah benar', 'sebetulnya', 'apa iya', 'benarkah', 
        'bagaimana dengan', 'lebih baik', 'seharusnya'
      ];
      
      // Check if any critical keywords are present in the comment
      const containsCriticalThinking = criticalKeywords.some(keyword => 
        comment.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (!containsCriticalThinking) {
        return {
          insight: '',
          followupQuestion: '',
          shouldRespond: false
        };
      }
      
      // The comment contains critical thinking elements, generate a response
      const ollamaEndpoint = process.env.OLLAMA_API_URL;
      
      if (ollamaEndpoint) {
        try {
          // Construct a prompt that includes context about the article
          const contextPrompt = articleContent
            ? `
Kamu adalah AI penasaran yang hanya akan merespons ketika ada komentar kritis dan mengundang diskusi.

Artikel berjudul: "${articleTitle}"
Ringkasan artikel: ${articleContent?.substring(0, 200)}${articleContent?.length > 200 ? '...' : ''}

Komentar: "${comment}"

Tanggapi komentar itu dengan format JSON dengan 2 properti berikut:
1. insight: Perspektif baru atau insight tambahan (maksimal 2 kalimat, santai dan sesuai Gen Z)
2. followupQuestion: Pertanyaan lanjutan untuk memperdalam diskusi (1 kalimat saja)

Pastikan format tepat seperti ini:
{
  "insight": "insight kamu di sini",
  "followupQuestion": "pertanyaan lanjutan kamu di sini"
}
`
            : `
Kamu adalah AI penasaran yang hanya akan merespons ketika ada komentar kritis dan mengundang diskusi.

Artikel berjudul: "${articleTitle}"

Komentar: "${comment}"

Tanggapi komentar itu dengan format JSON dengan 2 properti berikut:
1. insight: Perspektif baru atau insight tambahan (maksimal 2 kalimat, santai dan sesuai Gen Z)
2. followupQuestion: Pertanyaan lanjutan untuk memperdalam diskusi (1 kalimat saja)

Pastikan format tepat seperti ini:
{
  "insight": "insight kamu di sini",
  "followupQuestion": "pertanyaan lanjutan kamu di sini"
}
`;
          
          const response = await fetch(`${ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "mistral", // or "llama2-chat" as suggested in specs
              prompt: contextPrompt,
              stream: false,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.response && data.response.trim()) {
              try {
                // Try to parse the JSON response
                let cleanedResponse = data.response.trim();
                
                // Ensure we're working with valid JSON by removing any text before or after the JSON object
                const jsonStartIndex = cleanedResponse.indexOf('{');
                const jsonEndIndex = cleanedResponse.lastIndexOf('}') + 1;
                
                if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
                  cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex);
                  const jsonData = JSON.parse(cleanedResponse);
                  
                  return {
                    insight: jsonData.insight || '',
                    followupQuestion: jsonData.followupQuestion || '',
                    shouldRespond: true
                  };
                }
              } catch (parseError) {
                console.error('Error parsing Ollama response as JSON:', parseError);
              }
            }
          }
        } catch (error) {
          console.warn('Ollama API not available for comment analysis:', error);
        }
      }
      
      // Fallback responses without Ollama
      return {
        insight: this.generateFallbackInsight(comment, articleTitle),
        followupQuestion: this.generateFallbackQuestion(comment, articleTitle),
        shouldRespond: true
      };
    } catch (error) {
      console.error('Error analyzing comment:', error);
      throw new Error('Failed to analyze comment');
    }
  }
  
  /**
   * Generate a fallback insight for a critical comment
   */
  private generateFallbackInsight(comment: string, articleTitle: string): string {
    const insights = [
      `Kamu bener banget! ${articleTitle} memang perlu dikaji lebih dalam lagi.`,
      `Perspektif kamu menarik nih. Banyak yang belum melihat dari sudut pandang ini.`,
      `Hmm, poin kritismu bikin aku mikir lebih jauh tentang implikasi ${articleTitle}.`,
      `Analisismu bener sih, tapi kayaknya masih ada faktor lain yang perlu dipertimbangkan juga.`,
      `Keren banget cara kamu mengkritisi berita ini! Bisa jadi input buat pengembangan ke depannya.`
    ];
    
    const randomIndex = Math.floor(Math.random() * insights.length);
    return insights[randomIndex];
  }
  
  /**
   * Generate a fallback follow-up question
   */
  private generateFallbackQuestion(comment: string, articleTitle: string): string {
    const questions = [
      `Menurut lo, solusi terbaik buat masalah ini apa ya?`,
      `Gimana cara kita ngatasin kendala yang lo sebutin itu?`,
      `Kalo lo jadi decision maker, langkah apa yang bakal lo ambil?`,
      `Ada contoh lain yang mirip dengan kasus ini yang lo tau?`,
      `Menurut lo, apa dampak jangka panjangnya buat industri teknologi?`
    ];
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
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

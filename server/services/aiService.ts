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
      genZStyle?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const { content, regenerate = false, customPrompt, genZStyle = false } = options;
      
      // For Gen-Z style, use a special prompt
      if (genZStyle) {
        const genZPrompt = this.createGenZPrompt(title, author, source, content);
        const ollamaResponse = await this.tryOllamaAPI(title, author, source, genZPrompt, content);
        if (ollamaResponse) {
          return ollamaResponse;
        }
        // Fall back to local Gen-Z style conversion if Ollama fails
        return this.createLocalGenZStyle(title, author, source, content);
      }
      
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

  /**
   * Create a prompt for Gen-Z style content
   */
  private createGenZPrompt(title: string, author: string, source: string, content?: string): string {
    return `Ubah judul artikel ini: "${title}" menjadi caption Instagram dengan gaya bahasa Gen-Z kekinian yang bikin penasaran dan WAJIB membuat orang membaca lebih lanjut.

Aturan pembuatan caption:
1. Gunakan bahasa Gen-Z Indonesia yang kekinian, gaul, tapi masih bisa dipahami (mix bahasa Indo-Inggris)
2. Tambahkan emoji yang cocok (maksimal 3-4 emoji)
3. Buat hook di awal yang bikin penasaran dan "clickbait" tapi tetap faktual
4. Sertakan frasa seperti "auto penasaran", "must-read", "gokil parah", "auto kepo"
5. Akhiri dengan 3-5 hashtag yang kekinian dan relevan dengan konten
6. Panjang caption harus 2-3 paragraf pendek saja
7. Jangan menyebutkan sumber berita, cukup katakan "cek link di bio"
8. Hindari formal, buat seperti teman sebaya bercerita

Yang WAJIB dihindari:
- Jangan terlalu formal atau seperti berita resmi
- Jangan berlebihan dalam penggunaan emoji
- Jangan mengubah fakta utama dari judul asli
- Jangan gunakan kata "artikel" atau "berita"

${content ? `
Informasi tambahan dari artikel:
${content.slice(0, 200)}...
` : ''}

Berikan caption akhir yang langsung bisa dipakai, tanpa menjelaskan proses pembuatannya.`;
  }

  /**
   * Create a local Gen-Z style if Ollama is not available
   */
  private createLocalGenZStyle(title: string, author: string, source: string, content?: string): string {
    // Extract the main topic from the title
    const mainTopic = title.split(' ').slice(0, 3).join(' ');
    
    // Gen-Z vocabulary and phrases
    const genZPhrases = [
      "Guys, ini seriusan bikin gue auto kepo! 🔥",
      "OMG! Fix banget ini bakal jadi trend! 🚀",
      "Nah lho? Udah pada tau belom? 👀",
      "Anjay! Ini sih wajib banget di-save! 💯",
      "WAIT- ini tuh beneran?! Gak bohong kan? 🤯",
      "Goks parahhh... gue auto shocked! 😱",
      "Yuk mari kita bahas yang lagi viral ini! 🔍",
      "Gak nyangka ini bakal kejadian... auto melongo! 👁️👄👁️",
    ];
    
    // Random Gen-Z expressions to use
    const genZExpressions = [
      "auto kepo",
      "gokil parah",
      "literally gak nyangka",
      "sumpah demi apa",
      "no debat ini wajib tau",
      "gak diragukan lagi",
      "literally mindblown",
      "auto save",
      "must-read banget",
      "skrg lagi viral",
    ];
    
    // Random ending phrases
    const endingPhrases = [
      "Penasaran? Cek link di bio ya guys!",
      "Swipe up di story atau cek link di bio for more info!",
      "Mau tau lebih lanjut? Tap link di bio sekarang!",
      "Full story di link bio, gas cek skrg!",
      "Yang penasaran, langsung aja cek link bio ya bestie!",
    ];
    
    // Select random phrases
    const openingPhrase = genZPhrases[Math.floor(Math.random() * genZPhrases.length)];
    const expression = genZExpressions[Math.floor(Math.random() * genZExpressions.length)];
    const endingPhrase = endingPhrases[Math.floor(Math.random() * endingPhrases.length)];
    
    // Create hashtags related to the topic plus some general Gen-Z ones
    const contentKeywords = this.extractKeywords(title);
    const genZHashtags = ["fyp", "viral", "trending", "updateterkini", "infopenting", "genZ"];
    const combinedHashtags = [...contentKeywords, ...genZHashtags.slice(0, 3)]
      .map(tag => `#${tag}`)
      .slice(0, 5)
      .join(" ");
    
    // Construct the Gen-Z style content
    const genZContent = `${openingPhrase} ${title} ini bikin ${expression}! 

Gue ${expression} banget pas tau tentang ${mainTopic}... Ini tuh bener-bener sesuatu yang bakal ubah cara pandang kita. Gak percaya? Just wait and see aja sih 💁‍♀️

${endingPhrase}

${combinedHashtags}`;
    
    return genZContent;
  }

  /**
   * Generate recommended critical comments based on article content
   */
  /**
   * Generate a hook title (Gen-Z style) from original title
   */
  async generateHookTitle(title: string): Promise<string> {
    try {
      // Create a prompt for generating a hook title
      const prompt = `Ubah judul berita berikut menjadi versi yang menarik perhatian Gen Z dan membuat penasaran. 
Gunakan bahasa santai tapi tetap formal, untuk audiens muda Indonesia.

Judul asli:
"${title}"

Judul hook versi Gen Z:`;

      // Try using Ollama API
      try {
        const ollamaEndpoint = process.env.OLLAMA_API_URL;
        
        if (ollamaEndpoint) {
          const response = await fetch(`${ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "mistral",
              prompt,
              stream: false,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.response.trim();
          }
        }
      } catch (error) {
        console.warn('Ollama API not available for hook title generation:', error);
      }
      
      // Fallback hook title generation if Ollama fails
      return this.createLocalHookTitle(title);
    } catch (error) {
      console.error('Error generating hook title:', error);
      return title; // Return original title as fallback
    }
  }

  /**
   * Create a local hook title if Ollama is not available
   */
  private createLocalHookTitle(title: string): string {
    // Common patterns for Gen-Z hooks
    const patterns = [
      `"${title}"? Cek Dulu Gesss!`,
      `OMG! ${title} Bikin Geger Netizen!`,
      `Auto Kaget! ${title} Ternyata...`,
      `${title}? Yakin Lo Udah Tau Faktanya?`,
      `Nggak Nyangka! ${title} Terungkap!`,
      `${title}? Ini Yang Sebenarnya Terjadi!`,
      `Gokil Sih! ${title} Jadi Trending!`,
      `${title} - Kok Bisa Sih?!`,
      `Fix! ${title} Bikin Penasaran`,
      `${title} - Benarkah Seheboh Itu?`
    ];
    
    // Choose a random pattern
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    return randomPattern;
  }

  /**
   * Generate recommended critical comments based on article content
   */
  async generateCriticalComment(title: string, content: string): Promise<string> {
    try {
      // First try using Ollama if available
      const ollamaEndpoint = process.env.OLLAMA_API_URL;
      
      if (ollamaEndpoint) {
        const prompt = `Buatkan komentar kritis yang menimbulkan diskusi berdasarkan artikel berikut:
Judul: ${title}

Konten: 
${content.slice(0, 500)}...

Aturan membuat komentar:
1. Komentar harus berdasarkan sudut pandang kritis namun tetap sopan
2. Fokus pada satu aspek kontroversial atau kurang dibahas dalam artikel
3. Berikan pertanyaan terbuka di akhir untuk memicu diskusi
4. Gunakan bahasa yang netral dan tidak provokatif
5. Panjang komentar antara 3-5 kalimat saja
6. Jangan menyebutkan bahwa ini adalah komentar buatan AI

Berikan komentar langsung tanpa penjelasan tambahan.`;

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
        
        if (response.ok) {
          const data = await response.json();
          return data.response;
        }
      }
      
      // Fallback to local comment generation if Ollama is unavailable
      return this.createLocalCriticalComment(title, content);
    } catch (error) {
      console.warn('Error generating critical comment:', error);
      return this.createLocalCriticalComment(title, content);
    }
  }

  /**
   * Create a critical comment locally if Ollama is not available
   */
  private createLocalCriticalComment(title: string, content: string): string {
    // Extract key terms from the title and content
    const titleTerms = title.toLowerCase().split(/\s+/);
    const contentSample = content.slice(0, 300).toLowerCase();
    
    // Critical perspectives to consider
    const criticalPerspectives = [
      {
        trigger: ['teknologi', 'digital', 'ai', 'artificial', 'intelligence', 'machine', 'learning'],
        comment: "Menarik artikelnya, tapi saya rasa dampak etis dari teknologi ini belum dibahas secara mendalam. Bagaimana dengan isu privasi dan potensi bias algoritma? Apakah kita sudah mempertimbangkan regulasi yang tepat untuk teknologi semacam ini?"
      },
      {
        trigger: ['startup', 'bisnis', 'ekonomi', 'investor', 'unicorn', 'digital', 'industri'],
        comment: "Artikel yang informatif, namun saya merasa ada celah analisis tentang keberlanjutan model bisnis ini dalam jangka panjang. Bagaimana dengan tantangan kompetisi global dan risiko investasi? Mungkinkah ini hanya tren sementara?"
      },
      {
        trigger: ['pendidikan', 'belajar', 'sekolah', 'mahasiswa', 'siswa', 'kuliah', 'pembelajaran'],
        comment: "Saya setuju dengan poin-poin utama artikel, tetapi aspek kesenjangan akses pendidikan antara daerah urban dan rural tidak disinggung. Bukankah ini akan semakin memperlebar kesenjangan digital? Bagaimana solusi konkretnya?"
      },
      {
        trigger: ['pemerintah', 'kebijakan', 'regulasi', 'aturan', 'hukum', 'undang-undang'],
        comment: "Artikel ini menyajikan informasi berharga, namun implementasi kebijakan semacam ini sering terhambat birokrasi. Apakah sudah ada kajian mengenai efektivitas kebijakan serupa di negara lain? Bagaimana dengan aspek penegakan hukumnya?"
      },
      {
        trigger: ['social media', 'sosial', 'media', 'platform', 'facebook', 'instagram', 'tiktok', 'twitter'],
        comment: "Pembahasan yang menarik, tetapi dampak psikologis dan pengaruh sosial media terhadap kesehatan mental masyarakat belum dibahas secara kritis. Bukankah kita perlu lebih berhati-hati dengan narasi 'kemajuan teknologi' tanpa melihat sisi negatifnya?"
      }
    ];
    
    // Find the most relevant critical perspective
    for (const perspective of criticalPerspectives) {
      // Check if any trigger word appears in title or content
      if (perspective.trigger.some(word => 
          titleTerms.includes(word) || contentSample.includes(word))) {
        return perspective.comment;
      }
    }
    
    // Default critical comment if no specific perspective matches
    return "Artikel ini menyajikan informasi yang cukup komprehensif, namun saya merasa aspek keberlanjutan dan dampak jangka panjangnya belum digali lebih dalam. Apakah sudah ada studi komparasi dengan pendekatan alternatif? Mungkin ada perspektif berbeda yang bisa melengkapi pembahasan ini?";
  }
}

export const aiService = new AIService();

import * as cheerio from 'cheerio';

// Interface for site-specific selectors
interface SiteSelector {
  title: string;
  author: string;
  content: string;
  image: string;
}

// Mapping of domain names to their readable source names
type SourceNameMap = {
  [key: string]: string;
};

class ArticleExtractor {
  // Domain-specific selectors for supported websites
  private readonly siteSelectors: Record<string, SiteSelector> = {
    // Indonesian tech news sites
    'tekno.kompas.com': {
      title: '.read__title',
      author: '.read__credit__item',
      content: '.read__content',
      image: '.photo__wrap img'
    },
    'inet.detik.com': {
      title: 'h1.detail__title',
      author: '.detail__author',
      content: '.detail__body-text',
      image: '.detail__media-image img'
    },
    'www.liputan6.com': {
      title: 'h1.article-header__title',
      author: '.article-header__author',
      content: '.article-content-body__item-content',
      image: '.article-photo-gallery__item img'
    },
    'www.cnnindonesia.com': {
      title: 'h1.title',
      author: '.author',
      content: '.detail-text',
      image: '.media-container img'
    },
    'tekno.tempo.co': {
      title: 'h1.title',
      author: '.reporter',
      content: '.detail-in',
      image: '.detail-img img'
    },
    'dailysocial.id': {
      title: 'h1.post-title',
      author: '.post-meta__author-name',
      content: '.post-content',
      image: '.post-featured-image img'
    },
    'teknoia.com': {
      title: 'h1.entry-title',
      author: '.entry-author',
      content: '.entry-content',
      image: '.featured-image img'
    },
    // International tech sites
    'www.theverge.com': {
      title: 'h1',
      author: '.byline span',
      content: '.article-body',
      image: 'picture img'
    },
    'techcrunch.com': {
      title: 'h1.article__title',
      author: '.article__byline-author',
      content: '.article-content',
      image: '.article__featured-image img'
    }
  };

  // Map domains to readable source names
  private readonly domainToSourceMap: SourceNameMap = {
    'tekno.kompas.com': 'Kompas Tekno',
    'inet.detik.com': 'Detik Inet',
    'www.liputan6.com': 'Liputan6',
    'www.cnnindonesia.com': 'CNN Indonesia',
    'tekno.tempo.co': 'Tempo Tekno',
    'dailysocial.id': 'DailySocial',
    'teknoia.com': 'Teknoia',
    'www.theverge.com': 'The Verge',
    'techcrunch.com': 'TechCrunch'
  };

  /**
   * Extract article data from a URL
   */
  async extract(url: string) {
    try {
      // Fetch the article page
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML
      const $ = cheerio.load(html);
      
      // Get domain from URL for site-specific extractions
      const domain = this.getDomainFromUrl(url);
      console.log('Detected domain:', domain);
      
      // Extract article data
      const title = this.extractTitle($, domain);
      const author = this.extractAuthor($, domain);
      const source = this.extractSource($, url, domain);
      const imageUrl = this.extractImage($, domain);
      const content = this.extractContent($, domain);
      
      return {
        title,
        author,
        source,
        imageUrl,
        content,
      };
    } catch (error) {
      console.error('Error extracting article:', error);
      throw new Error('Failed to extract article. Please check the URL and try again.');
    }
  }
  
  /**
   * Extract domain from URL
   */
  private getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return '';
    }
  }
  
  /**
   * Check if a domain has specific selectors
   */
  private hasSiteSelectors(domain: string): boolean {
    return domain in this.siteSelectors;
  }
  
  /**
   * Extract the article title
   */
  private extractTitle($: cheerio.CheerioAPI, domain?: string): string {
    // Check if we have domain-specific selectors
    if (domain && this.hasSiteSelectors(domain)) {
      const siteSelector = this.siteSelectors[domain];
      const title = $(siteSelector.title).first().text().trim();
      if (title && title.length > 0) {
        return title;
      }
    }
    
    // Try different common selectors for article titles
    const selectors = [
      'h1',
      'h1.article-title',
      'h1.entry-title',
      'h1.post-title',
      '.article-headline',
      '.headline',
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ];
    
    for (const selector of selectors) {
      const title = selector.startsWith('meta') 
        ? $(selector).attr('content')
        : $(selector).first().text().trim();
      
      if (title && title.length > 0) {
        return title;
      }
    }
    
    return 'Unknown Title';
  }
  
  /**
   * Extract the article author
   */
  private extractAuthor($: cheerio.CheerioAPI, domain?: string): string {
    // Check if we have domain-specific selectors
    if (domain && this.hasSiteSelectors(domain)) {
      const siteSelector = this.siteSelectors[domain];
      const author = $(siteSelector.author).first().text().trim();
      if (author && author.length > 0) {
        return author;
      }
    }
    
    // Try different common selectors for article authors
    const selectors = [
      '.author',
      '.byline',
      '.article-author',
      '.post-author',
      'meta[name="author"]',
      'meta[property="article:author"]',
      'a[rel="author"]',
    ];
    
    for (const selector of selectors) {
      const author = selector.startsWith('meta') 
        ? $(selector).attr('content')
        : $(selector).first().text().trim();
      
      if (author && author.length > 0) {
        return author;
      }
    }
    
    return 'Unknown Author';
  }
  
  /**
   * Extract the article source/publication
   */
  private extractSource($: cheerio.CheerioAPI, url: string, domain?: string): string {
    // If domain is in our map, return the source name directly
    if (domain && domain in this.domainToSourceMap) {
      return this.domainToSourceMap[domain];
    }
    
    // Try to get from meta tags
    const siteName = $('meta[property="og:site_name"]').attr('content');
    if (siteName) {
      return siteName;
    }
    
    // Try to get from structured data
    const structuredData = $('script[type="application/ld+json"]').text();
    if (structuredData) {
      try {
        const data = JSON.parse(structuredData);
        if (data?.publisher?.name) {
          return data.publisher.name;
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    // Extract from domain name
    try {
      const domain = new URL(url).hostname;
      return domain
        .replace(/^www\./, '')
        .split('.')
        .slice(0, -1)
        .join('.')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } catch (error) {
      return 'Unknown Source';
    }
  }
  
  /**
   * Extract the article featured image
   */
  private extractImage($: cheerio.CheerioAPI, domain?: string): string | null {
    // Check if we have domain-specific selectors
    if (domain && this.hasSiteSelectors(domain)) {
      const siteSelector = this.siteSelectors[domain];
      const img = $(siteSelector.image).first().attr('src') || 
                 $(siteSelector.image).first().attr('data-src');
      
      if (img) {
        // Make sure the URL is absolute
        if (img.startsWith('http')) {
          return img;
        } else if (img.startsWith('//')) {
          return `https:${img}`;
        }
      }
    }
    
    // Try different common selectors for article images
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      '.featured-image img',
      '.article-featured-image img',
      '.post-thumbnail img',
      'article img',
      '.entry-content img',
    ];
    
    for (const selector of selectors) {
      const img = selector.startsWith('meta') 
        ? $(selector).attr('content')
        : $(selector).first().attr('src') || $(selector).first().attr('data-src');
      
      if (img) {
        // Make sure the URL is absolute
        if (img.startsWith('http')) {
          return img;
        } else if (img.startsWith('//')) {
          return `https:${img}`;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Extract the article content
   */
  private extractContent($: cheerio.CheerioAPI, domain?: string): string {
    let content = '';
    
    // Check if we have domain-specific selectors
    if (domain && this.hasSiteSelectors(domain)) {
      const siteSelector = this.siteSelectors[domain];
      const contentSelector = siteSelector.content;
      const articleElement = $(contentSelector).first();
      
      if (articleElement.length) {
        // Remove common non-content elements
        articleElement.find('script, style, iframe, .social-share, .related-posts, .comments, .author-box, .navigation, footer, header, nav, aside, .sidebar, .ads, .advertisement').remove();
        
        // Extract all paragraphs
        const paragraphs = articleElement.find('p');
        if (paragraphs.length > 0) {
          paragraphs.each((_, elem) => {
            const text = $(elem).text().trim();
            if (text.length > 20) { // Only include substantial paragraphs
              content += text + '\n\n';
            }
          });
          
          if (content) {
            return content.trim();
          }
        }
        
        // Fallback: get all text from the article element if no paragraphs found
        content = articleElement.text().trim().replace(/\s+/g, ' ');
        return content;
      }
    }
    
    // If no domain-specific content or it didn't work, try generic selectors
    const selectors = [
      'article',
      '.article-content',
      '.entry-content',
      '.post-content',
      '.content',
      'main',
      '#content',
      '[itemprop="articleBody"]'
    ];
    
    for (const selector of selectors) {
      const articleElement = $(selector).first();
      
      if (articleElement.length) {
        // Remove common non-content elements
        articleElement.find('script, style, iframe, .social-share, .related-posts, .comments, .author-box, .navigation, footer, header, nav, aside, .sidebar, .ads, .advertisement').remove();
        
        // Extract all paragraphs
        const paragraphs = articleElement.find('p');
        if (paragraphs.length > 0) {
          paragraphs.each((_, elem) => {
            const text = $(elem).text().trim();
            if (text.length > 20) { // Only include substantial paragraphs
              content += text + '\n\n';
            }
          });
        } else {
          // Fallback: get all text from the article element
          content = articleElement.text().trim().replace(/\s+/g, ' ');
        }
        
        break;
      }
    }
    
    // If we couldn't find content with specific selectors, try to get all paragraphs
    if (!content) {
      const paragraphs = $('p');
      paragraphs.each((_, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 20) { // Only include substantial paragraphs
          content += text + '\n\n';
        }
      });
    }
    
    return content.trim();
  }
}

export const articleExtractor = new ArticleExtractor();
import * as cheerio from 'cheerio';

class ArticleExtractor {
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
      
      // Extract article data
      const title = this.extractTitle($);
      const author = this.extractAuthor($);
      const source = this.extractSource($, url);
      const imageUrl = this.extractImage($);
      
      return {
        title,
        author,
        source,
        imageUrl,
      };
    } catch (error) {
      console.error('Error extracting article:', error);
      throw new Error('Failed to extract article. Please check the URL and try again.');
    }
  }
  
  /**
   * Extract the article title
   */
  private extractTitle($: cheerio.CheerioAPI): string {
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
  private extractAuthor($: cheerio.CheerioAPI): string {
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
  private extractSource($: cheerio.CheerioAPI, url: string): string {
    // Try to get from meta tags first
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
  private extractImage($: cheerio.CheerioAPI): string | null {
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
        : $(selector).first().attr('src');
      
      if (img) {
        // Make sure the URL is absolute
        if (img.startsWith('http')) {
          return img;
        } else if (img.startsWith('//')) {
          return `https:${img}`;
        }
        // We could handle relative URLs here but would need the base URL
      }
    }
    
    return null;
  }
}

export const articleExtractor = new ArticleExtractor();

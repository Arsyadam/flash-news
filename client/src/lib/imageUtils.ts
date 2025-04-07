/**
 * Detect if a URL is likely to have CORS issues based on common patterns
 */
export function mightHaveCorsIssues(url: string): boolean {
  if (!url) return false;
  
  // Common domains that often have CORS restrictions
  const problematicDomains = [
    'kompas.com',
    'detik.com',
    'liputan6.com',
    'cnnindonesia.com',
    'tempo.co',
    'akamaized.net',
    'cloudfront.net',
    'its.ac.id',
    'amazonaws.com'
  ];
  
  // Check if the URL contains any of the problematic domains
  return problematicDomains.some(domain => url.includes(domain));
}

/**
 * Convert a potentially problematic image URL to a proxied URL
 */
export function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  
  // Don't proxy data URLs or relative URLs
  if (url.startsWith('data:') || !url.startsWith('http')) {
    return url;
  }
  
  // Always proxy external images to prevent CORS issues
  // This ensures consistent behavior across different domains
  return `/api/image/proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Process an image URL from an article to handle potential CORS issues
 * This function decides whether to proxy the image or use it directly
 */
export function processImageUrl(url: string | null): string | null {
  if (!url) return null;
  return getProxiedImageUrl(url);
}
import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { URL } from 'url';

const router = Router();

/**
 * Proxy route for images to handle CORS issues
 * This proxies an image from the original URL and sends it back to the client
 */
router.get('/proxy', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing image URL' });
  }
  
  try {
    // Validate the URL
    const parsedUrl = new URL(imageUrl);
    
    // Add common headers to bypass some restrictions
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Referer': parsedUrl.origin,
    };
    
    // Fetch the image
    const response = await fetch(imageUrl, { headers });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
    }
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Stream the image data back to the client
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Get buffer and send as response
    const buffer = await response.buffer();
    res.send(buffer);
    
  } catch (error) {
    console.error('Error fetching image:', error);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
});

export default router;
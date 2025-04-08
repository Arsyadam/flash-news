import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';

const router = Router();

/**
 * Generate an AI-powered description for an article
 */
router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    const { title, author, source, content } = req.body;
    
    if (!title || !author || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const description = await aiService.generateDescription(title, author, source, { content });
    
    res.json({ content: description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

/**
 * Generate a catchy "hook" title for Gen Z audience
 */
router.post('/hook-title', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Missing title field' });
    }
    
    const hookTitle = await aiService.generateHookTitle(title);
    
    res.json({ hookTitle });
  } catch (error) {
    console.error('Error generating hook title:', error);
    res.status(500).json({ error: 'Failed to generate hook title' });
  }
});

export default router;
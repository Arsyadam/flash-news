import express from 'express';
import { articleExtractor } from '../services/articleExtractor';
import { z } from 'zod';

const router = express.Router();

// URL validation schema
const extractSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

// Extract article from URL
router.post('/extract', async (req, res) => {
  try {
    // Validate the request body
    const { url } = extractSchema.parse(req.body);
    
    // Extract article data
    const articleData = await articleExtractor.extract(url);
    
    res.json(articleData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

export default router;

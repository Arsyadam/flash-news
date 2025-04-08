import express from 'express';
import { aiService } from '../services/aiService';
import { z } from 'zod';

const router = express.Router();

// Description generation schema
const descriptionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  source: z.string().optional(),
  content: z.string().optional(),
  regenerate: z.boolean().optional(),
  customPrompt: z.string().optional(),
});

// Generate description based on article metadata
router.post('/generate-description', async (req, res) => {
  try {
    // Validate the request body
    const { title, author, source, content, regenerate, customPrompt } = descriptionSchema.parse(req.body);
    
    // Generate description
    const description = await aiService.generateDescription(title, author, source, {
      content,
      regenerate,
      customPrompt
    });
    
    res.json({ content: description });
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

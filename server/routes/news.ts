import express from 'express';
import { newsService } from '../services/newsService';
import { z } from 'zod';

const router = express.Router();

// Recommendations schema
const recommendationsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

// Get recommendations based on article title
router.post('/recommendations', async (req, res) => {
  try {
    // Validate the request body
    const { title } = recommendationsSchema.parse(req.body);
    
    // Get recommendations
    const recommendations = await newsService.getRecommendations(title);
    
    res.json(recommendations);
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

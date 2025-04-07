import express from 'express';
import articleRouter from './article';
import aiRouter from './ai';
import newsRouter from './news';

const router = express.Router();

// Register all routes with prefixes
router.use('/article', articleRouter);
router.use('/ai', aiRouter);
router.use('/news', newsRouter);

export default router;

// Import necessary modules and types
import express from 'express';
import { readLogs } from '../controllers/logController';

const router = express.Router();

router.post('/read', readLogs);

export default router;
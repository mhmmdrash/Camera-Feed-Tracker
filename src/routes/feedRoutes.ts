// Import necessary modules and types
import express from 'express';
import { createFeed, readFeed, updateFeed, deleteFeed, giveAccessToFeed } from '../controllers/feedController';

const router = express.Router();

// router.post('/create/admin', createUser)
router.post('/create', createFeed)

// router.post('/read/admin', readUser)
router.post('/read', readFeed)

// router.post('/update/admin', updateUser)
router.post('/update', updateFeed)

// router.post('/delete/admin', deleteUser)
router.post('/delete', deleteFeed)

router.post('/giveAccess', giveAccessToFeed)

export default router;
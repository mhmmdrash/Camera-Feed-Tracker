// Import necessary modules and types
import express from 'express';
import { createUser, updateUser, readUser, deleteUser } from '../controllers/userController';

const router = express.Router();

// router.post('/create/admin', createUser)
router.post('/create', createUser)

// router.post('/read/admin', readUser)
router.post('/read', readUser)

// router.post('/update/admin', updateUser)
router.post('/update', updateUser)

// router.post('/delete/admin', deleteUser)
router.post('/delete', deleteUser)

export default router;
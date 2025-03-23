import express, { Router, RequestHandler } from 'express';
import tagController from '../controllers/tagController';

/**
 * router: /api/tags
 */
const router: Router = express.Router();

// Get all tags
router.get('/', tagController.getAllTags as RequestHandler);

// Get active tags
router.get('/active', tagController.getActiveTags as RequestHandler);

// Get system tags
router.get('/system', tagController.getSystemTags as RequestHandler);

// Get a tag by ID
router.get('/:id', tagController.getTagById as RequestHandler);

// Get user-specific tags
router.get('/user/:userId', tagController.getUserTags as RequestHandler);

// Get all available tags for a user
router.get('/available/:userId', tagController.getAvailableTagsForUser as RequestHandler);

// Create a new tag
router.post('/', tagController.createTag as RequestHandler);

// Update a tag
router.put('/:id', tagController.updateTag as RequestHandler);

// Deactivate a tag
router.delete('/:id', tagController.deactivateTag as RequestHandler);

export default router;

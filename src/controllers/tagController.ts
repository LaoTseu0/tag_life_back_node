import { Request, Response } from 'express';
import tagRepository from '../dal/tagRepository';

interface TagController {
  getAllTags: (req: Request, res: Response) => Promise<void>;
  getActiveTags: (req: Request, res: Response) => Promise<void>;
  getSystemTags: (req: Request, res: Response) => Promise<void>;
  getTagById: (req: Request, res: Response) => Promise<void>;
  getUserTags: (req: Request, res: Response) => Promise<void>;
  getAvailableTagsForUser: (req: Request, res: Response) => Promise<void>;
  getUserFavoriteTags: (req: Request, res: Response) => Promise<void>;
  addTagToFavorites: (req: Request, res: Response) => Promise<void>;
  removeTagFromFavorites: (req: Request, res: Response) => Promise<void>;
  isTagFavorite: (req: Request, res: Response) => Promise<void>;
  createTag: (req: Request, res: Response) => Promise<void>;
  updateTag: (req: Request, res: Response) => Promise<void>;
  deactivateTag: (req: Request, res: Response) => Promise<void>;
}

const tagController: TagController = {
  /**
   * Get all tags
   * @param req - The request object
   * @param res - The response object
   */
  getAllTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await tagRepository.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error('Error retrieving tags:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get all active tags
   * @param req - The request object
   * @param res - The response object
   */
  getActiveTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await tagRepository.getActiveTags();
      res.json(tags);
    } catch (error) {
      console.error('Error retrieving active tags:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get all system tags
   * @param req - The request object
   * @param res - The response object
   */
  getSystemTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await tagRepository.getSystemTags();
      res.json(tags);
    } catch (error) {
      console.error('Error retrieving system tags:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get a tag by ID
   * @param req - The request object
   * @param res - The response object
   */
  getTagById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const tag = await tagRepository.getTagById(id);
      if (!tag) {
        res.status(404).json({ error: 'Tag not found' });
        return;
      }
      res.json(tag);
    } catch (error) {
      console.error(`Error retrieving tag ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get all user tags
   * @param req - The request object
   * @param res - The response object
   */
  getUserTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tags = await tagRepository.getUserTags(userId);
      res.json(tags);
    } catch (error) {
      console.error(`Error retrieving user tags for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get all available tags for a user
   * @param req - The request object
   * @param res - The response object
   */
  getAvailableTagsForUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tags = await tagRepository.getAvailableTagsForUser(userId);
      res.json(tags);
    } catch (error) {
      console.error(`Error retrieving available tags for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get all user favorite tags
   * @param req - The request object
   * @param res - The response object
   */
  getUserFavoriteTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tags = await tagRepository.getUserFavoriteTags(userId);
      res.json(tags);
    } catch (error) {
      console.error(`Error retrieving user favorite tags for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Create a new tag
   * @param req - The request object
   * @param res - The response object
   */
  createTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, color, userId } = req.body;
      const newTag = await tagRepository.createTag(name, color, userId);
      res.status(201).json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Update a tag
   * @param req - The request object
   * @param res - The response object
   */
  updateTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { name, color, userId } = req.body;
      const updatedTag = await tagRepository.updateTag(id, name, color, userId);
      if (!updatedTag) {
        res.status(404).json({ error: 'Tag not found' });
        return;
      }
      res.json(updatedTag);
    } catch (error) {
      console.error(`Error updating tag ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Deactivate a tag
   * @param req - The request object
   * @param res - The response object
   */
  deactivateTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      await tagRepository.deactivateTag(id, userId);
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting tag ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Add a tag to favorites
   * @param req - The request object
   * @param res - The response object
   */
  addTagToFavorites: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tagId = parseInt(req.params.tagId);
      const result = await tagRepository.addTagToFavorites(userId, tagId);
      res.status(201).json(result);
    } catch (error) {
      console.error(
        `Error adding tag ${req.params.tagId} to favorites for user ${req.params.userId}:`,
        error
      );
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Remove a tag from favorites
   * @param req - The request object
   * @param res - The response object
   */
  removeTagFromFavorites: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tagId = parseInt(req.params.tagId);
      const result = await tagRepository.removeTagFromFavorites(userId, tagId);
      res.status(204).end();
    } catch (error) {
      console.error(
        `Error removing tag ${req.params.tagId} from favorites for user ${req.params.userId}:`,
        error
      );
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Check if a tag is a favorite
   * @param req - The request object
   * @param res - The response object
   */
  isTagFavorite: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const tagId = parseInt(req.params.tagId);
      const result = await tagRepository.isTagFavorite(userId, tagId);
      res.json(result);
    } catch (error) {
      console.error(
        `Error checking if tag ${req.params.tagId} is a favorite for user ${req.params.userId}:`,
        error
      );
      res.status(500).json({ error: 'Server error' });
    }
  },
};

export default tagController;

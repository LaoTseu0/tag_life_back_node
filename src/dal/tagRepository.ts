import db from '../db/db';
import { Tag } from '../types';

interface TagWithSystem extends Tag {
  is_system: boolean;
  is_active: boolean;
  created_by: number;
  color?: string;
}

interface TagRepository {
  getAllTags: () => Promise<TagWithSystem[]>;
  getActiveTags: () => Promise<TagWithSystem[]>;
  getTagById: (tagId: number) => Promise<TagWithSystem | undefined>;
  getSystemTags: () => Promise<TagWithSystem[]>;
  getUserTags: (userId: number) => Promise<TagWithSystem[]>;
  getAvailableTagsForUser: (userId: number) => Promise<TagWithSystem[]>;
  getUserFavoriteTags: (userId: number) => Promise<TagWithSystem[]>;
  addTagToFavorites: (userId: number, tagId: number) => Promise<boolean>;
  removeTagFromFavorites: (userId: number, tagId: number) => Promise<boolean>;
  isTagFavorite: (userId: number, tagId: number) => Promise<boolean>;
  createTag: (name: string, color: string, userId: number) => Promise<TagWithSystem>;
  updateTag: (tagId: number, name: string, color: string, userId: number) => Promise<TagWithSystem>;
  deactivateTag: (tagId: number, userId: number) => Promise<TagWithSystem>;
}

const tagRepository: TagRepository = {
  /**
   * Get all tags without filtering
   * @returns all tags
   */
  getAllTags: async (): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>('SELECT * FROM tags');
    return result.rows;
  },

  /**
   * Get all active tags
   * @returns all active tags
   */
  getActiveTags: async (): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>('SELECT * FROM tags WHERE is_active = TRUE');
    return result.rows;
  },

  /**
   * Get a single tag by ID
   * @param tagId - The ID of the tag to get
   * @returns the tag with the given ID
   */
  getTagById: async (tagId: number): Promise<TagWithSystem | undefined> => {
    const result = await db.query<TagWithSystem>('SELECT * FROM tags WHERE tag_id = $1', [tagId]);
    return result.rows[0];
  },

  /**
   * Get all system tags (predefined)
   * @returns all system tags
   */
  getSystemTags: async (): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>('SELECT * FROM tags WHERE is_system = TRUE');
    return result.rows;
  },

  /**
   * Get user-created tags
   * @param userId - The ID of the user to get tags for
   * @returns all user-created tags
   */
  getUserTags: async (userId: number): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>(
      'SELECT * FROM tags WHERE created_by = $1 AND is_system = FALSE',
      [userId]
    );
    return result.rows;
  },

  /**
   * Get all tags available to a user (system tags + user's own tags)
   * @param userId - The ID of the user to get tags for
   * @returns all tags available to the user
   */
  getAvailableTagsForUser: async (userId: number): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>(
      'SELECT * FROM user_available_tags WHERE is_system = TRUE OR created_by = $1',
      [userId]
    );
    return result.rows;
  },

  /**
   * Get user's favorite tags
   * @param userId - The ID of the user to get tags for
   * @returns all user's favorite tags
   */
  getUserFavoriteTags: async (userId: number): Promise<TagWithSystem[]> => {
    const result = await db.query<TagWithSystem>(
      'SELECT t.* FROM tags t ' +
        'JOIN user_favorite_tags uft ON t.tag_id = uft.tag_id ' +
        'WHERE uft.user_id = $1 AND t.is_active = TRUE',
      [userId]
    );
    return result.rows;
  },

  /**
   * Create a new user tag
   * @param name - The name of the tag
   * @param color - The color of the tag
   * @param userId - The ID of the user to create the tag for
   * @returns the created tag
   */
  createTag: async (name: string, color: string, userId: number): Promise<TagWithSystem> => {
    const result = await db.query<TagWithSystem>(
      'INSERT INTO tags (name, color, created_by, is_system, is_active) ' +
        'VALUES ($1, $2, $3, FALSE, TRUE) RETURNING *',
      [name, color, userId]
    );
    return result.rows[0];
  },

  /**
   * Update an existing tag
   * @param tagId - The ID of the tag to update
   * @param name - The name of the tag
   * @param color - The color of the tag
   * @param userId - The ID of the user to update the tag for
   * @returns the updated tag
   */
  updateTag: async (
    tagId: number,
    name: string,
    color: string,
    userId: number
  ): Promise<TagWithSystem> => {
    // First verify the user owns this tag
    const tagCheck = await db.query<TagWithSystem>(
      'SELECT * FROM tags WHERE tag_id = $1 AND created_by = $2 AND is_system = FALSE',
      [tagId, userId]
    );

    if (tagCheck.rows.length === 0) {
      throw new Error("Tag not found or you don't have permission to update it");
    }

    const result = await db.query<TagWithSystem>(
      'UPDATE tags SET name = $1, color = $2 WHERE tag_id = $3 RETURNING *',
      [name, color, tagId]
    );
    return result.rows[0];
  },

  /**
   * Deactivate a tag (logical delete)
   * @param tagId - The ID of the tag to deactivate
   * @param userId - The ID of the user to deactivate the tag for
   * @returns the deactivated tag
   */
  deactivateTag: async (tagId: number, userId: number): Promise<TagWithSystem> => {
    // First verify the user owns this tag and it's not a system tag
    const tagCheck = await db.query<TagWithSystem>(
      'SELECT * FROM tags WHERE tag_id = $1 AND created_by = $2 AND is_system = FALSE',
      [tagId, userId]
    );

    if (tagCheck.rows.length === 0) {
      throw new Error("Tag not found or you don't have permission to deactivate it");
    }

    const result = await db.query<TagWithSystem>(
      'UPDATE tags SET is_active = FALSE WHERE tag_id = $1 RETURNING *',
      [tagId]
    );
    return result.rows[0];
  },

  /**
   * Add a tag to user's favorites
   * @param userId - The ID of the user to add the tag to favorites for
   * @param tagId - The ID of the tag to add to favorites
   * @returns true if the tag was added to favorites, false if it already exists
   */
  addTagToFavorites: async (userId: number, tagId: number): Promise<boolean> => {
    try {
      await db.query('INSERT INTO user_favorite_tags (user_id, tag_id) VALUES ($1, $2)', [
        userId,
        tagId,
      ]);
      return true;
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        // Duplicate key error
        return false;
      }
      throw error;
    }
  },

  /**
   * Remove a tag from user's favorites
   * @param userId - The ID of the user to remove the tag from favorites for
   * @param tagId - The ID of the tag to remove from favorites
   * @returns true if the tag was removed from favorites, false if it was not in favorites
   */
  removeTagFromFavorites: async (userId: number, tagId: number): Promise<boolean> => {
    const result = await db.query(
      'DELETE FROM user_favorite_tags WHERE user_id = $1 AND tag_id = $2',
      [userId, tagId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  /**
   * Check if a tag is in user's favorites
   * @param userId - The ID of the user to check if the tag is in favorites for
   * @param tagId - The ID of the tag to check if it is in favorites
   * @returns true if the tag is in favorites, false otherwise
   */
  isTagFavorite: async (userId: number, tagId: number): Promise<boolean> => {
    const result = await db.query(
      'SELECT 1 FROM user_favorite_tags WHERE user_id = $1 AND tag_id = $2',
      [userId, tagId]
    );
    return result.rows.length > 0;
  },
};

export default tagRepository;

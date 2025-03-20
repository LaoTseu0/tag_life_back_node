const db = require("../db/db");

const tagRepository = {
  // Get all tags without filtering
  getAllTags: async () => {
    const result = await db.query("SELECT * FROM tags");
    return result.rows;
  },

  // Get all active tags
  getActiveTags: async () => {
    const result = await db.query("SELECT * FROM tags WHERE is_active = TRUE");
    return result.rows;
  },

  // Get a single tag by ID
  getTagById: async (tagId) => {
    const result = await db.query("SELECT * FROM tags WHERE tag_id = $1", [
      tagId,
    ]);
    return result.rows[0];
  },

  // Get all system tags (predefined)
  getSystemTags: async () => {
    const result = await db.query("SELECT * FROM tags WHERE is_system = TRUE");
    return result.rows;
  },

  // Get user-created tags
  getUserTags: async (userId) => {
    const result = await db.query(
      "SELECT * FROM tags WHERE created_by = $1 AND is_system = FALSE",
      [userId]
    );
    return result.rows;
  },

  // Get all tags available to a user (system tags + user's own tags)
  getAvailableTagsForUser: async (userId) => {
    const result = await db.query(
      "SELECT * FROM user_available_tags WHERE is_system = TRUE OR created_by = $1",
      [userId]
    );
    return result.rows;
  },

  // Get user's favorite tags
  getUserFavoriteTags: async (userId) => {
    const result = await db.query(
      "SELECT t.* FROM tags t " +
        "JOIN user_favorite_tags uft ON t.tag_id = uft.tag_id " +
        "WHERE uft.user_id = $1 AND t.is_active = TRUE",
      [userId]
    );
    return result.rows;
  },

  // Create a new user tag
  createTag: async (name, color, userId) => {
    const result = await db.query(
      "INSERT INTO tags (name, color, created_by, is_system, is_active) " +
        "VALUES ($1, $2, $3, FALSE, TRUE) RETURNING *",
      [name, color, userId]
    );
    return result.rows[0];
  },

  // Update an existing tag
  updateTag: async (tagId, name, color, userId) => {
    // First verify the user owns this tag
    const tagCheck = await db.query(
      "SELECT * FROM tags WHERE tag_id = $1 AND created_by = $2 AND is_system = FALSE",
      [tagId, userId]
    );

    if (tagCheck.rows.length === 0) {
      throw new Error(
        "Tag not found or you don't have permission to update it"
      );
    }

    const result = await db.query(
      "UPDATE tags SET name = $1, color = $2 WHERE tag_id = $3 RETURNING *",
      [name, color, tagId]
    );
    return result.rows[0];
  },

  // Deactivate a tag (logical delete)
  deactivateTag: async (tagId, userId) => {
    // First verify the user owns this tag and it's not a system tag
    const tagCheck = await db.query(
      "SELECT * FROM tags WHERE tag_id = $1 AND created_by = $2 AND is_system = FALSE",
      [tagId, userId]
    );

    if (tagCheck.rows.length === 0) {
      throw new Error(
        "Tag not found or you don't have permission to deactivate it"
      );
    }

    const result = await db.query(
      "UPDATE tags SET is_active = FALSE WHERE tag_id = $1 RETURNING *",
      [tagId]
    );
    return result.rows[0];
  },

  // Add a tag to user's favorites
  addTagToFavorites: async (userId, tagId) => {
    try {
      await db.query(
        "INSERT INTO user_favorite_tags (user_id, tag_id) VALUES ($1, $2)",
        [userId, tagId]
      );
      return true;
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        // Duplicate key error
        return false;
      }
      throw error;
    }
  },

  // Remove a tag from user's favorites
  removeTagFromFavorites: async (userId, tagId) => {
    const result = await db.query(
      "DELETE FROM user_favorite_tags WHERE user_id = $1 AND tag_id = $2",
      [userId, tagId]
    );
    return result.rowCount > 0;
  },

  // Check if a tag is in user's favorites
  isTagFavorite: async (userId, tagId) => {
    const result = await db.query(
      "SELECT 1 FROM user_favorite_tags WHERE user_id = $1 AND tag_id = $2",
      [userId, tagId]
    );
    return result.rows.length > 0;
  },
};

module.exports = tagRepository;

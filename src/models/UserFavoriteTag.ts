/**
 * UserFavoriteTag Model
 * Representation of the UserFavoriteTags table in the database
 * Stores tags marked as favorite by users for quick access
 */
export interface UserFavoriteTag {
  user_id: number; // Reference to Users(user_id)
  tag_id: number; // Reference to Tags(tag_id)
  created_at: Date;
}

/**
 * Model for creating a new user favorite tag
 */
export interface CreateUserFavoriteTagInput {
  user_id: number;
  tag_id: number;
}

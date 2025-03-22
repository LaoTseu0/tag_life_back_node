/**
 * UserAvailableTag Model
 * Representation of the user_available_tags view in the database
 * Lists active tags available to a user, with indication of favorites
 */
export interface UserAvailableTag {
  tag_id: number;
  name: string;
  color: string | null;
  is_system: boolean; // Whether this is a system tag (true) or user-created tag (false)
  created_by: number | null; // User ID who created the tag, null for system tags
  is_favorite: boolean; // Whether this tag is marked as favorite by the user
}

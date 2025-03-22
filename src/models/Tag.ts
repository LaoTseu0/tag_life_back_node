/**
 * Tag Model
 * Representation of the Tags table in the database
 * Stores expense categories with distinction between system tags and custom tags
 */
export interface Tag {
  tag_id: number;
  name: string;
  color: string | null;
  created_by: number | null; // User ID who created the tag, null for system tags
  is_system: boolean; // Indicates if tag is predefined (true) or user-created (false)
  is_active: boolean; // Indicates if tag is active (true) or disabled (false)
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation rules:
 * 1. A system tag must not have a creator (created_by must be null)
 * 2. A user tag must have a creator (created_by must not be null)
 * 3. A system tag must always be active
 */

/**
 * Model for creating a new tag
 */
export interface CreateTagInput {
  name: string;
  color?: string;
  created_by: number | null; // Must be null for system tags
  is_system: boolean;
}

/**
 * Model for updating a tag
 */
export interface UpdateTagInput {
  name?: string;
  color?: string;
  is_active?: boolean; // Cannot set to false for system tags
}

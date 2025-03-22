/**
 * User Model
 * Representation of the Users table in the database
 */
export interface User {
  user_id: number;
  email: string; // Unique email address
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean; // Default: true
}

/**
 * Model for creating a new user
 */
export interface CreateUserInput {
  email: string;
  password_hash: string;
}

/**
 * Model for updating a user
 */
export interface UpdateUserInput {
  email?: string;
  password_hash?: string;
  is_active?: boolean;
}

import db from '../db/db';
import { User, UserInput } from '../types';

// Fonctions pour accéder aux données des utilisateurs
const userRepository = {
  // Récupérer tous les utilisateurs
  getAllUsers: async (): Promise<User[]> => {
    try {
      const result = await db.query<User>('SELECT * FROM users');
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (id: number): Promise<User | undefined> => {
    try {
      const result = await db.query<User>('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  createUser: async (userData: UserInput): Promise<User> => {
    const { email, password_hash } = userData;
    console.log('[UserRepository] createUser', userData);
    try {
      const result = await db.query<User>(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
        [email, password_hash]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création d'un utilisateur:", error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur existant
  updateUser: async (id: number, userData: UserInput): Promise<User | undefined> => {
    const { email, password_hash } = userData;
    try {
      const result = await db.query<User>(
        'UPDATE users SET email = $1, password_hash = $2 WHERE id = $3 RETURNING *',
        [email, password_hash, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (id: number): Promise<{ success: boolean }> => {
    try {
      await db.query('DELETE FROM users WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },
};

export default userRepository;

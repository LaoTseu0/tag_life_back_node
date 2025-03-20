const db = require("../db/db");

// Fonctions pour accéder aux données des utilisateurs
const userRepository = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const result = await db.query("SELECT * FROM users");
      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (id) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  createUser: async (userData) => {
    const { nom, prenom, email } = userData;
    try {
      const result = await db.query(
        "INSERT INTO users (nom, prenom, email) VALUES ($1, $2, $3) RETURNING *",
        [nom, prenom, email]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création d'un utilisateur:", error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur existant
  updateUser: async (id, userData) => {
    const { nom, prenom, email } = userData;
    try {
      const result = await db.query(
        "UPDATE users SET nom = $1, prenom = $2, email = $3 WHERE id = $4 RETURNING *",
        [nom, prenom, email, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    try {
      await db.query("DELETE FROM users WHERE id = $1", [id]);
      return { success: true };
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  },
};

module.exports = userRepository;

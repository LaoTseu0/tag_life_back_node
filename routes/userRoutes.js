const express = require("express");
const router = express.Router();
const userRepository = require("../dal/userRepository");

// GET tous les utilisateurs
router.get("/api/users", async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET un utilisateur par ID
router.get("/api/users/:id", async (req, res) => {
  try {
    const user = await userRepository.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST créer un nouvel utilisateur
router.post("/api/users", async (req, res) => {
  try {
    const newUser = await userRepository.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT mettre à jour un utilisateur
router.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await userRepository.updateUser(
      req.params.id,
      req.body
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE supprimer un utilisateur
router.delete("/api/users/:id", async (req, res) => {
  try {
    await userRepository.deleteUser(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const tagRepository = require("../dal/tagRepository");

// Middleware pour vérifier l'authentification (à compléter selon votre système d'auth)
const authMiddleware = (req, res, next) => {
  // Ceci est un placeholder - implémentez selon votre système d'authentification
  /*   if (!req.user) {
    return res.status(401).json({ error: "Non autorisé" });
  } */
  next();
};

// Récupérer tous les tags (admin uniquement)
router.get("/", async (req, res) => {
  try {
    const tags = await tagRepository.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les tags actifs
router.get("/active", async (req, res) => {
  try {
    const tags = await tagRepository.getActiveTags();
    res.json(tags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags actifs:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer un tag par ID
router.get("/:id", async (req, res) => {
  try {
    const tag = await tagRepository.getTagById(parseInt(req.params.id));
    if (!tag) {
      return res.status(404).json({ error: "Tag non trouvé" });
    }
    res.json(tag);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du tag ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les tags système
router.get("/system/all", async (req, res) => {
  try {
    const systemTags = await tagRepository.getSystemTags();
    res.json(systemTags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags système:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Routes nécessitant une authentification
router.use(authMiddleware);

// Récupérer les tags d'un utilisateur
router.get("/user/mine", async (req, res) => {
  try {
    const userTags = await tagRepository.getUserTags(req.user.user_id);
    res.json(userTags);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des tags utilisateur:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les tags disponibles pour l'utilisateur (système + personnels)
router.get("/user/available", async (req, res) => {
  try {
    const availableTags = await tagRepository.getAvailableTagsForUser(
      req.user.user_id
    );
    res.json(availableTags);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des tags disponibles:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les tags favoris de l'utilisateur
router.get("/user/favorites", async (req, res) => {
  try {
    const favoriteTags = await tagRepository.getUserFavoriteTags(
      req.user.user_id
    );
    res.json(favoriteTags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags favoris:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer un nouveau tag
router.post("/", async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res
        .status(400)
        .json({ error: "Le nom et la couleur sont requis" });
    }

    const newTag = await tagRepository.createTag(name, color, req.user.user_id);
    res.status(201).json(newTag);
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mettre à jour un tag existant
router.put("/:id", async (req, res) => {
  try {
    const { name, color } = req.body;
    const tagId = parseInt(req.params.id);

    if (!name || !color) {
      return res
        .status(400)
        .json({ error: "Le nom et la couleur sont requis" });
    }

    const updatedTag = await tagRepository.updateTag(
      tagId,
      name,
      color,
      req.user.user_id
    );
    res.json(updatedTag);
  } catch (error) {
    if (error.message.includes("permission")) {
      return res.status(403).json({ error: error.message });
    }
    console.error(
      `Erreur lors de la mise à jour du tag ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Désactiver un tag (suppression logique)
router.delete("/:id", async (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const deactivatedTag = await tagRepository.deactivateTag(
      tagId,
      req.user.user_id
    );
    res.json({ message: "Tag désactivé avec succès", tag: deactivatedTag });
  } catch (error) {
    if (error.message.includes("permission")) {
      return res.status(403).json({ error: error.message });
    }
    console.error(
      `Erreur lors de la désactivation du tag ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajouter un tag aux favoris
router.post("/favorites/:id", async (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const result = await tagRepository.addTagToFavorites(
      req.user.user_id,
      tagId
    );

    if (result) {
      res.json({ message: "Tag ajouté aux favoris" });
    } else {
      res.json({ message: "Le tag est déjà dans les favoris" });
    }
  } catch (error) {
    console.error(
      `Erreur lors de l'ajout du tag ${req.params.id} aux favoris:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Retirer un tag des favoris
router.delete("/favorites/:id", async (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const result = await tagRepository.removeTagFromFavorites(
      req.user.user_id,
      tagId
    );

    if (result) {
      res.json({ message: "Tag retiré des favoris" });
    } else {
      res.json({ message: "Le tag n'était pas dans les favoris" });
    }
  } catch (error) {
    console.error(
      `Erreur lors de la suppression du tag ${req.params.id} des favoris:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Vérifier si un tag est dans les favoris
router.get("/favorites/check/:id", async (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const isFavorite = await tagRepository.isTagFavorite(
      req.user.user_id,
      tagId
    );
    res.json({ isFavorite });
  } catch (error) {
    console.error(
      `Erreur lors de la vérification du statut favori du tag ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

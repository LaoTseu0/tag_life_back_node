// Importation d'Express
const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const tagRoutes = require("./routes/tagRoutes");
dotenv.config();

// Création de l'application Express
const app = express();

// Middleware pour parser le JSON automatiquement
app.use(express.json());

// Route de base pour tester que le serveur fonctionne
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur votre API RESTful!" });
});

// Routes pour les utilisateurs
app.use("/api/users", userRoutes);

// Routes pour les dépenses
app.use("/api/expenses", expenseRoutes);

// Routes pour les tags
app.use("/api/tags", tagRoutes);

// Définition du port d'écoute
const PORT = process.env.PORT || 8080;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

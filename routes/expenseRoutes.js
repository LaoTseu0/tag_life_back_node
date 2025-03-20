const express = require("express");
const router = express.Router();
const expenseRepository = require("../dal/expenseRepository");

// Middleware pour vérifier l'authentification (à compléter selon votre système d'auth)
const authMiddleware = (req, res, next) => {
  // Ceci est un placeholder - implémentez selon votre système d'authentification
  /*   if (!req.user) {
    return res.status(401).json({ error: "Non autorisé" });
  } */
  next();
};

// GET toutes les dépenses (admin uniquement)
router.get("/", async (req, res) => {
  try {
    const expenses = await expenseRepository.getAllExpenses();
    res.json(expenses);
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Routes nécessitant une authentification
router.use(authMiddleware);

// GET dépenses agrégées par semaine pour l'utilisateur courant
router.get("/week", async (req, res) => {
  try {
    const weeklyExpenses = await expenseRepository.getExpensesPerWeek(
      req.user.user_id
    );
    res.json(weeklyExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par semaine:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET dépenses agrégées par mois pour l'utilisateur courant
router.get("/month", async (req, res) => {
  try {
    const monthlyExpenses = await expenseRepository.getExpensesPerMonth(
      req.user.user_id
    );
    res.json(monthlyExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par mois:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET dépenses agrégées par année pour l'utilisateur courant
router.get("/year", async (req, res) => {
  try {
    const yearlyExpenses = await expenseRepository.getExpensesPerYear(
      req.user.user_id
    );
    res.json(yearlyExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par année:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET dépenses par semaine et par tag pour l'utilisateur courant
router.get("/week/tags", async (req, res) => {
  try {
    const weeklyTagExpenses = await expenseRepository.getExpensesPerWeekByTag(
      req.user.user_id
    );
    res.json(weeklyTagExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par semaine et par tag:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET dépenses par mois et par tag pour l'utilisateur courant
router.get("/month/tags", async (req, res) => {
  try {
    const monthlyTagExpenses = await expenseRepository.getExpensesPerMonthByTag(
      req.user.user_id
    );
    res.json(monthlyTagExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par mois et par tag:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET dépenses par année et par tag pour l'utilisateur courant
router.get("/year/tags", async (req, res) => {
  try {
    const yearlyTagExpenses = await expenseRepository.getExpensesPerYearByTag(
      req.user.user_id
    );
    res.json(yearlyTagExpenses);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses par année et par tag:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET séries temporelles de dépenses par tag pour l'utilisateur courant
router.get("/tags/timeseries", async (req, res) => {
  try {
    const { period = "month", limit = 12 } = req.query;

    // Validation des paramètres
    if (!["week", "month", "year"].includes(period)) {
      return res.status(400).json({
        error: "Période invalide. Valeurs acceptées: week, month, year",
      });
    }

    const numLimit = parseInt(limit);
    if (isNaN(numLimit) || numLimit < 1 || numLimit > 60) {
      return res
        .status(400)
        .json({ error: "Limite invalide. Doit être un nombre entre 1 et 60" });
    }

    const timeSeries = await expenseRepository.getTagExpensesTimeSeries(
      req.user.user_id,
      period,
      numLimit
    );

    res.json(timeSeries);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des séries temporelles:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

const db = require("../db/db");

const expenseRepository = {
  getAllExpenses: async () => {
    try {
      const result = await db.query("SELECT * FROM expenses");
      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des dépenses:", error);
      throw error;
    }
  },

  getExpensesPerWeek: async (userId) => {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('week', expense_date) AS week_start,
          SUM(amount) AS total_amount,
          COUNT(*) AS transaction_count
        FROM Expenses
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('week', expense_date)
        ORDER BY week_start DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par semaine:",
        error
      );
      throw error;
    }
  },

  getExpensesPerMonth: async (userId) => {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('month', expense_date) AS month_start,
          SUM(amount) AS total_amount,
          COUNT(*) AS transaction_count
        FROM Expenses
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('month', expense_date)
        ORDER BY month_start DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par mois:",
        error
      );
      throw error;
    }
  },

  getExpensesPerYear: async (userId) => {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('year', expense_date) AS year_start,
          SUM(amount) AS total_amount,
          COUNT(*) AS transaction_count
        FROM Expenses
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('year', expense_date)
        ORDER BY year_start DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par année:",
        error
      );
      throw error;
    }
  },

  getExpensesPerWeekByTag: async (userId) => {
    try {
      const query = `
        SELECT 
            week_start,
            display_tag_name,
            display_tag_id,
            display_tag_color,
            total_amount,
            transaction_count
        FROM expense_weekly_by_tag
        WHERE user_id = $1
        ORDER BY week_start DESC, total_amount DESC
        `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par semaine et par tag:",
        error
      );
      throw error;
    }
  },

  getExpensesPerMonthByTag: async (userId) => {
    try {
      const query = `
        SELECT 
          month_start,
          display_tag_name,
          display_tag_id,
          display_tag_color,
          total_amount,
          transaction_count
        FROM expense_monthly_by_tag
        WHERE user_id = $1
        ORDER BY month_start DESC, total_amount DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par mois et par tag:",
        error
      );
      throw error;
    }
  },

  getExpensesPerYearByTag: async (userId) => {
    try {
      const query = `
        SELECT 
          year_start,
          display_tag_name,
          display_tag_id,
          display_tag_color,
          total_amount,
          transaction_count
        FROM expense_yearly_by_tag
        WHERE user_id = $1
        ORDER BY year_start DESC, total_amount DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dépenses par année et par tag:",
        error
      );
      throw error;
    }
  },

  getTagExpensesTimeSeries: async (userId, period = "month", limit = 12) => {
    try {
      // Choisir la vue en fonction de la période demandée
      const viewName =
        period === "week"
          ? "expense_weekly_by_tag"
          : period === "year"
          ? "expense_yearly_by_tag"
          : "expense_monthly_by_tag";

      const periodField =
        period === "week"
          ? "week_start"
          : period === "year"
          ? "year_start"
          : "month_start";

      const query = `
        WITH recent_periods AS (
          SELECT DISTINCT ${periodField}
          FROM ${viewName}
          WHERE user_id = $1
          ORDER BY ${periodField} DESC
          LIMIT $2
        )
        SELECT 
          e.${periodField},
          e.display_tag_id,
          e.display_tag_name,
          e.display_tag_color,
          e.total_amount
        FROM ${viewName} e
        JOIN recent_periods rp ON e.${periodField} = rp.${periodField}
        WHERE e.user_id = $1
        ORDER BY e.${periodField} ASC, e.total_amount DESC
      `;

      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des séries temporelles:",
        error
      );
      throw error;
    }
  },
};

module.exports = expenseRepository;

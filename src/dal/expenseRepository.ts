import db from '../db/db';
import { Expense, ExpenseInput } from '../types';

interface ExpenseStats {
  total_amount: number;
  transaction_count: number;
}

interface WeeklyExpense extends ExpenseStats {
  week_start: string;
}

interface MonthlyExpense extends ExpenseStats {
  month_start: string;
}

interface YearlyExpense extends ExpenseStats {
  year_start: string;
}

interface TaggedExpense extends ExpenseStats {
  week_start: string;
  display_tag_name: string;
  display_tag_id: number;
  display_tag_color: string;
}

interface ExpenseRepository {
  getAllExpenses: () => Promise<Expense[]>;
  getExpensesPerWeek: (userId: number) => Promise<WeeklyExpense[]>;
  getExpensesPerMonth: (userId: number) => Promise<MonthlyExpense[]>;
  getExpensesPerYear: (userId: number) => Promise<YearlyExpense[]>;
  getExpensesPerWeekByTag: (userId: number) => Promise<TaggedExpense[]>;
  getExpenseById: (id: number) => Promise<Expense | undefined>;
  getExpensesByInvoiceId: (invoiceId: number) => Promise<Expense[]>;
  createExpense: (expenseData: ExpenseInput) => Promise<Expense>;
  createExpenseForInvoiceId: (expenseData: ExpenseInput, invoiceId: number) => Promise<Expense>;
  updateExpense: (id: number, expenseData: ExpenseInput) => Promise<Expense | undefined>;
  deleteExpense: (id: number) => Promise<{ success: boolean }>;
  deleteExpensesByInvoiceId: (invoiceId: number) => Promise<{ success: boolean }>;
}

const expenseRepository: ExpenseRepository = {
  getAllExpenses: async (): Promise<Expense[]> => {
    try {
      const result = await db.query<Expense>('SELECT * FROM expenses');
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      throw error;
    }
  },

  getExpensesPerWeek: async (userId: number): Promise<WeeklyExpense[]> => {
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
      const result = await db.query<WeeklyExpense>(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses par semaine:', error);
      throw error;
    }
  },

  getExpensesPerMonth: async (userId: number): Promise<MonthlyExpense[]> => {
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
      const result = await db.query<MonthlyExpense>(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses par mois:', error);
      throw error;
    }
  },

  getExpensesPerYear: async (userId: number): Promise<YearlyExpense[]> => {
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
      const result = await db.query<YearlyExpense>(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses par année:', error);
      throw error;
    }
  },

  getExpensesPerWeekByTag: async (userId: number): Promise<TaggedExpense[]> => {
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
      const result = await db.query<TaggedExpense>(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses par semaine et par tag:', error);
      throw error;
    }
  },

  // Add other expense repository methods here...

  getExpenseById: async (id: number): Promise<Expense | undefined> => {
    try {
      const result = await db.query<Expense>('SELECT * FROM expenses WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Erreur lors de la récupération de la dépense ${id}:`, error);
      throw error;
    }
  },

  getExpensesByInvoiceId: async (invoiceId: number): Promise<Expense[]> => {
    try {
      const result = await db.query<Expense>('SELECT * FROM expenses WHERE invoice_id = $1', [
        invoiceId,
      ]);
      return result.rows;
    } catch (error) {
      console.error(`Erreur lors de la récupération des dépenses par facture ${invoiceId}:`, error);
      throw error;
    }
  },

  createExpense: async (expenseData: ExpenseInput): Promise<Expense> => {
    try {
      const { amount, date, label, tag_id } = expenseData;
      const result = await db.query<Expense>(
        'INSERT INTO expenses (amount, date, label, tag_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [amount, date, label, tag_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création d'une dépense:", error);
      throw error;
    }
  },

  createExpenseForInvoiceId: async (
    expenseData: ExpenseInput,
    invoiceId: number
  ): Promise<Expense> => {
    console.log('[ExpenseRepository] createExpenseForInvoiceId');
    try {
      const { amount, date, label, tag_id } = expenseData;
      const result = await db.query<Expense>(
        'INSERT INTO expenses (amount, date, label, tag_id, invoice_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [amount, date, label, tag_id, invoiceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création d'une dépense pour une facture:", error);
      throw error;
    }
  },

  updateExpense: async (id: number, expenseData: ExpenseInput): Promise<Expense | undefined> => {
    try {
      const { amount, date, label, tag_id } = expenseData;
      const result = await db.query<Expense>(
        'UPDATE expenses SET amount = $1, date = $2, label = $3, tag_id = $4 WHERE id = $5 RETURNING *',
        [amount, date, label, tag_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la dépense ${id}:`, error);
      throw error;
    }
  },

  deleteExpense: async (id: number): Promise<{ success: boolean }> => {
    try {
      await db.query('DELETE FROM expenses WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la dépense ${id}:`, error);
      throw error;
    }
  },

  deleteExpensesByInvoiceId: async (invoiceId: number): Promise<{ success: boolean }> => {
    try {
      await db.query('DELETE FROM expenses WHERE invoice_id = $1', [invoiceId]);
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression des dépenses par facture ${invoiceId}:`, error);
      throw error;
    }
  },
};

export default expenseRepository;

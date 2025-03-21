import express, { Router, RequestHandler } from 'express';
import expenseController from '../controllers/expenseController';

const router: Router = express.Router();

// GET all expenses
router.get('/', expenseController.getAllExpenses as RequestHandler);

// GET expense by ID
router.get('/:id', expenseController.getExpenseById as RequestHandler);

// GET expenses per week for a user
router.get('/stats/weekly/:userId', expenseController.getExpensesPerWeek as RequestHandler);

// GET expenses per month for a user
router.get('/stats/monthly/:userId', expenseController.getExpensesPerMonth as RequestHandler);

// GET expenses per year for a user
router.get('/stats/yearly/:userId', expenseController.getExpensesPerYear as RequestHandler);

// GET expenses per week with tags for a user
router.get(
  '/stats/weekly-tags/:userId',
  expenseController.getExpensesPerWeekWithTags as RequestHandler
);

// POST create a new expense
router.post('/', expenseController.createExpense as RequestHandler);

// PUT update an expense
router.put('/:id', expenseController.updateExpense as RequestHandler);

// DELETE delete an expense
router.delete('/:id', expenseController.deleteExpense as RequestHandler);

export default router;

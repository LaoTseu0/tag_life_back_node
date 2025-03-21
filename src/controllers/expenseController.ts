import { Request, Response } from 'express';
import expenseRepository from '../dal/expenseRepository';
import { ExpenseInput } from '../types';

const expenseController = {
  getAllExpenses: async (req: Request, res: Response): Promise<void> => {
    try {
      const expenses = await expenseRepository.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      console.error('Error retrieving expenses:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getExpenseById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const expense = await expenseRepository.getExpenseById(id);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(expense);
    } catch (error) {
      console.error(`Error retrieving expense ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getExpensesPerWeek: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const weeklyExpenses = await expenseRepository.getExpensesPerWeek(userId);
      res.json(weeklyExpenses);
    } catch (error) {
      console.error(`Error retrieving weekly expenses for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getExpensesPerMonth: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const monthlyExpenses = await expenseRepository.getExpensesPerMonth(userId);
      res.json(monthlyExpenses);
    } catch (error) {
      console.error(`Error retrieving monthly expenses for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getExpensesPerYear: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const yearlyExpenses = await expenseRepository.getExpensesPerYear(userId);
      res.json(yearlyExpenses);
    } catch (error) {
      console.error(`Error retrieving yearly expenses for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getExpensesPerWeekWithTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const taggedExpenses = await expenseRepository.getExpensesPerWeekByTag(userId);
      res.json(taggedExpenses);
    } catch (error) {
      console.error(`Error retrieving tagged expenses for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  createExpense: async (req: Request, res: Response): Promise<void> => {
    try {
      const expenseData: ExpenseInput = req.body;
      const newExpense = await expenseRepository.createExpense(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateExpense: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const expenseData: ExpenseInput = req.body;
      const updatedExpense = await expenseRepository.updateExpense(id, expenseData);
      if (!updatedExpense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(updatedExpense);
    } catch (error) {
      console.error(`Error updating expense ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteExpense: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await expenseRepository.deleteExpense(id);
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting expense ${req.params.id}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

export default expenseController;

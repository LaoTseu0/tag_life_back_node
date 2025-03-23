import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';
import tagRoutes from './routes/tagRoutes';

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();

// Middleware to parse JSON automatically
app.use(express.json());

// Base route to test the server is working
app.get('/', (_req, res) => {
  res.json({ message: 'Bienvenue sur votre API RESTful!' });
});

// User routes
app.use('/api/user', userRoutes);

// Expense routes
app.use('/api/expense', expenseRoutes);

// Tag routes
app.use('/api/tag', tagRoutes);

// Define the port to listen on
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

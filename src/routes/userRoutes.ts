import express, { Router, RequestHandler } from 'express';
import userController from '../controllers/userController';

/**
 * router: /api/users
 */
const router: Router = express.Router();

// GET tous les utilisateurs
router.get('/', userController.getAllUsers as RequestHandler);

// GET un utilisateur par ID
router.get('/:id', userController.getUserById as RequestHandler);

// POST créer un nouvel utilisateur
router.post('/register', userController.registerUser as RequestHandler);

// POST login
router.post('/login', userController.login as RequestHandler);

// PUT mettre à jour un utilisateur
router.put('/:id', userController.updateUser as RequestHandler);

// DELETE supprimer un utilisateur
router.delete('/:id', userController.deleteUser as RequestHandler);

export default router;

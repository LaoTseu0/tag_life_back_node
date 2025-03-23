import { Request, Response } from 'express';
import userRepository from '../dal/userRepository';
import { UserInput } from '../types';

const userController = {
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    console.log('[UserController] getAllUsers');
    try {
      const users = await userRepository.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  getUserById: async (req: Request, res: Response): Promise<void> => {
    console.log('[UserController] getUserById', { id: req.params.id });
    try {
      const id = parseInt(req.params.id);
      const user = await userRepository.getUserById(id);
      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id}:`, error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  createUser: async (req: Request, res: Response): Promise<void> => {
    console.log('[UserController] createUser', req.body);
    try {
      const userData: UserInput = req.body;
      const newUser = await userRepository.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Erreur lors de la création d'un utilisateur:", error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  updateUser: async (req: Request, res: Response): Promise<void> => {
    console.log('[UserController] updateUser', { id: req.params.id, body: req.body });
    try {
      const id = parseInt(req.params.id);
      const userData: UserInput = req.body;
      const updatedUser = await userRepository.updateUser(id, userData);
      if (!updatedUser) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id}:`, error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  deleteUser: async (req: Request, res: Response): Promise<void> => {
    console.log('[UserController] deleteUser', { id: req.params.id });
    try {
      const id = parseInt(req.params.id);
      await userRepository.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}:`, error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

export default userController;

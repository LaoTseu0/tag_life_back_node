import { Request, Response } from 'express';
import userRepository from '../dal/userRepository';
import { UserInput } from '../types';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepository.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
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
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: UserInput = req.body;
    const newUser = await userRepository.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erreur lors de la création d'un utilisateur:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
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
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await userRepository.deleteUser(id);
    res.status(204).end();
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

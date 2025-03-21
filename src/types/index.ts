// User types
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export interface UserInput {
  nom: string;
  prenom: string;
  email: string;
}

// Expense types
export interface Expense {
  id: number;
  montant: number;
  date: Date;
  description: string;
  user_id: number;
}

export interface ExpenseInput {
  montant: number;
  date: Date | string;
  description: string;
  user_id: number;
}

// Tag types
export interface Tag {
  id: number;
  nom: string;
  description?: string;
}

export interface TagInput {
  nom: string;
  description?: string;
}

// Expense-Tag relation
export interface ExpenseTag {
  expense_id: number;
  tag_id: number;
}

// Database response type
export interface DbResult<T> {
  rows: T[];
  rowCount: number;
}

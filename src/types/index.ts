// User types
export interface User {
  id: number;
  email: string;
  password_hash: string;
}

export interface UserInput {
  email: string;
  password_hash: string;
}

// Expense types
export interface Expense {
  expense_id: number;
  user_id: number;
  invoice_id: number;
  amount: number;
  expense_date: Date;
  description: string;
  default_tag_id: number;
  user_tag_id: number;
  is_recurring: boolean;
  receipt_image_path: string;
}

export interface ExpenseInput {
  tag_id: number;
  amount: number;
  label: string;
  date: Date | string;
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

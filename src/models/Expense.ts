/**
 * Expense Model
 * Representation of the Expenses table in the database
 */
export interface Expense {
  expense_id: number;
  user_id: number; // Reference to Users(user_id)
  invoice_id: number | null; // Reference to Invoices(invoice_id), null for individual expenses
  amount: number; // Must be > 0
  expense_date: Date;
  description: string | null;
  default_tag_id: number; // Required system-suggested tag
  user_tag_id: number | null; // User-chosen tag, null if user accepts default tag
  is_recurring: boolean; // Default: false
  receipt_image_path: string | null; // Must be null if invoice_id is specified
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation rules:
 * 1. If user_tag_id is specified, it must be different from default_tag_id
 * 2. If invoice_id is specified, receipt_image_path must be null
 * 3. User must have access to user_tag_id (tag must be system tag or created by user)
 * 4. user_tag_id must be active
 */

/**
 * Model for creating a new expense
 */
export interface CreateExpenseInput {
  user_id: number;
  invoice_id?: number;
  amount: number; // Must be > 0
  expense_date: Date;
  description?: string;
  default_tag_id: number;
  user_tag_id?: number; // Must be different from default_tag_id if specified
  is_recurring?: boolean;
  receipt_image_path?: string; // Must be null if invoice_id is specified
}

/**
 * Model for updating an expense
 */
export interface UpdateExpenseInput {
  invoice_id?: number | null;
  amount?: number; // Must be > 0
  expense_date?: Date;
  description?: string;
  default_tag_id?: number;
  user_tag_id?: number | null; // Must be different from default_tag_id if specified
  is_recurring?: boolean;
  receipt_image_path?: string | null; // Must be null if invoice_id is specified
}

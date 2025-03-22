/**
 * Invoice Model
 * Representation of the Invoices table in the database
 * Stores invoices that can contain multiple expenses
 */
export interface Invoice {
  invoice_id: number;
  user_id: number; // Reference to Users(user_id)
  vendor_name: string | null; // Name of merchant or supplier
  invoice_date: Date;
  total_amount: number; // Total invoice amount - must be positive
  receipt_image_path: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Model for creating a new invoice
 */
export interface CreateInvoiceInput {
  user_id: number;
  vendor_name?: string;
  invoice_date: Date;
  total_amount: number; // Must be > 0
  receipt_image_path?: string;
  notes?: string;
}

/**
 * Model for updating an invoice
 */
export interface UpdateInvoiceInput {
  vendor_name?: string;
  invoice_date?: Date;
  total_amount?: number; // Must be > 0
  receipt_image_path?: string;
  notes?: string;
}

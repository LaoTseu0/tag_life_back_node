import { ExpenseInput } from '.';

// Invoice type
export interface Invoice {
  id: number;
  amount: number;
  date: Date;
}

// Invoice input type
export interface InvoiceInput {
  total_amount: number;
  invoice_date: Date;
  user_id: number;
  vendor_name: string;
  receipt_image_path: string;
  notes: string;
  expenses: ExpenseInput[];
}

/**
 * InvoiceDetails Model
 * Representation of the invoice_details view in the database
 * Provides a summary of invoices with their expenses count
 */
export interface InvoiceDetails {
  invoice_id: number;
  user_id: number;
  vendor_name: string | null;
  invoice_date: Date;
  total_amount: number;
  receipt_image_path: string | null;
  notes: string | null;
  item_count: number; // Count of expense items linked to this invoice
  created_at: Date;
  updated_at: Date;
}

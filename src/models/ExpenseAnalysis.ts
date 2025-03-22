/**
 * ExpenseAnalysis Model
 * Representation of the expense_analysis view in the database
 * Simplifies expense analysis by presenting the effective tag (user or default)
 */
export interface ExpenseAnalysis {
  expense_id: number;
  user_id: number;
  amount: number;
  expense_date: Date;
  description: string | null;
  is_recurring: boolean;
  invoice_id: number | null; // Reference to the invoice this expense is part of
  display_tag_id: number; // The effective tag ID (user_tag_id if specified and active, otherwise default_tag_id)
  display_tag_name: string; // The name of the effective tag
  display_tag_color: string | null; // The color of the effective tag
  display_tag_is_active: boolean; // Whether the effective tag is active
  using_default_tag: boolean; // Whether the default tag is being used (true if user_tag_id is null or inactive)
  default_tag_id: number; // The default tag ID
  default_tag_name: string; // The name of the default tag
  invoice_vendor: string | null; // The vendor name from the linked invoice
  invoice_total: number | null; // The total amount from the linked invoice
}

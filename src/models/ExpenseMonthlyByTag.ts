/**
 * ExpenseMonthlyByTag Model
 * Representation of the expense_monthly_by_tag view in the database
 * Provides monthly expense aggregation by tag
 */
export interface ExpenseMonthlyByTag {
  user_id: number;
  month_start: Date; // Start date of the month (truncated to month)
  display_tag_id: number; // The effective tag ID
  display_tag_name: string; // The name of the effective tag
  display_tag_color: string | null; // The color of the effective tag
  total_amount: number; // Sum of expenses for this tag in this month
  transaction_count: number; // Count of expenses for this tag in this month
}

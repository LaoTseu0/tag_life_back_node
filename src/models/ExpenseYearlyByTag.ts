/**
 * ExpenseYearlyByTag Model
 * Representation of the expense_yearly_by_tag view in the database
 * Provides yearly expense aggregation by tag
 */
export interface ExpenseYearlyByTag {
  user_id: number;
  year_start: Date; // Start date of the year (truncated to year)
  display_tag_id: number; // The effective tag ID
  display_tag_name: string; // The name of the effective tag
  display_tag_color: string | null; // The color of the effective tag
  total_amount: number; // Sum of expenses for this tag in this year
  transaction_count: number; // Count of expenses for this tag in this year
}

/**
 * ExpenseWeeklyByTag Model
 * Representation of the expense_weekly_by_tag view in the database
 * Provides weekly expense aggregation by tag
 */
export interface ExpenseWeeklyByTag {
  user_id: number;
  week_start: Date; // Start date of the week (truncated to week)
  display_tag_id: number; // The effective tag ID
  display_tag_name: string; // The name of the effective tag
  display_tag_color: string | null; // The color of the effective tag
  total_amount: number; // Sum of expenses for this tag in this week
  transaction_count: number; // Count of expenses for this tag in this week
}

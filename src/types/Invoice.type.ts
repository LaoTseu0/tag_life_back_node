// Invoice type
export interface Invoice {
  id: number;
  amount: number;
  date: Date;
}

// Invoice input type
export interface InvoiceInput {
  amount: number;
  date: Date;
}

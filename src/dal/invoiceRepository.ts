import db from '../db/db';
import { Invoice, InvoiceInput } from '../types/Invoice.type';

interface InvoiceRepository {
  // Get all invoices
  getAllInvoices: () => Promise<Invoice[]>;
  // Get last 10 invoices
  getLastInvoices: () => Promise<Invoice[]>;
  // Get invoice by id
  getInvoiceById: (id: number) => Promise<Invoice | undefined>;
  // Create invoice
  createInvoice: (invoiceData: InvoiceInput) => Promise<Invoice>;
  // Update invoice
}

const invoiceRepository: InvoiceRepository = {
  getAllInvoices: async (): Promise<Invoice[]> => {
    const result = await db.query<Invoice>('SELECT * FROM invoices');
    return result.rows;
  },
  getLastInvoices: async (): Promise<Invoice[]> => {
    const result = await db.query<Invoice>('SELECT * FROM invoices ORDER BY date DESC LIMIT 10');
    return result.rows;
  },
  getInvoiceById: async (id: number): Promise<Invoice | undefined> => {
    const result = await db.query<Invoice>('SELECT * FROM invoices WHERE id = $1', [id]);
    return result.rows[0];
  },
  createInvoice: async (invoiceData: InvoiceInput): Promise<Invoice> => {
    const result = await db.query<Invoice>(
      'INSERT INTO invoices (amount, date) VALUES ($1, $2) RETURNING *',
      [invoiceData.amount, invoiceData.date]
    );
    return result.rows[0];
  },
};

export default invoiceRepository;

import { Invoice } from '../types/Invoice.type';
import { ExpenseInput } from '../types';
import { InvoiceInput } from '../types/Invoice.type';
import invoiceRepository from '../dal/invoiceRepository';
import expenseRepository from '../dal/expenseRepository';

interface InvoiceService {
  createInvoiceWithExpenses: (
    invoiceData: InvoiceInput,
    expenseData: ExpenseInput[]
  ) => Promise<Invoice>;
}

const invoiceService: InvoiceService = {
  createInvoiceWithExpenses: async (invoiceData: InvoiceInput, expenseData: ExpenseInput[]) => {
    const invoice = await invoiceRepository.createInvoice(invoiceData);
    for (const expense of expenseData) {
      await expenseRepository.createExpenseForInvoiceId(expense, invoice.id);
    }
    return invoice;
  },
};

export default invoiceService;

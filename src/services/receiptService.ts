import { v4 as uuidv4 } from 'uuid';

export interface Receipt {
  id: string;
  userId: string;
  product: string;
  type: 'skin' | 'subscription' | 'powerup' | 'mysterybox' | 'mystery-box' | 'coins' | 'bundle';
  amount: number;
  currency: 'pi' | 'coins';
  date: string;
  transactionId: string;
}

const receipts: Receipt[] = [];

export function addReceipt(receipt: Omit<Receipt, 'id' | 'date'>) {
  const newReceipt: Receipt = {
    ...receipt,
    id: uuidv4(),
    date: new Date().toISOString(),
  };
  receipts.push(newReceipt);
  return newReceipt;
}

export function getReceiptsForUser(userId: string): Receipt[] {
  return receipts.filter(r => r.userId === userId);
} 
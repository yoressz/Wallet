import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths, File } from 'expo-file-system';

export interface Account {
  id: string;
  name: string;
  type: string; // 'Wallet' | 'Savings' | 'Asset' | 'Credit' | 'Loans' | 'Checking' | 'Cash'
  balance: number;
  includeInNetWorth?: boolean;
  customCategories?: string[];
  imageUri?: string;
  customIcon?: string;
  customColor?: string;
  interestRate?: number;
  interestFrequency?: 'daily' | 'monthly' | 'yearly';
  boostedRate?: number;
  boostDaysRemaining?: number;
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  created_at: string;
}

export interface LoanAccount {
  id: string;
  name: string;
  type: 'lent' | 'loan';
  totalAmount: number;
  note?: string;
  includeInNetWorth?: boolean;
  created_at: string;
}

export interface LoanTransaction {
  id: string;
  loan_account_id: string;
  amount: number;
  type: 'principal' | 'installment';
  wallet_account_id?: string;
  note?: string;
  created_at: string;
}

export interface LocalWalletData {
  accounts: Account[];
  transactions: Transaction[];
  loanAccounts: LoanAccount[];
  loanTransactions: LoanTransaction[];
  dailyLimit: number;
}

const USERNAME_KEY = '@wallet_username';
const DATA_KEY = '@wallet_data';

export async function saveImageToPermanentStorage(sourceUri: string): Promise<string> {
  try {
    const filename = `wallet_img_${Date.now()}.jpg`;
    const sourceFile = new File(sourceUri);
    const destFile = new File(Paths.document, filename);
    sourceFile.copy(destFile);
    return destFile.uri;
  } catch {
    return sourceUri;
  }
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '0.00';
  const clamped = Math.min(Math.max(amount, -999999999.99), 999999999.99);
  return clamped.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const localStorage = {
  async loadUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USERNAME_KEY);
    } catch {
      return null;
    }
  },

  async saveUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USERNAME_KEY, username.trim());
    } catch {
      // ignore
    }
  },

  async loadLocalData(): Promise<LocalWalletData> {
    try {
      const raw = await AsyncStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalWalletData;
        return {
          accounts: parsed.accounts || [],
          transactions: parsed.transactions || [],
          loanAccounts: parsed.loanAccounts || [],
          loanTransactions: parsed.loanTransactions || [],
          dailyLimit: typeof parsed.dailyLimit === 'number' ? parsed.dailyLimit : 230,
        };
      }
    } catch {
      // ignore
    }
    return {
      accounts: [],
      transactions: [],
      loanAccounts: [],
      loanTransactions: [],
      dailyLimit: 230,
    };
  },

  async saveLocalData(data: LocalWalletData): Promise<void> {
    try {
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  },
};

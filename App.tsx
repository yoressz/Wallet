import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { Feather } from '@expo/vector-icons';
import {
  localStorage,
  saveImageToPermanentStorage,
  getLocalDateString,
  formatCurrency,
  Account,
  Transaction,
  LoanAccount,
  LoanTransaction,
  LocalWalletData,
} from './storage';
import { Toast, ToastState } from './components/Toast';
import { ConfirmModal, ConfirmModalState } from './components/ConfirmModal';

try {
  SplashScreen?.preventAutoHideAsync?.().catch(() => {});
} catch {}

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [tempUsernameInput, setTempUsernameInput] = useState('');
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [initializing, setInitializing] = useState(true);

  let [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ visible: false, title: '', message: '' });
  const [activeTab, setActiveTab] = useState<'home' | 'accounts' | 'insights'>('home');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>([]);
  const [loanTransactions, setLoanTransactions] = useState<LoanTransaction[]>([]);
  const [dailyLimit, setDailyLimit] = useState<number>(230);
  const [showNetWorth, setShowNetWorth] = useState(true);
  const [selectedSwapCardId, setSelectedSwapCardId] = useState<string | null>(null);
  const [accountFilter, setAccountFilter] = useState<string>('All');
  const [lentLoanFilter, setLentLoanFilter] = useState<'all' | 'lent' | 'loan'>('all');
  const [overviewType, setOverviewType] = useState<'all' | 'expense' | 'income'>('all');
  const [overviewPeriod, setOverviewPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [dailyLimitModalVisible, setDailyLimitModalVisible] = useState(false);
  const [tempDailyLimit, setTempDailyLimit] = useState('230');
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [calcValue, setCalcValue] = useState('0');
  const [calcOnApply, setCalcOnApply] = useState<((val: string) => void) | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [submittingTx, setSubmittingTx] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState('Food & Dining');
  const [note, setNote] = useState('');
  const [loansFullViewVisible, setLoansFullViewVisible] = useState(false);
  const [loanAccountModalVisible, setLoanAccountModalVisible] = useState(false);
  const [editingLoanAccount, setEditingLoanAccount] = useState<LoanAccount | null>(null);
  const [loanAccountType, setLoanAccountType] = useState<'lent' | 'loan'>('lent');
  const [loanAccountName, setLoanAccountName] = useState('');
  const [loanAccountAmount, setLoanAccountAmount] = useState('0');
  const [loanAccountNote, setLoanAccountNote] = useState('');
  const [loanIncludeInNetWorth, setLoanIncludeInNetWorth] = useState(true);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [installmentModalVisible, setInstallmentModalVisible] = useState(false);
  const [selectedLoanAccount, setSelectedLoanAccount] = useState<LoanAccount | null>(null);
  const [installmentType, setInstallmentType] = useState<'installment' | 'principal'>('installment');
  const [installmentAmount, setInstallmentAmount] = useState('0');
  const [selectedPaymentWalletId, setSelectedPaymentWalletId] = useState<string>('none');
  const [installmentNote, setInstallmentNote] = useState('');
  const [assetAdjustModalVisible, setAssetAdjustModalVisible] = useState(false);
  const [adjustTargetAccount, setAdjustTargetAccount] = useState<Account | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustAmount, setAdjustAmount] = useState('0');
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Savings');
  const [newAccountBalance, setNewAccountBalance] = useState('0');
  const [includeInNetWorth, setIncludeInNetWorth] = useState(true);
  const [accountImageUri, setAccountImageUri] = useState<string | undefined>(undefined);
  const [accountCustomIcon, setAccountCustomIcon] = useState<string | undefined>(undefined);
  const [accountCustomColor, setAccountCustomColor] = useState<string>('#10B981');
  const [enableInterest, setEnableInterest] = useState(false);
  const [baseInterestRate, setBaseInterestRate] = useState('3.5');
  const [interestFrequency, setInterestFrequency] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [enableBoost, setEnableBoost] = useState(false);
  const [boostedRate, setBoostedRate] = useState('6.0');
  const [boostDays, setBoostDays] = useState('30');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function runInit() {
      try {
        const savedUser = await localStorage.loadUsername();
        if (savedUser && isMounted) {
          setUsername(savedUser);
          setEditUsernameInput(savedUser);
        }

        const data = await localStorage.loadLocalData();
        if (isMounted) {
          applyData(data);
        }
      } catch (e) {
        // ignore
      } finally {
        if (isMounted) {
          setInitializing(false);
          try {
            await SplashScreen?.hideAsync?.();
          } catch {}
        }
      }
    }
    runInit();

    const timer = setTimeout(() => {
      if (isMounted) {
        setInitializing(false);
        try {
          SplashScreen?.hideAsync?.().catch(() => {});
        } catch {}
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const saveData = useCallback(
    async (
      updatedAccs = accounts,
      updatedTxs = transactions,
      updatedLoans = loanAccounts,
      updatedLoanTxs = loanTransactions,
      updatedLimit = dailyLimit
    ) => {
      setAccounts(updatedAccs);
      setTransactions(updatedTxs);
      setLoanAccounts(updatedLoans);
      setLoanTransactions(updatedLoanTxs);
      setDailyLimit(updatedLimit);

      await localStorage.saveLocalData({
        accounts: updatedAccs,
        transactions: updatedTxs,
        loanAccounts: updatedLoans,
        loanTransactions: updatedLoanTxs,
        dailyLimit: updatedLimit,
      });
    },
    [accounts, transactions, loanAccounts, loanTransactions, dailyLimit]
  );

  function showToast(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    setToast({ visible: true, message, type });
  }

  function askConfirmation(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    isDestructive = true
  ) {
    setConfirmModal({
      visible: true,
      title,
      message,
      confirmText,
      isDestructive,
      onConfirm,
    });
  }

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090B', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#18181B', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#27272A' }}>
            <Feather name="credit-card" size={28} color="#FAFAFA" />
          </View>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 24, color: '#FAFAFA', includeFontPadding: false, paddingHorizontal: 16, letterSpacing: 0.5 }}>Wallet</Text>
        </View>
      </View>
    );
  }

  const categoryOptions = [
    'Food & Dining',
    'Groceries',
    'Housing',
    'Transport',
    'Entertainment',
    'Fund Transfer',
    'Salary',
    'Freelance',
    'Other',
  ];

  const accountTypeOptions = ['Wallet', 'Savings', 'Asset', 'Credit', 'Loans', 'Checking', 'Cash'];

  const presetBrandIcons = [
    { key: 'maya', label: 'maya', bg: '#00D632', fg: '#000' },
    { key: 'BDO', label: 'BDO', bg: '#0033A0', fg: '#FFF' },
    { key: 'GO', label: 'GO', bg: '#00B4D8', fg: '#FFF' },
    { key: 'LBP', label: 'Landbank', bg: '#00875A', fg: '#FFF' },
    { key: 'Mari', label: 'MariBank', bg: '#EE4D2D', fg: '#FFF' },
    { key: 'CIMB', label: 'CIMB', bg: '#ED1C24', fg: '#FFF' },
    { key: 'GCash', label: 'GCash', bg: '#007CFF', fg: '#FFF' },
    { key: 'UB', label: 'UB', bg: '#FF6B00', fg: '#FFF' },
    { key: 'Sea', label: 'SeaBank', bg: '#00A859', fg: '#FFF' },
  ];

  const presetEmojiIcons = ['💵', '💳', '🏦', '💰', '🐷', '🚀', '📱', '💼', '🏡', '🚗', '🪙'];

  const colorPalette = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#00B4D8', // Cyan
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Gold
    '#334155', // Slate
  ];

  // --- Initial Load ---

  async function applyData(data: LocalWalletData) {
    setAccounts(data.accounts || []);
    setTransactions(data.transactions || []);
    setLoanAccounts(data.loanAccounts || []);
    setLoanTransactions(data.loanTransactions || []);
    setDailyLimit(typeof data.dailyLimit === 'number' ? data.dailyLimit : 230);
    setTempDailyLimit((data.dailyLimit || 230).toString());

    if (data.accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(data.accounts[0].id);
    }
  }



  // --- Username Onboarding & Editing Handlers ---

  async function handleSaveInitialUsername() {
    const trimmed = tempUsernameInput.trim();
    if (!trimmed) {
      return showToast('Please enter your name to continue.', 'error');
    }
    await localStorage.saveUsername(trimmed);
    setUsername(trimmed);
    setEditUsernameInput(trimmed);
  }

  async function handleUpdateUsername() {
    const trimmed = editUsernameInput.trim();
    if (!trimmed) {
      return showToast('Name cannot be empty.', 'error');
    }
    await localStorage.saveUsername(trimmed);
    setUsername(trimmed);
    setProfileModalVisible(false);
    showToast('Username updated!', 'success');
  }

  // --- Photo Picker Handler ---

  async function handlePickWalletPhoto() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return showToast('Access to media library is required.', 'warning');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAccountImageUri(result.assets[0].uri);
      setAccountCustomIcon(undefined);
    }
  }

  // --- Account Add / Edit Handlers ---

  function openCreateAccountModal() {
    setEditingAccount(null);
    setNewAccountName('');
    setNewAccountType('Savings');
    setNewAccountBalance('0');
    setIncludeInNetWorth(true);
    setAccountImageUri(undefined);
    setAccountCustomIcon(undefined);
    setAccountCustomColor('#10B981');
    setEnableInterest(false);
    setBaseInterestRate('3.5');
    setInterestFrequency('daily');
    setEnableBoost(false);
    setBoostedRate('6.0');
    setBoostDays('30');
    setAccountModalVisible(true);
  }

  function openEditAccountModal(acc: Account) {
    setEditingAccount(acc);
    setNewAccountName(acc.name);
    setNewAccountType(acc.type);
    setNewAccountBalance(acc.balance.toString());
    setIncludeInNetWorth(acc.includeInNetWorth !== false);
    setAccountImageUri(acc.imageUri);
    setAccountCustomIcon(acc.customIcon);
    setAccountCustomColor(acc.customColor || '#10B981');

    if (acc.interestRate && acc.interestRate > 0) {
      setEnableInterest(true);
      setBaseInterestRate(acc.interestRate.toString());
      setInterestFrequency(acc.interestFrequency || 'daily');
    } else {
      setEnableInterest(false);
      setBaseInterestRate('3.5');
      setInterestFrequency('daily');
    }

    if (acc.boostedRate && acc.boostedRate > 0) {
      setEnableBoost(true);
      setBoostedRate(acc.boostedRate.toString());
      setBoostDays((acc.boostDaysRemaining || 30).toString());
    } else {
      setEnableBoost(false);
      setBoostedRate('6.0');
      setBoostDays('30');
    }

    setAccountModalVisible(true);
  }

  async function handleSaveAccount() {
    if (!newAccountName.trim()) return showToast('Enter an account name.', 'error');

    const initialBal = parseFloat(newAccountBalance) || 0;
    const baseRate = enableInterest ? parseFloat(baseInterestRate) || 0 : undefined;
    const boostRate = enableInterest && enableBoost ? parseFloat(boostedRate) || 0 : undefined;
    const bDays = enableInterest && enableBoost ? parseInt(boostDays, 10) || 30 : undefined;

    setCreatingAccount(true);

    if (editingAccount) {
      const updatedAccs = accounts.map((acc) =>
        acc.id === editingAccount.id
          ? {
              ...acc,
              name: newAccountName.trim(),
              type: newAccountType,
              balance: initialBal,
              includeInNetWorth,
              imageUri: accountImageUri,
              customIcon: accountCustomIcon,
              customColor: accountCustomColor,
              interestRate: baseRate,
              interestFrequency: enableInterest ? interestFrequency : undefined,
              boostedRate: boostRate,
              boostDaysRemaining: bDays,
            }
          : acc
      );
      await saveData(updatedAccs);
    } else {
      const newAcc: Account = {
        id: 'acc_' + Date.now(),
        name: newAccountName.trim(),
        type: newAccountType,
        balance: initialBal,
        includeInNetWorth,
        imageUri: accountImageUri,
        customIcon: accountCustomIcon,
        customColor: accountCustomColor,
        interestRate: baseRate,
        interestFrequency: enableInterest ? interestFrequency : undefined,
        boostedRate: boostRate,
        boostDaysRemaining: bDays,
      };
      const updatedAccs = [newAcc, ...accounts];
      await saveData(updatedAccs);
      if (!selectedAccountId) setSelectedAccountId(newAcc.id);
    }

    setAccountModalVisible(false);
    setCreatingAccount(false);
  }

  // --- Asset Value Adjustments ---

  function openAdjustAssetValueModal(acc: Account) {
    setAdjustTargetAccount(acc);
    setAdjustType('add');
    setAdjustAmount('0');
    setAssetAdjustModalVisible(true);
  }

  async function handleSaveAssetAdjustment() {
    if (!adjustTargetAccount) return;
    const val = parseFloat(adjustAmount) || 0;
    if (val <= 0) return showToast('Please enter a valid value.', 'error');

    const newBalance = adjustType === 'add'
      ? Number(adjustTargetAccount.balance) + val
      : Number(adjustTargetAccount.balance) - val;

    const updatedAccs = accounts.map((acc) =>
      acc.id === adjustTargetAccount.id ? { ...acc, balance: newBalance } : acc
    );

    await saveData(updatedAccs);
    setAssetAdjustModalVisible(false);
    setAdjustTargetAccount(null);
  }

  // --- Quick Entry Helpers & Custom Category Handlers ---

  function openAddTxForAccount(accId: string) {
    setSelectedAccountId(accId);
    setAmount('0');
    setNote('');
    setSelectedDate(new Date());
    setTxModalVisible(true);
  }

  function openAddTxForCategory(catName: string) {
    setCategory(catName);
    setAmount('0');
    setNote('');
    setSelectedDate(new Date());
    setTxModalVisible(true);
  }

  function handleSaveCustomCategory() {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      return showToast('Please enter a category name.', 'error');
    }

    if (!selectedAccountId) {
      return showToast('Please select an account first.', 'warning');
    }

    const targetAccount = accounts.find((a) => a.id === selectedAccountId);
    if (!targetAccount) return;

    const existingCustoms = targetAccount.customCategories || [];
    if (categoryOptions.includes(trimmed) || existingCustoms.includes(trimmed)) {
      setCategory(trimmed);
      setAddCategoryModalVisible(false);
      setNewCategoryInput('');
      return;
    }

    const updatedAccs = accounts.map((acc) =>
      acc.id === selectedAccountId
        ? { ...acc, customCategories: [...existingCustoms, trimmed] }
        : acc
    );

    saveData(updatedAccs);
    setCategory(trimmed);
    setAddCategoryModalVisible(false);
    setNewCategoryInput('');
  }

  // --- Loan Account Management & Installment Payments ---

  function openCreateLoanAccountModal() {
    setEditingLoanAccount(null);
    setLoanAccountName('');
    setLoanAccountAmount('0');
    setLoanAccountNote('');
    setLoanAccountType('lent');
    setLoanIncludeInNetWorth(true);
    setLoanAccountModalVisible(true);
  }

  function openEditLoanAccountModal(loanAcc: LoanAccount) {
    setEditingLoanAccount(loanAcc);
    setLoanAccountName(loanAcc.name);
    setLoanAccountAmount(loanAcc.totalAmount.toString());
    setLoanAccountNote(loanAcc.note || '');
    setLoanAccountType(loanAcc.type);
    setLoanIncludeInNetWorth(loanAcc.includeInNetWorth !== false);
    setLoanAccountModalVisible(true);
  }

  async function handleSaveLoanAccount() {
    if (!loanAccountName.trim()) {
      return showToast('Please enter a borrower/lender name.', 'error');
    }
    const amt = parseFloat(loanAccountAmount) || 0;
    if (amt <= 0) {
      return showToast('Please enter a valid principal amount.', 'error');
    }

    if (editingLoanAccount) {
      const updatedLoans = loanAccounts.map((la) =>
        la.id === editingLoanAccount.id
          ? {
              ...la,
              name: loanAccountName.trim(),
              type: loanAccountType,
              totalAmount: amt,
              note: loanAccountNote.trim(),
              includeInNetWorth: loanIncludeInNetWorth,
            }
          : la
      );
      await saveData(accounts, transactions, updatedLoans);
    } else {
      const newLoanAcc: LoanAccount = {
        id: 'lacc_' + Date.now(),
        name: loanAccountName.trim(),
        type: loanAccountType,
        totalAmount: amt,
        note: loanAccountNote.trim(),
        includeInNetWorth: loanIncludeInNetWorth,
        created_at: selectedDate.toISOString(),
      };

      const updatedLoans = [newLoanAcc, ...loanAccounts];
      await saveData(accounts, transactions, updatedLoans);
    }

    setLoanAccountModalVisible(false);
  }

  async function toggleLoanNetWorth(loanAcc: LoanAccount) {
    const updatedLoans = loanAccounts.map((la) =>
      la.id === loanAcc.id
        ? { ...la, includeInNetWorth: la.includeInNetWorth === false ? true : false }
        : la
    );
    await saveData(accounts, transactions, updatedLoans);
  }

  function openInstallmentModal(loanAcc: LoanAccount) {
    setSelectedLoanAccount(loanAcc);
    setInstallmentType('installment');
    setInstallmentAmount('0');
    setSelectedPaymentWalletId('none');
    setInstallmentNote('');
    setInstallmentModalVisible(true);
  }

  async function handleRecordInstallment() {
    if (!selectedLoanAccount) return;
    const payAmt = parseFloat(installmentAmount) || 0;
    if (payAmt <= 0) {
      return showToast('Please enter a valid amount.', 'error');
    }

    const isLent = selectedLoanAccount.type === 'lent'; // To collect
    const isPayment = installmentType === 'installment';

    let newLoanBalance = selectedLoanAccount.totalAmount;
    if (isPayment) {
      newLoanBalance = Math.max(0, newLoanBalance - payAmt);
    } else {
      newLoanBalance = newLoanBalance + payAmt;
    }

    const updatedLoans = loanAccounts.map((la) =>
      la.id === selectedLoanAccount.id ? { ...la, totalAmount: newLoanBalance } : la
    );

    const newLTx: LoanTransaction = {
      id: 'ltx_' + Date.now(),
      loan_account_id: selectedLoanAccount.id,
      amount: payAmt,
      type: installmentType,
      wallet_account_id: selectedPaymentWalletId,
      note: installmentNote.trim(),
      created_at: selectedDate.toISOString(),
    };

    const updatedLTxs = [newLTx, ...loanTransactions];
    let updatedWallets = [...accounts];
    let updatedWalletTxs = [...transactions];

    if (selectedPaymentWalletId && selectedPaymentWalletId !== 'none') {
      const targetWallet = accounts.find((a) => a.id === selectedPaymentWalletId);
      if (targetWallet) {
        let walletBalanceChange = 0;
        if (isLent) {
          walletBalanceChange = isPayment ? payAmt : -payAmt;
        } else {
          walletBalanceChange = isPayment ? -payAmt : payAmt;
        }

        updatedWallets = accounts.map((a) =>
          a.id === selectedPaymentWalletId
            ? { ...a, balance: Number(a.balance) + walletBalanceChange }
            : a
        );

        const txCategory = isPayment
          ? isLent ? 'Fund Transfer' : 'Housing'
          : 'Fund Transfer';

        const newWalletTx: Transaction = {
          id: 'tx_' + Date.now(),
          account_id: selectedPaymentWalletId,
          amount: payAmt,
          type: walletBalanceChange >= 0 ? 'income' : 'expense',
          category: txCategory,
          note: `${isPayment ? 'Payment for' : 'Principal for'} ${selectedLoanAccount.name}`,
          created_at: selectedDate.toISOString(),
        };

        updatedWalletTxs = [newWalletTx, ...transactions];
      }
    }

    await saveData(updatedWallets, updatedWalletTxs, updatedLoans, updatedLTxs);

    setInstallmentModalVisible(false);
    setSelectedLoanAccount(null);
  }

  // --- Transaction Creation ---

  async function handleCreateTransaction() {
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) {
      return showToast('Please enter a valid positive amount.', 'error');
    }
    if (!selectedAccountId) {
      return showToast('Please select an account.', 'error');
    }

    setSubmittingTx(true);
    const targetAccount = accounts.find((acc) => acc.id === selectedAccountId);

    if (!targetAccount) {
      setSubmittingTx(false);
      return showToast('Selected account no longer exists.', 'error');
    }

    const updatedBalance = txType === 'income'
      ? Number(targetAccount.balance) + parsedAmount
      : Number(targetAccount.balance) - parsedAmount;

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      account_id: selectedAccountId,
      amount: parsedAmount,
      type: txType,
      category,
      note,
      created_at: selectedDate.toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    const updatedAccs = accounts.map((acc) =>
      acc.id === selectedAccountId ? { ...acc, balance: updatedBalance } : acc
    );

    await saveData(updatedAccs, updatedTxs);

    setAmount('0');
    setNote('');
    setTxModalVisible(false);
    setSubmittingTx(false);
  }

  // --- Daily Spending Limit Handler ---

  async function handleSaveDailyLimit() {
    const parsed = parseFloat(tempDailyLimit) || 0;
    if (parsed <= 0) {
      return showToast('Please enter a valid daily limit amount.', 'error');
    }
    setDailyLimit(parsed);
    setDailyLimitModalVisible(false);
    await saveData(accounts, transactions, loanAccounts, loanTransactions, parsed);
  }

  // --- Calculator Keypad Handlers ---

  function openCalcKeypad(initialValue: string, onApply: (val: string) => void) {
    setCalcValue(initialValue || '0');
    setCalcOnApply(() => onApply);
    setCalcModalVisible(true);
  }

  function handleCalcKeyPress(key: string) {
    if (key === 'AC') {
      setCalcValue('0');
      return;
    }
    if (key === '⌫') {
      if (calcValue.length <= 1) setCalcValue('0');
      else setCalcValue(calcValue.slice(0, -1));
      return;
    }
    if (key === '=') {
      evaluateCalc();
      return;
    }
    if (key === '+/-') {
      if (calcValue.startsWith('-')) setCalcValue(calcValue.slice(1));
      else if (calcValue !== '0') setCalcValue('-' + calcValue);
      return;
    }
    if (key === '✓') {
      evaluateCalc();
      if (calcOnApply) {
        calcOnApply(evaluateCalcString(calcValue));
      }
      setCalcModalVisible(false);
      return;
    }

    if (calcValue === '0' && key !== '.') {
      setCalcValue(key);
    } else {
      setCalcValue(calcValue + key);
    }
  }

  function evaluateCalc() {
    const res = evaluateCalcString(calcValue);
    setCalcValue(res);
  }

  function evaluateCalcString(exprStr: string): string {
    try {
      const cleanExpr = exprStr.replace(/×/g, '*').replace(/÷/g, '/');
      const res = Function(`'use strict'; return (${cleanExpr})`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return (Math.round(res * 100) / 100).toString();
      }
    } catch {
      // ignore
    }
    return exprStr;
  }

  // --- Tap-to-Swap Reordering Logic ---

  function handleAccountCardPress(acc: Account) {
    if (!selectedSwapCardId) {
      openEditAccountModal(acc);
      return;
    }

    if (selectedSwapCardId === acc.id) {
      setSelectedSwapCardId(null);
      return;
    }

    const fromIndex = accounts.findIndex((a) => a.id === selectedSwapCardId);
    const toIndex = accounts.findIndex((a) => a.id === acc.id);

    if (fromIndex !== -1 && toIndex !== -1) {
      const newAccs = [...accounts];
      const temp = newAccs[fromIndex];
      newAccs[fromIndex] = newAccs[toIndex];
      newAccs[toIndex] = temp;
      saveData(newAccs);
    }

    setSelectedSwapCardId(null);
  }

  function handleAccountCardLongPress(acc: Account) {
    setActiveTab('accounts');
    setSelectedSwapCardId(acc.id);
  }

  // --- Interest Calculations ---

  function getAccountInterestInfo(acc: Account) {
    const isBoostActive = Boolean(
      acc.boostedRate && acc.boostedRate > 0 && acc.boostDaysRemaining && acc.boostDaysRemaining > 0
    );

    const activeRate = isBoostActive ? acc.boostedRate! : acc.interestRate || 0;
    if (activeRate <= 0) return null;

    const annualInterest = (acc.balance * activeRate) / 100;
    const dailyInterest = annualInterest / 365;
    const monthlyInterest = annualInterest / 12;

    const freq = acc.interestFrequency || 'daily';
    let freqAmount = dailyInterest;
    let freqLabel = '/day';

    if (freq === 'monthly') {
      freqAmount = monthlyInterest;
      freqLabel = '/mo';
    } else if (freq === 'yearly') {
      freqAmount = annualInterest;
      freqLabel = '/yr';
    }

    return { activeRate, isBoostActive, freqAmount, freqLabel };
  }

  // --- Helper to Render Account Logo or Image ---

  function renderAccountLogo(acc: Account, size = 38) {
    if (acc.imageUri) {
      return (
        <Image
          source={{ uri: acc.imageUri }}
          style={{ width: size, height: size, borderRadius: 8, marginBottom: 10 }}
        />
      );
    }

    const logoInfo = getAccountLogo(acc.name, acc.type, acc.customIcon, acc.customColor);
    return (
      <View style={[styles.accountLogoBox, { width: size, height: size, backgroundColor: logoInfo.bg }]}>
        <Text style={[styles.accountLogoText, { color: logoInfo.fg }]}>{logoInfo.text}</Text>
      </View>
    );
  }

  function getAccountLogo(name: string, type: string, customIcon?: string, customColor?: string) {
    if (customIcon) {
      if (customIcon === 'maya') return { text: 'maya', bg: customColor || '#00D632', fg: '#000' };
      if (customIcon === 'BDO') return { text: 'BDO', bg: customColor || '#0033A0', fg: '#FFF' };
      if (customIcon === 'CIMB') return { text: 'CIMB', bg: customColor || '#ED1C24', fg: '#FFF' };
      if (customIcon === 'GO') return { text: 'GO', bg: customColor || '#00B4D8', fg: '#FFF' };
      if (customIcon === 'LBP') return { text: 'LBP', bg: customColor || '#00875A', fg: '#FFF' };
      if (customIcon === 'Mari') return { text: 'Mari', bg: customColor || '#EE4D2D', fg: '#FFF' };
      if (customIcon === 'GCash') return { text: 'GCash', bg: customColor || '#007CFF', fg: '#FFF' };
      if (customIcon === 'UB') return { text: 'UB', bg: customColor || '#FF6B00', fg: '#FFF' };
      if (customIcon === 'Sea') return { text: 'Sea', bg: customColor || '#00A859', fg: '#FFF' };

      return { text: customIcon, bg: customColor || '#10B981', fg: '#FFF' };
    }

    const lowerName = name.toLowerCase();
    if (lowerName.includes('maya')) return { text: 'maya', bg: customColor || '#00D632', fg: '#000' };
    if (lowerName.includes('bdo')) return { text: 'BDO', bg: customColor || '#0033A0', fg: '#FFF' };
    if (lowerName.includes('cimb')) return { text: 'CIMB', bg: customColor || '#ED1C24', fg: '#FFF' };
    if (lowerName.includes('gotyme')) return { text: 'GO', bg: customColor || '#00B4D8', fg: '#FFF' };
    if (lowerName.includes('landbank')) return { text: 'LBP', bg: customColor || '#00875A', fg: '#FFF' };
    if (lowerName.includes('mari')) return { text: 'Mari', bg: customColor || '#EE4D2D', fg: '#FFF' };
    if (lowerName.includes('gcash')) return { text: 'GCash', bg: customColor || '#007CFF', fg: '#FFF' };
    if (lowerName.includes('seabank')) return { text: 'Sea', bg: customColor || '#00A859', fg: '#FFF' };

    if (type === 'Wallet' || type === 'Cash') return { text: '💵', bg: customColor || '#10B981', fg: '#FFF' };
    if (type === 'Asset') return { text: '🪙', bg: customColor || '#F59E0B', fg: '#FFF' };
    if (type === 'Credit') return { text: '💳', bg: customColor || '#8B5CF6', fg: '#FFF' };
    if (type === 'Loans') return { text: '🔄', bg: customColor || '#F59E0B', fg: '#FFF' };
    return { text: '🏦', bg: customColor || '#3B82F6', fg: '#FFF' };
  }

  // --- Calculations ---

  const accountNetWorth = accounts
    .filter((acc) => acc.includeInNetWorth !== false)
    .reduce((sum, item) => sum + Number(item.balance), 0);

  const loanNetWorthImpact = loanAccounts
    .filter((la) => la.includeInNetWorth !== false)
    .reduce((sum, la) => {
      const amt = Number(la.totalAmount) || 0;
      return la.type === 'lent' ? sum + amt : sum - amt;
    }, 0);

  const netWorth = accountNetWorth + loanNetWorthImpact;

  const totalMoneyLentToCollect = loanAccounts
    .filter((i) => i.type === 'lent')
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const totalLoansToPay = loanAccounts
    .filter((i) => i.type === 'loan')
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const todayStr = new Date().toDateString();
  const todaySpent = transactions
    .filter((tx) => tx.type === 'expense' && new Date(tx.created_at).toDateString() === todayStr)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const remainingDaily = Math.max(0, dailyLimit - todaySpent);
  const spentRatio = Math.min(1, todaySpent / (dailyLimit || 1));

  const filteredLoanAccounts = loanAccounts.filter((item) => {
    if (lentLoanFilter === 'lent') return item.type === 'lent';
    if (lentLoanFilter === 'loan') return item.type === 'loan';
    return true;
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (overviewType === 'expense' && tx.type !== 'expense') return false;
    if (overviewType === 'income' && tx.type !== 'income') return false;

    const txDate = new Date(tx.created_at);
    const now = new Date();

    if (overviewPeriod === 'daily') return txDate.toDateString() === now.toDateString();
    if (overviewPeriod === 'monthly') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    if (overviewPeriod === 'yearly') return txDate.getFullYear() === now.getFullYear();

    return true;
  });

  const periodIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const periodExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const categoryTotals: Record<string, number> = {};
  filteredTransactions.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
  });

  const categoryList = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const totalCategorySum = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  const filteredAccounts = accounts.filter((acc) => {
    if (accountFilter === 'All') return true;
    return acc.type.toLowerCase() === accountFilter.toLowerCase();
  });

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    );
  }

  // --- First-Launch Username Onboarding Screen ---
  if (!username) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Wallet</Text>
            <Text style={styles.subtitle}>Your Private Offline Financial Tracker</Text>

            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeCardHeader}>Welcome to Wallet</Text>
              <Text style={styles.welcomeCardDesc}>
                All your finances, bank accounts, investments, and loan records stay strictly on your device with 100% privacy.
              </Text>

              <Text style={styles.inputLabel}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                value={tempUsernameInput}
                onChangeText={setTempUsernameInput}
                placeholder="e.g. Alex, John"
                placeholderTextColor="#64748b"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <TouchableOpacity style={styles.guestButton} onPress={handleSaveInitialUsername}>
                <Text style={styles.guestBtnText}>Get Started ›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Toast Notification Banner */}
      <Toast toast={toast} onDismiss={() => setToast({ visible: false, message: '' })} />

      {/* Confirmation Modal */}
      <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal({ visible: false, title: '', message: '' })} />
      {/* Top Bar Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#09090B' }}>
        <View style={styles.topBarHeader}>
          <TouchableOpacity style={styles.userProfilePill} onPress={() => setProfileModalVisible(true)}>
            <Text style={styles.userProfileText}>@{username}</Text>
            <Text style={styles.userProfileArrow}>›</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {activeTab === 'accounts' && (
              <TouchableOpacity style={styles.headerAddBtn} onPress={openCreateAccountModal}>
                <Text style={styles.headerAddBtnText}>+ Add Account</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setProfileModalVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="settings" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* --- Main Content Area based on Active Tab --- */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} nestedScrollEnabled>
            {/* Total Net Worth */}
            <View style={{ paddingVertical: 20 }}>
              <View style={styles.netWorthHeaderRow}>
                <Text style={styles.netWorthLabel}>Total Net Worth</Text>
                <TouchableOpacity onPress={() => setShowNetWorth(!showNetWorth)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name={showNetWorth ? 'eye' : 'eye-off'} size={18} color="#71717A" />
                </TouchableOpacity>
              </View>

              <Text style={styles.netWorthAmount}>
                {showNetWorth ? `₱${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱••••••••'}
              </Text>
            </View>

            {/* Accounts 2x2 Grid Preview */}
            <View style={styles.accountsGridHeader}>
              <Text style={styles.sectionHeading}>Accounts & Assets</Text>
              <TouchableOpacity onPress={() => setActiveTab('accounts')}>
                <Text style={styles.seeAllText}>See all accounts ›</Text>
              </TouchableOpacity>
            </View>

            {accounts.length === 0 ? (
              <View style={styles.emptyCardBox}>
                <Text style={styles.emptyCardTitle}>No accounts created yet</Text>
                <Text style={styles.emptyCardDesc}>Create your first wallet, savings account, or asset to begin tracking.</Text>
                <TouchableOpacity style={styles.emptyCardActionBtn} onPress={openCreateAccountModal}>
                  <Text style={styles.emptyCardActionBtnText}>+ Create Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountsGrid}>
                {accounts.slice(0, 4).map((acc) => {
                  const interestInfo = getAccountInterestInfo(acc);
                  const isAsset = acc.type === 'Asset';
                  const isSelectedForSwap = selectedSwapCardId === acc.id;

                  return (
                    <View key={acc.id} style={[styles.accountGridCard, isSelectedForSwap && styles.accountGridCardSelected]}>
                      <TouchableOpacity
                        onPress={() => handleAccountCardPress(acc)}
                        onLongPress={() => handleAccountCardLongPress(acc)}
                        delayLongPress={250}
                      >
                        {renderAccountLogo(acc)}

                        <Text style={styles.accountCardName} numberOfLines={1}>{acc.name}</Text>

                        <Text style={styles.accountCardBalance}>
                          {showNetWorth ? `₱${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱••••••'}
                        </Text>

                        <Text style={styles.accountCardType}>
                          {acc.type}
                          {acc.includeInNetWorth === false ? ' (Excluded)' : ''}
                        </Text>

                        {interestInfo && (
                          <View style={styles.interestTag}>
                            <Text style={styles.interestTagText}>
                              {interestInfo.isBoostActive ? '🚀 ' : '📈 '}
                              {interestInfo.activeRate}% p.a. (+₱{interestInfo.freqAmount.toFixed(2)}{interestInfo.freqLabel})
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {!selectedSwapCardId && (
                        <View style={styles.accountCardActionRow}>
                          <TouchableOpacity style={styles.accountAddTxBtn} onPress={() => openAddTxForAccount(acc.id)}>
                            <Text style={styles.accountAddTxBtnText}>+ Entry</Text>
                          </TouchableOpacity>
                          {isAsset && (
                            <TouchableOpacity style={styles.assetAddBtn} onPress={() => openAdjustAssetValueModal(acc)}>
                              <Text style={styles.assetAddBtnText}>+ Value</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Editable Daily Limit Card */}
            <View style={styles.dailyLimitCard}>
              <View style={styles.dailyLimitHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Feather name="sliders" size={18} color="#10B981" />
                  <View>
                    <Text style={styles.dailyLimitTitle}>Daily Limit</Text>
                    <Text style={styles.dailyLimitAmount}>₱{dailyLimit.toFixed(2)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.editLimitBtn} onPress={() => setDailyLimitModalVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="sliders" size={16} color="#A1A1AA" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${spentRatio * 100}%` }]} />
              </View>

              <View style={styles.dailyLimitFooter}>
                <Text style={styles.dailyLimitSpent}>Spent: ₱{todaySpent.toFixed(2)}</Text>
                <Text style={styles.dailyLimitRemaining}>Remaining: ₱{remainingDaily.toFixed(2)}</Text>
              </View>
            </View>

            {/* Recent Activity List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Transactions</Text>
              <TouchableOpacity onPress={() => setActiveTab('insights')}>
                <Text style={styles.seeAllText}>View all ›</Text>
              </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
              <Text style={styles.emptyText}>No transactions logged yet.</Text>
            ) : (
              transactions.slice(0, 5).map((tx) => {
                const isExpense = tx.type === 'expense';
                const txAcc = accounts.find((a) => a.id === tx.account_id);
                const logoInfo = txAcc
                  ? getAccountLogo(txAcc.name, txAcc.type, txAcc.customIcon, txAcc.customColor)
                  : { text: '💸', bg: '#334155', fg: '#FFF' };

                return (
                  <View key={tx.id} style={styles.transactionCard}>
                    {txAcc && txAcc.imageUri ? (
                      <Image source={{ uri: txAcc.imageUri }} style={{ width: 34, height: 34, borderRadius: 8 }} />
                    ) : (
                      <View style={[styles.txLogoBox, { backgroundColor: logoInfo.bg }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: logoInfo.fg }}>{logoInfo.text}</Text>
                      </View>
                    )}

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={styles.txCategory}>{tx.category}</Text>
                      <Text style={styles.txDate}>
                        {tx.note ? `${tx.note} • ` : ''}
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.txAmount, isExpense ? styles.expenseText : styles.incomeText]}>
                      {isExpense ? '- ' : '+ '}₱{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })
            )}

            {/* --- Dedicated Section for Money Lent & Loans --- */}
            <View style={{ marginTop: 18 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Money Lent & Loans</Text>
                <TouchableOpacity onPress={() => setLoansFullViewVisible(true)}>
                  <Text style={styles.seeAllText}>See all loans ›</Text>
                </TouchableOpacity>
              </View>

              {loanAccounts.length === 0 ? (
                <Text style={styles.emptyText}>No loan accounts created yet.</Text>
              ) : (
                loanAccounts.slice(0, 2).map((loanAcc) => {
                  const isLent = loanAcc.type === 'lent';

                  return (
                    <TouchableOpacity key={loanAcc.id} style={styles.transactionCard} onPress={() => openInstallmentModal(loanAcc)}>
                      <View style={[styles.txLogoBox, { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' }]}>
                        <Feather name={isLent ? 'arrow-up-right' : 'arrow-down-left'} size={16} color={isLent ? '#10B981' : '#EF4444'} />
                      </View>

                      <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={styles.txCategory}>{loanAcc.name}</Text>
                        <Text style={styles.txDate}>
                          {isLent ? 'Money Lent' : 'Loan'} • {loanAcc.note || new Date(loanAcc.created_at).toLocaleDateString()}
                        </Text>
                      </View>

                      <Text style={[styles.txAmount, isLent ? styles.incomeText : styles.expenseText]}>
                        {isLent ? '+ ' : '- '}₱{Number(loanAcc.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}

              <TouchableOpacity style={styles.addLoanAccountBtn} onPress={openCreateLoanAccountModal}>
                <Text style={styles.addLoanAccountBtnText}>+ Add Loan / Borrowed Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* --- Full Accounts Tab Screen --- */}
        {activeTab === 'accounts' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} nestedScrollEnabled>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.pageTitle}>Manage Accounts & Assets</Text>
            </View>

            <View style={styles.netWorthCard}>
              <View style={styles.netWorthHeaderRow}>
                <Text style={styles.netWorthLabel}>Total Net Worth</Text>
                <TouchableOpacity onPress={() => setShowNetWorth(!showNetWorth)}>
                  <Text style={styles.eyeIcon}>{showNetWorth ? '👁' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.netWorthAmount}>
                {showNetWorth ? `₱${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱••••••••'}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {['All', 'Wallet', 'Savings', 'Asset', 'Credit', 'Loans'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, accountFilter === filter && styles.activeFilterChip]}
                  onPress={() => setAccountFilter(filter)}
                >
                  <Text style={[styles.filterChipText, accountFilter === filter && styles.activeFilterChipText]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.accountsGrid}>
              {filteredAccounts.map((acc) => {
                const interestInfo = getAccountInterestInfo(acc);
                const isAsset = acc.type === 'Asset';
                const originalIndex = accounts.findIndex((a) => a.id === acc.id);
                const isSelectedForSwap = selectedSwapCardId === acc.id;

                return (
                  <View key={acc.id} style={[styles.accountGridCard, isSelectedForSwap && styles.accountGridCardSelected]}>
                    <TouchableOpacity
                      onPress={() => handleAccountCardPress(acc)}
                      onLongPress={() => handleAccountCardLongPress(acc)}
                      delayLongPress={250}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {renderAccountLogo(acc)}

                        {originalIndex < 4 && (
                          <View style={styles.topFourBadge}>
                            <Text style={styles.topFourBadgeText}>Home #{originalIndex + 1}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.accountCardName} numberOfLines={1}>{acc.name}</Text>

                      <Text style={styles.accountCardBalance}>
                        {showNetWorth ? `₱${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱••••••'}
                      </Text>

                      <Text style={styles.accountCardType}>
                        {acc.type}
                        {acc.includeInNetWorth === false ? ' (Excluded)' : ''}
                      </Text>

                      {interestInfo && (
                        <View style={styles.interestTag}>
                          <Text style={styles.interestTagText}>
                            {interestInfo.isBoostActive ? '🚀 ' : '📈 '}
                            {interestInfo.activeRate}% p.a. (+₱{interestInfo.freqAmount.toFixed(2)}{interestInfo.freqLabel})
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {!selectedSwapCardId && (
                      <View style={styles.accountCardActionRow}>
                        <TouchableOpacity style={styles.accountAddTxBtn} onPress={() => openAddTxForAccount(acc.id)}>
                          <Text style={styles.accountAddTxBtnText}>+ Entry</Text>
                        </TouchableOpacity>
                        {isAsset && (
                          <TouchableOpacity style={styles.assetAddBtn} onPress={() => openAdjustAssetValueModal(acc)}>
                            <Text style={styles.assetAddBtnText}>+ Value</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity style={styles.addAccountDashedCard} onPress={openCreateAccountModal}>
                <Text style={styles.addAccountPlusIcon}>+</Text>
                <Text style={styles.addAccountText}>Add Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* --- Overview & Analytics Tab Screen --- */}
        {activeTab === 'insights' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} nestedScrollEnabled>
            <Text style={styles.pageTitle}>Financial Overview</Text>

            <View style={styles.periodTabContainer}>
              {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[styles.periodTab, overviewPeriod === period && styles.activePeriodTab]}
                  onPress={() => setOverviewPeriod(period)}
                >
                  <Text style={[styles.periodTabText, overviewPeriod === period && styles.activePeriodTabText]}>{period.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.typeTabContainer}>
              {(['all', 'expense', 'income'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeTab, overviewType === type && styles.activeTypeTab]}
                  onPress={() => setOverviewType(type)}
                >
                  <Text style={[styles.typeTabText, overviewType === type && styles.activeTypeTabText]}>
                    {type === 'all' ? 'ALL' : type === 'expense' ? 'EXPENSES' : 'INCOME'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { borderColor: '#34d399' }]}>
                <Text style={styles.kpiLabel}>Income</Text>
                <Text style={styles.kpiIncomeValue}>+₱{periodIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#f87171' }]}>
                <Text style={styles.kpiLabel}>Expenses</Text>
                <Text style={styles.kpiExpenseValue}>-₱{periodExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>

            <View style={styles.breakdownCard}>
              <Text style={styles.sectionHeading}>Category Breakdown</Text>
              {categoryList.length === 0 ? (
                <Text style={styles.emptyText}>No data for selected period.</Text>
              ) : (
                categoryList.map(([catName, catVal]) => {
                  const pct = Math.round((catVal / totalCategorySum) * 100);
                  return (
                    <View key={catName} style={{ marginBottom: 12 }}>
                      <View style={styles.categoryRowHeader}>
                        <Text style={styles.categoryName}>{catName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.categoryValue}>
                            ₱{catVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <Text style={{ color: '#64748b' }}>({pct}%)</Text>
                          </Text>
                          <TouchableOpacity
                            style={styles.catAddEntryBtn}
                            onPress={() => openAddTxForCategory(catName)}
                          >
                            <Text style={styles.catAddEntryBtnText}>+ Entry</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.categoryBarTrack}>
                        <View style={[styles.categoryBarFill, { width: `${pct}%` }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <Text style={styles.sectionHeading}>Filtered Records</Text>
            {filteredTransactions.length === 0 ? (
              <Text style={styles.emptyText}>No matching transactions found.</Text>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const txAcc = accounts.find((a) => a.id === tx.account_id);
                const logoInfo = txAcc
                  ? getAccountLogo(txAcc.name, txAcc.type, txAcc.customIcon, txAcc.customColor)
                  : { text: '💸', bg: '#334155', fg: '#FFF' };

                return (
                  <View key={tx.id} style={styles.transactionCard}>
                    {txAcc && txAcc.imageUri ? (
                      <Image source={{ uri: txAcc.imageUri }} style={{ width: 34, height: 34, borderRadius: 8 }} />
                    ) : (
                      <View style={[styles.txLogoBox, { backgroundColor: logoInfo.bg }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: logoInfo.fg }}>{logoInfo.text}</Text>
                      </View>
                    )}

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={styles.txCategory}>{tx.category}</Text>
                      <Text style={styles.txDate}>
                        {tx.note ? `${tx.note} • ` : ''}
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.txAmount, isExpense ? styles.expenseText : styles.incomeText]}>
                      {isExpense ? '- ' : '+ '}₱{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* --- Bottom Navigation Bar --- */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('home')}>
          <Feather name="home" size={20} color={activeTab === 'home' ? '#FAFAFA' : '#71717A'} />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerFab} onPress={() => setTxModalVisible(true)}>
          <Feather name="plus" size={20} color="#09090B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('insights')}>
          <Feather name="pie-chart" size={20} color={activeTab === 'insights' ? '#FAFAFA' : '#71717A'} />
          <Text style={[styles.navLabel, activeTab === 'insights' && styles.activeNavLabel]}>Overview</Text>
        </TouchableOpacity>
      </View>

      {/* --- Modals & Custom Keypad --- */}

      {/* Custom Bottom Sheet Calculator Keypad Modal */}
      <Modal visible={calcModalVisible} transparent animationType="slide" onRequestClose={() => setCalcModalVisible(false)}>
        <View style={styles.calcOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setCalcModalVisible(false)} />
          <View style={styles.calcSheetContainer}>
            <View style={styles.calcDragIndicator} />

            <View style={styles.calcDisplayBox}>
              <Text style={styles.calcDisplayLabel}>Amount</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.calcDisplayText}>₱{calcValue}</Text>
                <TouchableOpacity onPress={() => setCalcValue('0')}>
                  <Text style={{ fontSize: 18, color: '#64748b' }}>📋</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.keypadGrid}>
              {/* Row 1 */}
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('AC')}><Text style={styles.keyTextDark}>AC</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('÷')}><Text style={styles.keyTextDark}>÷</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('×')}><Text style={styles.keyTextDark}>×</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('⌫')}><Text style={styles.keyTextDark}>⌫</Text></TouchableOpacity>

              {/* Row 2 */}
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('7')}><Text style={styles.keyTextDark}>7</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('8')}><Text style={styles.keyTextDark}>8</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('9')}><Text style={styles.keyTextDark}>9</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('+')}><Text style={styles.keyTextDark}>+</Text></TouchableOpacity>

              {/* Row 3 */}
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('4')}><Text style={styles.keyTextDark}>4</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('5')}><Text style={styles.keyTextDark}>5</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('6')}><Text style={styles.keyTextDark}>6</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('-')}><Text style={styles.keyTextDark}>-</Text></TouchableOpacity>

              {/* Row 4 */}
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('1')}><Text style={styles.keyTextDark}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('2')}><Text style={styles.keyTextDark}>2</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('3')}><Text style={styles.keyTextDark}>3</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnDark} onPress={() => handleCalcKeyPress('=')}><Text style={styles.keyTextWhite}>=</Text></TouchableOpacity>

              {/* Row 5 */}
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('.')}><Text style={styles.keyTextDark}>.</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('0')}><Text style={styles.keyTextDark}>0</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnLight} onPress={() => handleCalcKeyPress('+/-')}><Text style={styles.keyTextDark}>+/-</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keyBtnGreen} onPress={() => handleCalcKeyPress('✓')}><Text style={styles.keyTextWhite}>✓</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Date Picker Modal */}
      <Modal visible={calendarVisible} transparent animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(prev);
              }}>
                <Text style={{ fontSize: 18, color: '#38bdf8' }}>‹ Prev Day</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#f8fafc' }}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(next);
              }}>
                <Text style={{ fontSize: 18, color: '#38bdf8' }}>Next Day ›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.saveBtnText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={timePickerVisible} transparent animationType="fade" onRequestClose={() => setTimePickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#38bdf8', textAlign: 'center', marginBottom: 16 }}>
              {selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <TouchableOpacity style={styles.filterChip} onPress={() => {
                const updated = new Date(selectedDate);
                updated.setHours((updated.getHours() + 1) % 24);
                setSelectedDate(updated);
              }}>
                <Text style={styles.filterChipText}>+1 Hour</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterChip} onPress={() => {
                const updated = new Date(selectedDate);
                updated.setMinutes((updated.getMinutes() + 15) % 60);
                setSelectedDate(updated);
              }}>
                <Text style={styles.filterChipText}>+15 Mins</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setTimePickerVisible(false)}>
              <Text style={styles.saveBtnText}>Confirm Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loans Full View Screen Modal */}
      <Modal visible={loansFullViewVisible} animationType="slide" onRequestClose={() => setLoansFullViewVisible(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.topBarHeader}>
            <Text style={styles.pageTitle}>All Loans & Money Lent</Text>
            <TouchableOpacity onPress={() => setLoansFullViewVisible(false)}>
              <Text style={{ fontSize: 22, color: '#38bdf8', fontWeight: '700' }}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.periodTabContainer}>
              {(['all', 'lent', 'loan'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.periodTab, lentLoanFilter === filter && styles.activePeriodTab]}
                  onPress={() => setLentLoanFilter(filter)}
                >
                  <Text style={[styles.periodTabText, lentLoanFilter === filter && styles.activePeriodTabText]}>
                    {filter === 'all' ? 'ALL' : filter === 'lent' ? 'TO COLLECT' : 'TO PAY'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { borderColor: '#34d399' }]}>
                <Text style={styles.kpiLabel}>To Collect (Lent)</Text>
                <Text style={styles.kpiIncomeValue}>+₱{totalMoneyLentToCollect.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#f87171' }]}>
                <Text style={styles.kpiLabel}>To Pay (Loans)</Text>
                <Text style={styles.kpiExpenseValue}>-₱{totalLoansToPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>

            {filteredLoanAccounts.map((loanAcc) => {
              const isLent = loanAcc.type === 'lent';
              const isExcluded = loanAcc.includeInNetWorth === false;

              return (
                <View key={loanAcc.id} style={styles.loanCardContainer}>
                  <View style={styles.transactionCard}>
                    <View style={[styles.txLogoBox, { backgroundColor: isLent ? '#059669' : '#DC2626' }]}>
                      <Text style={{ fontSize: 12 }}>{isLent ? '🤝' : '🏦'}</Text>
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={styles.txCategory}>{loanAcc.name}</Text>
                      <Text style={styles.txDate}>
                        {isLent ? 'Money Lent Account' : 'Loan Account'} • {loanAcc.note || new Date(loanAcc.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.txAmount, isLent ? styles.incomeText : styles.expenseText]}>
                        {isLent ? '+ ' : '- '}₱{Number(loanAcc.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>

                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <TouchableOpacity style={styles.loanEntryBtn} onPress={() => openInstallmentModal(loanAcc)}>
                          <Text style={styles.loanEntryBtnText}>+ Entry 💳</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loanEditBtn} onPress={() => openEditLoanAccountModal(loanAcc)}>
                          <Text style={styles.loanEditBtnText}>✏️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.loanNetWorthRow}>
                    <Text style={styles.loanNetWorthLabel}>
                      {isExcluded ? 'Excluded from Total Net Worth' : 'Included in Total Net Worth'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.netWorthPillBtn, isExcluded ? styles.netWorthPillOff : styles.netWorthPillOn]}
                      onPress={() => toggleLoanNetWorth(loanAcc)}
                    >
                      <Text style={[styles.netWorthPillText, isExcluded ? styles.netWorthPillTextOff : styles.netWorthPillTextOn]}>
                        {isExcluded ? 'Include ➕' : 'Exclude ➖'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.addLoanAccountBtn} onPress={openCreateLoanAccountModal}>
              <Text style={styles.addLoanAccountBtnText}>+ Add Loan / Borrowed Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Loan Account Modal */}
      <Modal visible={loanAccountModalVisible} transparent animationType="slide" onRequestClose={() => setLoanAccountModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingLoanAccount ? 'Edit Loan / Lent Account' : 'Create Loan / Lent Account'}</Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, loanAccountType === 'lent' && styles.toggleIncomeActive]}
                  onPress={() => setLoanAccountType('lent')}
                >
                  <Text style={[styles.toggleText, loanAccountType === 'lent' && styles.toggleTextActive]}>Money Lent (To Collect)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, loanAccountType === 'loan' && styles.toggleExpenseActive]}
                  onPress={() => setLoanAccountType('loan')}
                >
                  <Text style={[styles.toggleText, loanAccountType === 'loan' && styles.toggleTextActive]}>Loan (To Pay)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{loanAccountType === 'lent' ? 'Borrower Person / Entity' : 'Lender Bank / Person'}</Text>
              <TextInput
                style={styles.modalInput}
                value={loanAccountName}
                onChangeText={setLoanAccountName}
                placeholder="e.g. John Doe, Landbank"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Principal Amount (₱)</Text>
              <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(loanAccountAmount, setLoanAccountAmount)}>
                <Text style={{ color: '#fff', fontSize: 16 }}>₱{loanAccountAmount}</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Note</Text>
              <TextInput
                style={styles.modalInput}
                value={loanAccountNote}
                onChangeText={setLoanAccountNote}
                placeholder="Optional note"
                placeholderTextColor="#64748b"
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Include in Total Net Worth</Text>
                <Switch
                  value={loanIncludeInNetWorth}
                  onValueChange={setLoanIncludeInNetWorth}
                  trackColor={{ false: '#334155', true: '#38bdf8' }}
                  thumbColor={loanIncludeInNetWorth ? '#0f172a' : '#94a3b8'}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setLoanAccountModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveLoanAccount}>
                  <Text style={styles.saveBtnText}>{editingLoanAccount ? 'Save Changes' : 'Save Account'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Record Installment Modal */}
      <Modal visible={installmentModalVisible} transparent animationType="slide" onRequestClose={() => setInstallmentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Record Payment for {selectedLoanAccount?.name}</Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, installmentType === 'installment' && styles.toggleIncomeActive]}
                  onPress={() => setInstallmentType('installment')}
                >
                  <Text style={[styles.toggleText, installmentType === 'installment' && styles.toggleTextActive]}>Pay Installment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, installmentType === 'principal' && styles.toggleExpenseActive]}
                  onPress={() => setInstallmentType('principal')}
                >
                  <Text style={[styles.toggleText, installmentType === 'principal' && styles.toggleTextActive]}>Add Principal</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Amount (₱)</Text>
              <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(installmentAmount, setInstallmentAmount)}>
                <Text style={{ color: '#fff', fontSize: 16 }}>₱{installmentAmount}</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Transfer Payment From / To Wallet</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, selectedPaymentWalletId === 'none' && styles.chipActive]}
                  onPress={() => setSelectedPaymentWalletId('none')}
                >
                  <Text style={[styles.chipText, selectedPaymentWalletId === 'none' && styles.chipTextActive]}>None (Cash/External)</Text>
                </TouchableOpacity>

                {accounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    style={[styles.chip, selectedPaymentWalletId === acc.id && styles.chipActive]}
                    onPress={() => setSelectedPaymentWalletId(acc.id)}
                  >
                    <Text style={[styles.chipText, selectedPaymentWalletId === acc.id && styles.chipTextActive]}>{acc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Note</Text>
              <TextInput
                style={styles.modalInput}
                value={installmentNote}
                onChangeText={setInstallmentNote}
                placeholder="Optional note e.g. Oct Payment"
                placeholderTextColor="#64748b"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setInstallmentModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleRecordInstallment}>
                  <Text style={styles.saveBtnText}>Record Payment</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Asset Value Adjustment Modal */}
      <Modal visible={assetAdjustModalVisible} transparent animationType="fade" onRequestClose={() => setAssetAdjustModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>Adjust Asset Value ({adjustTargetAccount?.name})</Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, adjustType === 'add' && styles.toggleIncomeActive]} onPress={() => setAdjustType('add')}>
                <Text style={[styles.toggleText, adjustType === 'add' && styles.toggleTextActive]}>+ Increase Value</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toggleBtn, adjustType === 'subtract' && styles.toggleExpenseActive]} onPress={() => setAdjustType('subtract')}>
                <Text style={[styles.toggleText, adjustType === 'subtract' && styles.toggleTextActive]}>- Decrease Value</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Value Amount (₱)</Text>
            <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(adjustAmount, setAdjustAmount)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>₱{adjustAmount}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAssetAdjustModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAssetAdjustment}>
                <Text style={styles.saveBtnText}>Update Value</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Daily Limit Modal */}
      <Modal visible={dailyLimitModalVisible} transparent animationType="fade" onRequestClose={() => setDailyLimitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>Set Daily Spending Limit</Text>
            <Text style={styles.inputLabel}>Daily Limit (₱)</Text>

            <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(tempDailyLimit, setTempDailyLimit)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>₱{tempDailyLimit}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDailyLimitModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDailyLimit}>
                <Text style={styles.saveBtnText}>Save Limit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile & Settings Modal */}
      <Modal visible={profileModalVisible} transparent animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>User Settings</Text>

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editUsernameInput}
              onChangeText={setEditUsernameInput}
              placeholder="e.g. Alex"
              placeholderTextColor="#64748b"
              autoCapitalize="words"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateUsername}>
              <Text style={styles.saveBtnText}>Save Name</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' }}>
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                🔒 100% Private & Offline
              </Text>
              <Text style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
                All transactions, wallets, and loan records are stored strictly on this device.
              </Text>
            </View>

            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setProfileModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Transaction Modal */}
      <Modal visible={txModalVisible} transparent animationType="slide" onRequestClose={() => setTxModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Add Transaction</Text>

              {/* Type Switcher */}
              <View style={styles.toggleRow}>
                <TouchableOpacity style={[styles.toggleBtn, txType === 'expense' && styles.toggleExpenseActive]} onPress={() => setTxType('expense')}>
                  <Text style={[styles.toggleText, txType === 'expense' && styles.toggleTextActive]}>Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.toggleBtn, txType === 'income' && styles.toggleIncomeActive]} onPress={() => setTxType('income')}>
                  <Text style={[styles.toggleText, txType === 'income' && styles.toggleTextActive]}>Income</Text>
                </TouchableOpacity>
              </View>

              {/* Date & Time Selector Row */}
              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.dateTimeCard} onPress={() => setCalendarVisible(true)}>
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.dateTimeValue}>
                      {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Text style={{ fontSize: 12 }}>✏️</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateTimeCard} onPress={() => setTimePickerVisible(true)}>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.dateTimeValue}>
                      {selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={{ fontSize: 12 }}>✏️</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Amount Display with Calculator Keypad Trigger */}
              <Text style={styles.inputLabel}>Amount (₱)</Text>
              <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(amount, setAmount)}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>₱{amount}</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Select Account</Text>
              <View style={styles.chipRow}>
                {accounts.length === 0 ? (
                  <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>No accounts available. Add an account first!</Text>
                ) : (
                  accounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[styles.chip, selectedAccountId === acc.id && styles.chipActive]}
                      onPress={() => setSelectedAccountId(acc.id)}
                    >
                      <Text style={[styles.chipText, selectedAccountId === acc.id && styles.chipTextActive]}>{acc.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipRow}>
                {(accounts.find((a) => a.id === selectedAccountId)?.customCategories
                  ? [...categoryOptions, ...accounts.find((a) => a.id === selectedAccountId)!.customCategories!]
                  : categoryOptions
                ).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, category === option && styles.chipActive]}
                    onPress={() => setCategory(option)}
                  >
                    <Text style={[styles.chipText, category === option && styles.chipTextActive]}>{option}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#38bdf8' }]}
                  onPress={() => {
                    if (!selectedAccountId) {
                      showToast('Please select an account before adding a custom category.', 'warning');
                      return;
                    }
                    setAddCategoryModalVisible(true);
                  }}
                >
                  <Text style={{ color: '#38bdf8', fontWeight: '700', fontSize: 13 }}>+ Add Category</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Note</Text>
              <TextInput
                style={styles.modalInput}
                value={note}
                onChangeText={setNote}
                placeholder="Optional note"
                placeholderTextColor="#64748b"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setTxModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTransaction} disabled={submittingTx}>
                  {submittingTx ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.saveBtnText}>Save Entry</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Custom Category Modal */}
      <Modal visible={addCategoryModalVisible} transparent animationType="fade" onRequestClose={() => setAddCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <Text style={styles.modalTitle}>
              Add Category ({accounts.find((a) => a.id === selectedAccountId)?.name || 'Account'})
            </Text>
            <Text style={styles.inputLabel}>New Category Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newCategoryInput}
              onChangeText={setNewCategoryInput}
              placeholder="e.g. Subscriptions, Pet Care, Utilities"
              placeholderTextColor="#64748b"
              autoFocus
            />
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
              This category will be applied specifically to {accounts.find((a) => a.id === selectedAccountId)?.name || 'this account'} only.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddCategoryModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCustomCategory}>
                <Text style={styles.saveBtnText}>Save Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add / Edit Account Modal */}
      <Modal visible={accountModalVisible} transparent animationType="slide" onRequestClose={() => setAccountModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingAccount ? 'Edit Account / Asset' : 'Add New Account / Asset'}</Text>

              <Text style={styles.inputLabel}>Wallet Icon / Photo</Text>
              <View style={styles.logoPickerBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  {accountImageUri ? (
                    <Image source={{ uri: accountImageUri }} style={{ width: 48, height: 48, borderRadius: 10, marginRight: 12 }} />
                  ) : (
                    <View style={[styles.accountLogoBox, { width: 48, height: 48, borderRadius: 10, backgroundColor: accountCustomColor, marginRight: 12 }]}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFF' }}>
                        {accountCustomIcon === 'maya' ? 'maya' : accountCustomIcon === 'BDO' ? 'BDO' : accountCustomIcon === 'GO' ? 'GO' : accountCustomIcon === 'LBP' ? 'LBP' : accountCustomIcon === 'Mari' ? 'Mari' : accountCustomIcon === 'CIMB' ? 'CIMB' : accountCustomIcon === 'GCash' ? 'GCash' : accountCustomIcon === 'Sea' ? 'Sea' : accountCustomIcon || '🏦'}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.pickPhotoBtn} onPress={handlePickWalletPhoto}>
                    <Text style={styles.pickPhotoBtnText}>📸 Pick Photo from Gallery</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subInputLabel}>Preset Digital Bank / Wallet Logos</Text>
                <View style={styles.chipRow}>
                  {presetBrandIcons.map((brand) => (
                    <TouchableOpacity
                      key={brand.key}
                      style={[styles.brandChip, { backgroundColor: brand.bg }, accountCustomIcon === brand.key && !accountImageUri && styles.chipActiveBorder]}
                      onPress={() => { setAccountCustomIcon(brand.key); setAccountCustomColor(brand.bg); setAccountImageUri(undefined); }}
                    >
                      <Text style={[styles.brandChipText, { color: brand.fg }]}>{brand.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.subInputLabel}>Preset Icons</Text>
                <View style={styles.chipRow}>
                  {presetEmojiIcons.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.emojiChip, accountCustomIcon === emoji && !accountImageUri && styles.chipActiveBorder]}
                      onPress={() => { setAccountCustomIcon(emoji); setAccountImageUri(undefined); }}
                    >
                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.subInputLabel}>Badge Background Color</Text>
                <View style={styles.chipRow}>
                  {colorPalette.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorCircle, { backgroundColor: color }, accountCustomColor === color && styles.colorCircleActive]}
                      onPress={() => setAccountCustomColor(color)}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.modalInput}
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="e.g. Maya, Landbank, MariBank, Gold Asset"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.chipRow}>
                {accountTypeOptions.map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption}
                    style={[styles.chip, newAccountType === typeOption && styles.chipActive]}
                    onPress={() => setNewAccountType(typeOption)}
                  >
                    <Text style={[styles.chipText, newAccountType === typeOption && styles.chipTextActive]}>{typeOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Balance / Value (₱)</Text>
              <TouchableOpacity style={styles.modalInput} onPress={() => openCalcKeypad(newAccountBalance, setNewAccountBalance)}>
                <Text style={{ color: '#fff', fontSize: 16 }}>₱{newAccountBalance}</Text>
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Include in Total Net Worth</Text>
                <Switch
                  value={includeInNetWorth}
                  onValueChange={setIncludeInNetWorth}
                  trackColor={{ false: '#334155', true: '#38bdf8' }}
                  thumbColor={includeInNetWorth ? '#0f172a' : '#94a3b8'}
                />
              </View>

              <View style={styles.interestSectionBox}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Calculate Interest Earned</Text>
                  <Switch
                    value={enableInterest}
                    onValueChange={setEnableInterest}
                    trackColor={{ false: '#334155', true: '#38bdf8' }}
                    thumbColor={enableInterest ? '#0f172a' : '#94a3b8'}
                  />
                </View>

                {enableInterest && (
                  <>
                    <Text style={styles.inputLabel}>Base Interest Rate (% p.a.)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={baseInterestRate}
                      onChangeText={setBaseInterestRate}
                      placeholder="e.g. 3.5"
                      placeholderTextColor="#64748b"
                      keyboardType="decimal-pad"
                    />

                    <Text style={styles.inputLabel}>Reflect Interest Earnings</Text>
                    <View style={styles.chipRow}>
                      {(['daily', 'monthly', 'yearly'] as const).map((freq) => (
                        <TouchableOpacity
                          key={freq}
                          style={[styles.chip, interestFrequency === freq && styles.chipActive]}
                          onPress={() => setInterestFrequency(freq)}
                        >
                          <Text style={[styles.chipText, interestFrequency === freq && styles.chipTextActive]}>{freq.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>🚀 Enable Promo Rate Boost</Text>
                      <Switch
                        value={enableBoost}
                        onValueChange={setEnableBoost}
                        trackColor={{ false: '#334155', true: '#10b981' }}
                        thumbColor={enableBoost ? '#0f172a' : '#94a3b8'}
                      />
                    </View>

                    {enableBoost && (
                      <>
                        <Text style={styles.inputLabel}>Boosted Rate (% p.a.)</Text>
                        <TextInput
                          style={styles.modalInput}
                          value={boostedRate}
                          onChangeText={setBoostedRate}
                          placeholder="e.g. 6.0"
                          placeholderTextColor="#64748b"
                          keyboardType="decimal-pad"
                        />

                        <Text style={styles.inputLabel}>Boost Duration (Days)</Text>
                        <TextInput
                          style={styles.modalInput}
                          value={boostDays}
                          onChangeText={setBoostDays}
                          placeholder="e.g. 30"
                          placeholderTextColor="#64748b"
                          keyboardType="number-pad"
                        />
                      </>
                    )}
                  </>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAccountModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAccount} disabled={creatingAccount}>
                  {creatingAccount ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.saveBtnText}>{editingAccount ? 'Save Changes' : 'Add Account'}</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingHorizontal: 16 },
  authScroll: { paddingVertical: 40, paddingHorizontal: 8, justifyContent: 'center' },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 36, color: '#FAFAFA', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: '#A1A1AA', textAlign: 'center', marginBottom: 28 },
  inputLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2 },
  subInputLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: '#71717A', marginBottom: 6, marginTop: 4 },
  input: { fontFamily: 'PlusJakartaSans_400Regular', backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', color: '#FAFAFA', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 16 },

  welcomeCard: { backgroundColor: '#111113', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#1E1E22' },
  welcomeCardHeader: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#FAFAFA', marginBottom: 8, textAlign: 'center' },
  welcomeCardDesc: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: '#A1A1AA', textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  guestButton: { backgroundColor: '#FAFAFA', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  guestBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B', fontSize: 15 },

  // Empty Card Box
  emptyCardBox: { backgroundColor: '#111113', borderRadius: 16, padding: 24, alignItems: 'center', marginVertical: 12, borderWidth: 1, borderColor: '#27272A', borderStyle: 'dashed' },
  emptyCardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FAFAFA', marginBottom: 6 },
  emptyCardDesc: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: '#A1A1AA', textAlign: 'center', marginBottom: 16 },
  emptyCardActionBtn: { backgroundColor: '#FAFAFA', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  emptyCardActionBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B', fontSize: 14 },

  // Top Bar Header
  topBarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  userProfilePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111113', borderWidth: 1, borderColor: '#1E1E22', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  userProfileText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#FAFAFA', fontSize: 14 },
  guestBadge: { fontFamily: 'PlusJakartaSans_700Bold', backgroundColor: '#18181B', color: '#A1A1AA', fontSize: 10, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 10, marginLeft: 6 },
  userProfileArrow: { fontFamily: 'PlusJakartaSans_700Bold', color: '#71717A', marginLeft: 6 },
  headerAddBtn: { backgroundColor: '#FAFAFA', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16 },
  headerAddBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#09090B', fontSize: 13 },

  // Cards
  netWorthCard: { backgroundColor: '#111113', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#1E1E22' },
  netWorthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netWorthLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1.4 },
  eyeIcon: { fontSize: 16, color: '#71717A' },
  netWorthAmount: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 40, color: '#FAFAFA', marginTop: 8, fontVariant: ['tabular-nums'] },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 10 },
  accountsGridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FAFAFA' },
  seeAllText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: '#A1A1AA' },
  pageTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: '#FAFAFA' },

  topFourBadge: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  topFourBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#A1A1AA', fontSize: 9 },

  // Accounts Grid
  accountsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  accountGridCard: { width: '48%', backgroundColor: '#111113', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1E1E22' },
  accountGridCardSelected: { borderColor: '#FAFAFA', backgroundColor: '#18181B' },
  accountLogoBox: { width: 38, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  accountLogoText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11 },
  accountCardName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#FAFAFA', marginBottom: 4 },
  accountCardBalance: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 16, color: '#FAFAFA', fontVariant: ['tabular-nums'] },
  accountCardType: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  interestTag: { marginTop: 8, backgroundColor: '#18181B', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, borderWidth: 1, borderColor: '#27272A' },
  interestTagText: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 10, color: '#10B981', fontVariant: ['tabular-nums'] },
  assetActionRow: { marginTop: 8 },
  assetAddBtn: { backgroundColor: '#FAFAFA', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignItems: 'center' },
  assetAddBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B', fontSize: 11 },
  addAccountDashedCard: { width: '48%', backgroundColor: '#111113', borderWidth: 1, borderColor: '#27272A', borderStyle: 'dashed', borderRadius: 14, padding: 14, justifyContent: 'center', alignItems: 'center', height: 120, marginBottom: 12 },
  addAccountPlusIcon: { fontSize: 24, color: '#FAFAFA', fontWeight: '600' },
  addAccountText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#FAFAFA', marginTop: 4 },
  accountCardActionRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  accountAddTxBtn: { backgroundColor: '#FAFAFA', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  accountAddTxBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B', fontSize: 11 },

  // Date / Time Cards
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateTimeCard: { flex: 1, backgroundColor: '#18181B', padding: 12, borderRadius: 10, marginRight: 6, borderWidth: 1, borderColor: '#27272A' },
  dateTimeLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', marginBottom: 4 },
  dateTimeValue: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 13, color: '#FAFAFA', fontVariant: ['tabular-nums'] },

  // Custom Bottom Sheet Keypad Styles
  calcOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  calcSheetContainer: { backgroundColor: '#18181B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 24, borderWidth: 1, borderColor: '#27272A' },
  calcDragIndicator: { width: 36, height: 4, backgroundColor: '#27272A', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  calcDisplayBox: { backgroundColor: '#111113', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1E1E22' },
  calcDisplayLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase' },
  calcDisplayText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 28, color: '#FAFAFA', marginTop: 2, fontVariant: ['tabular-nums'] },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  keyBtnLight: { width: '23%', backgroundColor: '#18181B', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#27272A' },
  keyBtnDark: { width: '23%', backgroundColor: '#27272A', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  keyBtnGreen: { width: '23%', backgroundColor: '#FAFAFA', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  keyTextDark: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 20, color: '#FAFAFA', fontVariant: ['tabular-nums'] },
  keyTextWhite: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 20, color: '#09090B', fontVariant: ['tabular-nums'] },

  // Logo Picker
  logoPickerBox: { backgroundColor: '#18181B', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  pickPhotoBtn: { backgroundColor: '#111113', borderWidth: 1, borderColor: '#1E1E22', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  pickPhotoBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#FAFAFA', fontSize: 12 },
  brandChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  brandChipText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11 },
  emojiChip: { backgroundColor: '#18181B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#27272A' },
  chipActiveBorder: { borderWidth: 2, borderColor: '#FAFAFA' },
  colorCircle: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginBottom: 6 },
  colorCircleActive: { borderWidth: 3, borderColor: '#FAFAFA' },

  // Daily Limit
  dailyLimitCard: { backgroundColor: '#111113', borderRadius: 16, padding: 16, marginVertical: 12, borderWidth: 1, borderColor: '#1E1E22' },
  dailyLimitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dailyLimitTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#FAFAFA' },
  dailyLimitAmount: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 13, color: '#A1A1AA', fontVariant: ['tabular-nums'] },
  editLimitBtn: { backgroundColor: '#18181B', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#27272A' },
  editLimitBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#FAFAFA' },
  progressBarTrack: { height: 8, backgroundColor: '#18181B', borderRadius: 4, overflow: 'hidden', marginVertical: 8, borderWidth: 1, borderColor: '#27272A' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  dailyLimitFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dailyLimitSpent: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, color: '#71717A', fontVariant: ['tabular-nums'] },
  dailyLimitRemaining: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 12, color: '#A1A1AA', fontVariant: ['tabular-nums'] },

  // Transactions
  transactionCard: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1C1C20' },
  txLogoBox: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  txCategory: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#FAFAFA' },
  txDate: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, color: '#71717A', fontVariant: ['tabular-nums'] },
  txAmount: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 15, fontVariant: ['tabular-nums'] },
  expenseText: { color: '#EF4444' },
  incomeText: { color: '#10B981' },
  emptyText: { fontFamily: 'PlusJakartaSans_400Regular', color: '#71717A', fontSize: 13, fontStyle: 'italic', marginVertical: 8 },

  // Money Lent & Loans
  lentLoanSection: { marginTop: 18, backgroundColor: '#111113', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E1E22' },
  addLoanAccountBtn: { backgroundColor: '#18181B', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#27272A' },
  addLoanAccountBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#FAFAFA', fontSize: 13 },
  settledBtn: { backgroundColor: '#18181B', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, marginTop: 4, borderWidth: 1, borderColor: '#27272A' },
  settledBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#FAFAFA', fontSize: 10 },
  loanCardContainer: { backgroundColor: '#18181B', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  loanNoteText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: '#71717A', fontStyle: 'italic', marginTop: 2 },
  loanEntryBtn: { backgroundColor: '#FAFAFA', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  loanEntryBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B', fontSize: 11 },
  loanEditBtn: { backgroundColor: '#18181B', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#27272A' },
  loanEditBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#FAFAFA' },
  loanNetWorthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111113', paddingHorizontal: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#1E1E22' },
  loanNetWorthLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: '#71717A' },
  netWorthPillBtn: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  netWorthPillOn: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981' },
  netWorthPillOff: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444' },
  netWorthPillText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  netWorthPillTextOn: { color: '#10B981' },
  netWorthPillTextOff: { color: '#EF4444' },
  catAddEntryBtn: { backgroundColor: '#18181B', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#27272A' },
  catAddEntryBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#FAFAFA', fontSize: 11 },

  // Account Filters
  filterChip: { backgroundColor: '#111113', borderWidth: 1, borderColor: '#1E1E22', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  activeFilterChip: { backgroundColor: '#FAFAFA', borderColor: '#FAFAFA' },
  filterChipText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#71717A', fontSize: 13 },
  activeFilterChipText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },

  // Overview
  periodTabContainer: { flexDirection: 'row', backgroundColor: '#111113', borderRadius: 10, padding: 4, marginBottom: 10, borderWidth: 1, borderColor: '#1E1E22' },
  periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activePeriodTab: { backgroundColor: '#FAFAFA' },
  periodTabText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#71717A', fontSize: 12 },
  activePeriodTabText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },

  typeTabContainer: { flexDirection: 'row', backgroundColor: '#111113', borderRadius: 10, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#1E1E22' },
  typeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTypeTab: { backgroundColor: '#FAFAFA' },
  typeTabText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#71717A', fontSize: 12 },
  activeTypeTabText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },

  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#111113', borderRadius: 12, padding: 14, marginRight: 8, borderWidth: 1, borderColor: '#1E1E22', borderLeftWidth: 4 },
  kpiLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1.2 },
  kpiIncomeValue: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 16, color: '#10B981', marginTop: 4, fontVariant: ['tabular-nums'] },
  kpiExpenseValue: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 16, color: '#EF4444', marginTop: 4, fontVariant: ['tabular-nums'] },

  breakdownCard: { backgroundColor: '#111113', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E1E22' },
  categoryRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: '#FAFAFA' },
  categoryValue: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, color: '#FAFAFA', fontVariant: ['tabular-nums'] },
  categoryBarTrack: { height: 6, backgroundColor: '#18181B', borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  categoryBarFill: { height: '100%', backgroundColor: '#FAFAFA', borderRadius: 3 },

  // Bottom Nav
  bottomNavBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#09090B', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1C1C20', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 },
  navTab: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  navIcon: { fontSize: 20, opacity: 0.5 },
  activeNavIcon: { opacity: 1 },
  navLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#71717A', marginTop: 2 },
  activeNavLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: '#FAFAFA' },
  centerFab: { width: 48, height: 36, borderRadius: 11, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  centerFabPlus: { fontSize: 28, color: '#09090B', fontWeight: '700', marginTop: -2 },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' },
  modalContent: { backgroundColor: '#18181B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#27272A' },
  profileModalContent: { backgroundColor: '#18181B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderWidth: 1, borderColor: '#27272A' },
  modalTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FAFAFA', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 10, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleExpenseActive: { backgroundColor: '#EF4444' },
  toggleIncomeActive: { backgroundColor: '#10B981' },
  toggleText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#71717A' },
  toggleTextActive: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },
  modalInput: { fontFamily: 'PlusJakartaSans_400Regular', backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', color: '#FAFAFA', padding: 12, borderRadius: 8, fontSize: 15, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#FAFAFA', borderColor: '#FAFAFA' },
  chipText: { fontFamily: 'PlusJakartaSans_500Medium', color: '#A1A1AA', fontSize: 13 },
  chipTextActive: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },
  interestSectionBox: { backgroundColor: '#18181B', borderRadius: 12, padding: 14, marginVertical: 12, borderWidth: 1, borderColor: '#27272A' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  switchLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#FAFAFA' },
  modalActions: { flexDirection: 'row', marginTop: 10, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', marginRight: 8 },
  cancelBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#A1A1AA' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#FAFAFA' },
  saveBtnText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#09090B' },
});

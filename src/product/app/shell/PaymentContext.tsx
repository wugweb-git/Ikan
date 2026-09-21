import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useNotifications } from '../../../shared/contexts/NotificationContext';
import { apiClient } from '../../../shared/api';

// Payment types from JSON specification
export interface PaymentPlan {
  type: 'one_time' | 'subscription';
  currency: 'INR';
  price_cents: number;
  description: string;
  expiry_days_default: number;
  reminder_before_days: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  provider: 'razorpay';
  provider_payment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: 'razorpay';
  name: string;
  description: string;
  enabled: boolean;
}

interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  programId: string;
}

interface PaymentContextType {
  // State
  isLoading: boolean;
  currentTransaction?: Transaction;
  paymentMethods: PaymentMethod[];
  
  // Actions
  initializePayment: (programId: string, amount: number, currency?: string) => Promise<string>;
  processPayment: (paymentData: RazorpayPaymentData) => Promise<boolean>;
  verifyPayment: (paymentId: string, orderId: string, signature: string) => Promise<boolean>;
  getTransactionHistory: () => Promise<Transaction[]>;
  clearCurrentTransaction: () => void;
  
  // UI State
  showReceipt: boolean;
  showExpiry: boolean;
  showReminderToggle: boolean;
  setUIPreferences: (prefs: { showReceipt?: boolean; showExpiry?: boolean; showReminderToggle?: boolean }) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}

interface PaymentProviderProps {
  children: React.ReactNode;
}

// Razorpay script loader
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/** Helper to extract a human-readable message from any error */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>();
  
  // JSON spec UI configuration
  const [showReceipt, setShowReceipt] = useState(true);
  const [showExpiry, setShowExpiry] = useState(true);
  const [showReminderToggle, setShowReminderToggle] = useState(true);

  // Ref so that processPayment can always read the latest verifyPayment without
  // needing it in a dependency array (avoids stale-closure & TDZ ordering issues).
  const verifyPaymentRef = useRef<(pid: string, oid: string, sig: string) => Promise<boolean>>(
    async () => false
  );

  // JSON spec payment methods: ["razorpay"]
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'razorpay',
      type: 'razorpay',
      name: 'Razorpay',
      description: 'Pay securely with cards, UPI, wallets & more',
      enabled: true
    }
  ];

  // ── verifyPayment (defined FIRST so the ref is populated before processPayment) ──
  const verifyPayment = useCallback(async (
    paymentId: string, 
    orderId: string, 
    signature: string
  ): Promise<boolean> => {
    try {
      console.log('🔍 Verifying payment:', { paymentId, orderId });
      
      const verificationResponse = await apiClient.verifyPayment({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        transaction_id: currentTransaction?.metadata?.transaction_id,
      });

      if (verificationResponse?.success) {
        console.log('✅ Payment verification successful');
        return true;
      } else {
        console.error('❌ Payment verification failed:', verificationResponse?.error);
        return false;
      }
    } catch (error: unknown) {
      console.error('❌ Payment verification error:', error);
      return false;
    }
  }, [currentTransaction]);

  // Keep the ref always pointing at the latest version
  verifyPaymentRef.current = verifyPayment;

  // ── initializePayment ──
  const initializePayment = useCallback(async (
    programId: string, 
    amount: number, 
    currency = 'INR'
  ): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to make payments');
    }

    setIsLoading(true);
    
    try {
      setCurrentTransaction(undefined);
      console.log('🚀 Initializing payment:', { programId, amount, currency });
      
      const orderResponse = await apiClient.createPaymentOrder({
        program_id: programId,
        amount,
        currency,
        user_id: user.user_id,
        receipt_email: showReceipt
      });

      if (!orderResponse || !orderResponse.order_id) {
        const errorMsg = orderResponse?.error || 'Failed to create payment order';
        console.error('❌ Payment order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Payment order created:', orderResponse.order_id);
      
      const transaction: Transaction = {
        id: orderResponse.order_id,
        user_id: user.user_id,
        provider: 'razorpay',
        amount,
        currency,
        status: 'pending',
        created_at: new Date().toISOString(),
        metadata: {
          programId,
          receiptEmail: showReceipt,
          key_id: orderResponse.key_id,
          transaction_id: orderResponse.transaction_id,
        }
      };

      setCurrentTransaction(transaction);
      return orderResponse.order_id;
      
    } catch (error: unknown) {
      console.error('❌ Payment initialization failed:', error);
      showToast('error', 'Payment Failed', getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, showReceipt, showToast]);

  // ── processPayment ──
  const processPayment = useCallback(async (paymentData: RazorpayPaymentData): Promise<boolean> => {
    if (!user) {
      console.error('❌ Payment processing failed: User not authenticated');
      throw new Error('User must be authenticated to process payments');
    }
    
    if (!currentTransaction) {
      console.error('❌ Payment processing failed: No active transaction found');
      throw new Error('No active payment transaction found. Please restart the payment process.');
    }

    setIsLoading(true);

    try {
      console.log('🔄 Processing payment:', paymentData.razorpay_payment_id);

      // Use the ref so we always call the latest verifyPayment
      const verificationResult = await verifyPaymentRef.current(
        paymentData.razorpay_payment_id,
        paymentData.razorpay_order_id,
        paymentData.razorpay_signature
      );

      if (verificationResult) {
        const updatedTransaction: Transaction = {
          ...currentTransaction,
          provider_payment_id: paymentData.razorpay_payment_id,
          status: 'success'
        };
        setCurrentTransaction(updatedTransaction);

        showToast('success', 'Payment Successful!', 'Your program access has been activated.');
        
        addNotification({
          type: 'success',
          title: 'Payment Completed',
          message: `Successfully purchased program for ₹${(paymentData.amount / 100).toFixed(2)}`,
          action: {
            label: 'View Program',
            onClick: () => console.log('Navigate to program:', paymentData.programId)
          }
        });

        return true;
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error: unknown) {
      console.error('❌ Payment processing failed:', error);
      
      if (currentTransaction) {
        setCurrentTransaction({
          ...currentTransaction,
          status: 'failed'
        });
      }

      showToast('error', 'Payment Failed', getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentTransaction, showToast, addNotification]);

  // ── getTransactionHistory ──
  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!user) return [];

    try {
      const payments = await apiClient.getPaymentHistory();
      return payments || [];
    } catch (error: unknown) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }, [user]);

  const setUIPreferences = useCallback((prefs: { 
    showReceipt?: boolean; 
    showExpiry?: boolean; 
    showReminderToggle?: boolean 
  }) => {
    if (prefs.showReceipt !== undefined) setShowReceipt(prefs.showReceipt);
    if (prefs.showExpiry !== undefined) setShowExpiry(prefs.showExpiry);
    if (prefs.showReminderToggle !== undefined) setShowReminderToggle(prefs.showReminderToggle);
  }, []);

  const clearCurrentTransaction = useCallback(() => {
    console.log('🧹 Clearing current transaction');
    setCurrentTransaction(undefined);
  }, []);

  const contextValue: PaymentContextType = {
    isLoading,
    currentTransaction,
    paymentMethods,
    
    initializePayment,
    processPayment,
    verifyPayment,
    getTransactionHistory,
    clearCurrentTransaction,
    
    showReceipt,
    showExpiry,
    showReminderToggle,
    setUIPreferences
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
}

// Global Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export { loadRazorpayScript };
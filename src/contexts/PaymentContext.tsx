import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { apiClient } from '../lib/api-client';

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

interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  programId: string;
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
    // Check if script already loaded
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

export function PaymentProvider({ children }: PaymentProviderProps) {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>();
  
  // JSON spec UI configuration
  const [showReceipt, setShowReceipt] = useState(true);
  const [showExpiry, setShowExpiry] = useState(true);
  const [showReminderToggle, setShowReminderToggle] = useState(true);

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
      // Clear any existing transaction
      setCurrentTransaction(undefined);
      console.log('🚀 Initializing payment:', { programId, amount, currency });
      
      // Create order on server
      const orderResponse = await apiClient.createPaymentOrder({
        program_id: programId,
        amount,
        currency,
        user_id: user.id,
        receipt_email: showReceipt
      });

      if (!orderResponse || !orderResponse.success) {
        const errorMsg = orderResponse?.error || 'Failed to create payment order';
        console.error('❌ Payment order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Payment order created:', orderResponse.order_id);
      
      // Create transaction record
      const transaction: Transaction = {
        id: orderResponse.order_id,
        user_id: user.id,
        provider: 'razorpay',
        amount,
        currency,
        status: 'pending',
        created_at: new Date().toISOString(),
        metadata: { programId, receiptEmail: showReceipt }
      };

      setCurrentTransaction(transaction);
      
      return orderResponse.order_id;
      
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      showToast('error', 'Payment Failed', error.message || 'Failed to initialize payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, showReceipt, showToast]);

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

      // Verify payment on server
      const verificationResult = await verifyPayment(
        paymentData.razorpay_payment_id,
        paymentData.razorpay_order_id,
        paymentData.razorpay_signature
      );

      if (verificationResult) {
        // Update transaction status
        const updatedTransaction: Transaction = {
          ...currentTransaction,
          provider_payment_id: paymentData.razorpay_payment_id,
          status: 'success'
        };
        setCurrentTransaction(updatedTransaction);

        // Show success notification
        showToast('success', 'Payment Successful!', 'Your program access has been activated.');
        
        // Add notification to history
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

    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      
      // Update transaction status
      if (currentTransaction) {
        setCurrentTransaction({
          ...currentTransaction,
          status: 'failed'
        });
      }

      showToast('error', 'Payment Failed', error.message || 'Payment could not be processed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentTransaction, showToast, addNotification]);

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
        razorpay_signature: signature
      });

      if (verificationResponse.success) {
        console.log('✅ Payment verification successful');
        return true;
      } else {
        console.error('❌ Payment verification failed:', verificationResponse.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return false;
    }
  }, []);

  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!user) {
      return [];
    }

    try {
      const response = await apiClient.getTransactionHistory(user.id);
      return response.transactions || [];
    } catch (error) {
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
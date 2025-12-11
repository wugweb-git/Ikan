// iKan Payment System - Complete Razorpay integration with JSON specification compliance

// Core Components
export { RazorpayPayment } from './RazorpayPayment';
export { PaymentFlow } from './PaymentFlow';

// Context
export { PaymentProvider, usePayment, loadRazorpayScript } from '../../contexts/PaymentContext';
export type { PaymentPlan, Transaction, PaymentMethod } from '../../contexts/PaymentContext';

// Utility functions for payments
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100); // Convert from paise to rupees
}

export function formatAmount(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

// Payment plan helpers based on JSON specification
export function createEquipPlan(
  programId: string,
  title: string,
  price: number,
  description?: string
): PaymentPlan {
  return {
    type: 'one_time', // JSON spec: equip_one_time.type
    currency: 'INR',  // JSON spec: equip_one_time.currency
    price_cents: price,
    description: description || `One-time purchase for ${title}`,
    expiry_days_default: 180, // JSON spec: equip_one_time.expiry_days_default
    reminder_before_days: 7   // JSON spec: equip_one_time.reminder_before_days
  };
}

// Payment status helpers
export function getPaymentStatusColor(status: Transaction['status']): string {
  switch (status) {
    case 'success':
      return 'var(--color-status-success)';
    case 'failed':
      return 'var(--color-status-danger)';
    case 'pending':
      return 'var(--color-status-warning)';
    case 'refunded':
      return 'var(--color-status-info)';
    default:
      return 'var(--color-text-muted)';
  }
}

export function getPaymentStatusLabel(status: Transaction['status']): string {
  switch (status) {
    case 'success':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Processing';
    case 'refunded':
      return 'Refunded';
    default:
      return 'Unknown';
  }
}

// Razorpay configuration helpers
export function getRazorpayConfig(isDevelopment: boolean = true) {
  return {
    keyId: isDevelopment 
      ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key'
      : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_LIVE || '',
    theme: {
      color: '#2A2A2A', // iKan primary color
      backdrop_color: '#F5F5F5'
    },
    modal: {
      animation: true,
      confirm_close: true,
      escape: false,
      ondismiss: () => {
        console.log('Razorpay modal dismissed');
      }
    },
    retry: {
      enabled: true,
      max_count: 3
    }
  };
}

// Payment validation helpers
export function validatePaymentAmount(amount: number): boolean {
  // Minimum amount as per Razorpay: ₹1 (100 paise)
  return amount >= 100 && amount <= 15000000; // Max ₹1,50,000
}

export function validateCurrency(currency: string): boolean {
  const supportedCurrencies = ['INR']; // JSON spec: only INR for MVP
  return supportedCurrencies.includes(currency);
}

// Transaction helpers
export function generateReceiptId(programId: string, userId: string): string {
  const timestamp = Date.now();
  const shortProgramId = programId.slice(-6);
  const shortUserId = userId.slice(-6);
  return `rcpt_${shortProgramId}_${shortUserId}_${timestamp}`;
}

// Payment error handling
export interface PaymentError {
  code: string;
  description: string;
  source: 'razorpay' | 'server' | 'client';
  step: 'initialization' | 'processing' | 'verification';
}

export function createPaymentError(
  code: string,
  description: string,
  source: PaymentError['source'] = 'client',
  step: PaymentError['step'] = 'processing'
): PaymentError {
  return { code, description, source, step };
}

export function getPaymentErrorMessage(error: PaymentError): string {
  const commonErrors: { [key: string]: string } = {
    'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
    'GATEWAY_ERROR': 'Payment gateway error. Please try again.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'SERVER_ERROR': 'Server error. Please try again later.',
    'PAYMENT_CANCELLED': 'Payment was cancelled.',
    'VERIFICATION_FAILED': 'Payment verification failed. Please contact support.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds in your account.',
    'CARD_DECLINED': 'Your card was declined. Please try another payment method.',
    'INVALID_CARD': 'Invalid card details. Please check and try again.'
  };

  return commonErrors[error.code] || error.description || 'An unexpected error occurred.';
}

// Constants from JSON specification
export const PAYMENT_CONSTANTS = {
  PROVIDERS: ['razorpay'], // JSON spec: payments.providers
  CURRENCY: 'INR',         // JSON spec: equip_one_time.currency
  EXPIRY_DAYS: 180,        // JSON spec: equip_one_time.expiry_days_default
  REMINDER_DAYS: 7,        // JSON spec: equip_one_time.reminder_before_days
  PLAN_TYPE: 'one_time'    // JSON spec: equip_one_time.type
} as const;

// Payment UI configuration from JSON spec
export const PAYMENT_UI_CONFIG = {
  paymentMethods: ['razorpay'],     // JSON spec: ui.paymentMethods
  receiptEmail: true,               // JSON spec: ui.receiptEmail
  showExpiry: true,                 // JSON spec: ui.showExpiry
  showReminderToggle: true          // JSON spec: ui.showReminderToggle
} as const;
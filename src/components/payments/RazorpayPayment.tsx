import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Icon } from '../Icon';
import { usePayment, loadRazorpayScript } from '../../contexts/PaymentContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../ui/utils';

interface RazorpayPaymentProps {
  programId: string;
  programTitle: string;
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: any) => void;
  className?: string;
}

export function RazorpayPayment({
  programId,
  programTitle,
  amount,
  currency = 'INR',
  description,
  onSuccess,
  onFailure,
  className
}: RazorpayPaymentProps) {
  const { user } = useAuth();
  const { 
    isLoading, 
    initializePayment, 
    processPayment,
    showReceipt,
    showExpiry,
    showReminderToggle,
    setUIPreferences 
  } = usePayment();
  
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [orderId, setOrderId] = useState<string>();

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then(loaded => {
      setRazorpayLoaded(loaded);
      if (!loaded) {
        console.error('Failed to load Razorpay script');
      }
    });
  }, []);

  const formatAmount = (amountInPaise: number) => {
    return (amountInPaise / 100).toFixed(2);
  };

  const handlePayment = async () => {
    if (!user || !razorpayLoaded) {
      console.error('User not authenticated or Razorpay not loaded');
      return;
    }

    try {
      // Initialize payment order
      const newOrderId = await initializePayment(programId, amount, currency);
      setOrderId(newOrderId);

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key', // Replace with actual key
        amount: amount,
        currency: currency,
        name: 'iKan - Mental Health',
        description: description || `Purchase: ${programTitle}`,
        order_id: newOrderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#2A2A2A' // iKan primary color
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            onFailure?.({ code: 'PAYMENT_CANCELLED', description: 'Payment was cancelled by user' });
          }
        },
        handler: async (response: any) => {
          try {
            console.log('💳 Payment response received:', response.razorpay_payment_id);
            
            const success = await processPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
              currency,
              programId
            });

            if (success) {
              onSuccess?.(response.razorpay_payment_id);
            } else {
              onFailure?.({ code: 'VERIFICATION_FAILED', description: 'Payment verification failed' });
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            onFailure?.(error);
          }
        }
      };

      // Create and open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      onFailure?.(error);
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Icon name="lock" size={24} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>
            Please sign in to purchase this program.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="creditCard" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Payment Details
          </CardTitle>
          <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
            Secure
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Program Details */}
        <div className="space-y-3">
          <h3 
            style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            {programTitle}
          </h3>
          
          {description && (
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)'
            }}>
              {description}
            </p>
          )}
        </div>

        <Separator />

        {/* Pricing Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-sm)' }}>Program Price</span>
            <span 
              style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              ₹{formatAmount(amount)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Currency
            </span>
            <span style={{ fontSize: 'var(--text-sm)' }}>{currency}</span>
          </div>

          {/* JSON spec UI: showExpiry */}
          {showExpiry && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Access Duration
              </span>
              <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                180 days
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Options */}
        <div className="space-y-3">
          <h4 
            style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Payment Options
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border" 
                 style={{ borderColor: 'var(--color-border-default)' }}>
              <Icon name="creditCard" size={16} style={{ color: 'var(--color-primary-default)' }} />
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Cards, UPI & Wallets
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Powered by Razorpay
                </div>
              </div>
              <Icon name="shield" size={14} style={{ color: 'var(--color-status-success)' }} />
            </div>
          </div>
        </div>

        {/* JSON spec UI configuration options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="mail" size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 'var(--text-sm)' }}>Email Receipt</span>
            </div>
            <div 
              className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center",
                showReceipt && "bg-primary"
              )}
              style={{ 
                borderColor: showReceipt ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                backgroundColor: showReceipt ? 'var(--color-primary-default)' : 'transparent'
              }}
              onClick={() => setUIPreferences({ showReceipt: !showReceipt })}
            >
              {showReceipt && (
                <Icon name="check" size={12} style={{ color: 'var(--color-primary-on)' }} />
              )}
            </div>
          </div>

          {showReminderToggle && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="bell" size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Expiry Reminders</span>
              </div>
              <div 
                className={cn(
                  "w-4 h-4 rounded-sm border flex items-center justify-center",
                  showReminderToggle && "bg-primary"
                )}
                style={{ 
                  borderColor: 'var(--color-primary-default)',
                  backgroundColor: 'var(--color-primary-default)'
                }}
              >
                <Icon name="check" size={12} style={{ color: 'var(--color-primary-on)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || !razorpayLoaded}
          className="w-full gap-2"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2" 
                   style={{ borderColor: 'var(--color-primary-on)' }}></div>
              Processing...
            </>
          ) : !razorpayLoaded ? (
            <>
              <Icon name="loader" size={16} />
              Loading Payment...
            </>
          ) : (
            <>
              <Icon name="shield" size={16} />
              Pay ₹{formatAmount(amount)}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: 'var(--color-status-info-light)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon name="shield" size={14} style={{ color: 'var(--color-status-info)' }} />
            <span 
              style={{ 
                fontSize: 'var(--text-xs)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-status-info)'
              }}
            >
              Secure Payment
            </span>
          </div>
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-status-info)',
            lineHeight: 'var(--line-height-md)'
          }}>
            Your payment information is encrypted and secure. 
            We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
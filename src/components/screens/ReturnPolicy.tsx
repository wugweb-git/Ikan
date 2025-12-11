import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ReturnPolicyProps {
  className?: string;
  onBack?: () => void;
}

export function ReturnPolicy({ className, onBack }: ReturnPolicyProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-default) 0%, #1a1a1a 100%)',
          color: 'var(--color-text-inverse)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)'
        }}
      >
        <div 
          className="w-full mx-auto"
          style={{
            maxWidth: 'var(--constraint-content-max)'
          }}
        >
          {/* Back Navigation */}
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6"
              style={{
                height: '48px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '0 var(--spacing-3)'
              }}
            >
              <Icon name="arrow-left" size={16} className="mr-2" />
              Back
            </Button>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--ikan-component-spacing-default)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="rotate-ccw" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--ikan-component-spacing-default)'
              }}
            >
              Return & Refund Policy
            </h1>
            
            <p 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-md)',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Understanding our refund and return policy for I-Kan; services.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: '900px',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
          marginTop: '-var(--ikan-component-spacing-large)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Card
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <CardContent 
            style={{ 
              padding: isMobile ? 'var(--ikan-component-spacing-large)' : 'var(--spacing-12)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              lineHeight: 'var(--line-height-lg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {`I-Kan; Refund Policy:

I-Kan; hereby grants to the customer a non-exclusive, non-assignable and non-transferable, right to access "I-Kan; self-help" or other offerings solely for usage by customer only. 

The Customer cannot grant access to the techniques and practices associated with I-Kan; Offerings or any rights therein to any third party. Further, the customer gives an unconditional undertaking to I-Kan; that it shall not otherwise use or exploit I-Kan; offering for any use or purpose except as expressly set forth 

Business Ordinance clause: 

We as a merchant shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time 

Refund Policy:

What is the Returns policy? 

We have a no returns policy. Orders once placed can't be cancelled and no refunds are made. However, if you have accidentally placed two orders on the same day (inadvertently made duplicate transaction), we cancel and refund one order on written request from the customer with proof of transaction. 

Can I return a part of my order? 

No. 

How long will the return process take? 

Once your return request has been placed with Customer Service, it usually takes 7-10 days to initiate refund. 

The receipt of the payment would depend on the mode of payment chosen by you. 

Refund Method                         Refund Receipt Time (After Initiation)
Bank Transfer/NEFT/UPI                2-4 business days
Debit Card                            5-7 business days
Credit Card                           7-21 business days


For Debit Card and Credit Card transfers the time taken for refund depends finally on the bank. Though we would love to expedite the same, our hands are tied.`}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card 
          className="mt-12"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginTop: 'var(--spacing-12)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
            <div className="space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Questions about Refunds?
              </h3>
              
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  margin: '0',
                  lineHeight: 'var(--line-height-md)',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                Contact our customer service team for any refund-related queries.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <a
                  href="mailto:ikanhealth@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-text-inverse)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    height: '48px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <Icon name="mail" size={20} />
                  ikanhealth@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
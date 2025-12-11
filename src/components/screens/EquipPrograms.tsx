import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { EquipFlow } from '../EquipFlow';
import { Icon } from '../Icon';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import { cn } from '../ui/utils';
import { apiClient } from '../../lib/api-client';
import { equipProgramsData } from '../../lib/sample-data/equip-programs';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import svgPaths from "../../imports/svg-ta5wpcle0i";
import figmaCardSvgPaths from "../../imports/svg-1uue509bxb";

// Razorpay global declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Using the actual data structure from your JSON
interface EquipProgram {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  price: number | {
    currency: string;
    amount_cents: number;
    payment_provider: string;
    one_time: boolean;
  };
  currency?: string;
  duration_days: number;
  expires_in_days_after_payment?: number;
  expiry_days_after_purchase?: number;
  modules?: any[];
  days?: any[];
  tags: string[];
  created_at: string;
  equip_id?: string;
  onboarding?: any;
  structure?: any;
}

interface EquipProgramsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

type ViewState = 'list' | 'preview' | 'payment' | 'program';

// Direct use of your JSON data structure - no transformation needed
const getDisplayPrice = (program: EquipProgram) => {
  if (typeof program.price === 'object') {
    return `₹${(program.price.amount_cents / 100).toLocaleString()}`;
  }
  return `₹${program.price}`;
};

export function EquipPrograms({ className, onNavigate }: EquipProgramsProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const { processPayment, initializePayment, clearCurrentTransaction } = usePayment();
  
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedProgram, setSelectedProgram] = useState<EquipProgram | null>(null);
  const [programs, setPrograms] = useState<EquipProgram[]>([]);
  const [purchasedPrograms, setPurchasedPrograms] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);

  // Load programs
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        // 1. Initial load from local data
        const localPrograms = equipProgramsData.equip_programs;

        // 2. Fetch from API
        let apiPrograms: EquipProgram[] = [];
        try {
            const response = await apiClient.getEquipPrograms();
            if (response && response.programs) {
                apiPrograms = response.programs;
            }
        } catch (error) {
            console.warn('Failed to fetch API programs', error);
        }

        // 3. Merge: API takes precedence
        const mergedMap = new Map<string, EquipProgram>();
        localPrograms.forEach(p => mergedMap.set(p.id, p as EquipProgram));
        apiPrograms.forEach(p => mergedMap.set(p.id, p)); // Assuming ID matches or is consistent

        // Note: Admin panel might create programs with IDs like 'equip-timestamp'.
        // Local programs have UUIDs.
        // We might want to key by 'equip_id' if available, or just append new ones.
        
        // Let's just combine them and de-duplicate by ID.
        const allPrograms = [...localPrograms as EquipProgram[], ...apiPrograms];
        const uniquePrograms = Array.from(new Map(allPrograms.map(p => [p.id || p.equip_id, p])).values());

        setPrograms(uniquePrograms);

        // Load purchased programs
        if (user?.id) {
          try {
            const purchased = await apiClient.getUserPurchasedPrograms(user.id);
            setPurchasedPrograms(new Set(purchased.map((p: any) => p.program_id || p.id)));
          } catch (error) {
            console.warn('Failed to load purchased programs:', error);
          }
        }
      } catch (error) {
        console.error('Error loading programs:', error);
        showToast('error', 'Failed to load programs', 'Using offline data');
        setPrograms(equipProgramsData.equip_programs);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, [user?.id, showToast]);

  const handlePurchase = async (program: EquipProgram) => {
    if (!user) {
      showToast('error', 'Please log in', 'You need to be logged in to purchase programs');
      return;
    }

    try {
      console.log('🔄 Starting purchase process for:', program.title);
      
      const amount = typeof program.price === 'object' ? program.price.amount_cents / 100 : program.price;
      const currency = program.currency || 'INR';
      
      // Step 1: Initialize payment and get order ID
      const orderId = await initializePayment(program.id, amount, currency);
      console.log('✅ Payment initialized with order ID:', orderId);
      
      // Step 2: Load Razorpay script if not already loaded
      const scriptLoaded = await new Promise((resolve) => {
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
      
      if (!scriptLoaded) {
        throw new Error('Payment system unavailable. Please try again.');
      }
      
      // Step 3: Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key', // Use environment variable
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'iKan Mental Health',
        description: `Purchase: ${program.title}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            console.log('💳 Payment completed, verifying...', response.razorpay_payment_id);
            
            // Step 4: Process the payment with the response data
            const success = await processPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
              currency: currency,
              programId: program.id
            });
            
            if (success) {
              showToast('success', 'Program Purchased!', `You now have access to ${program.title}`);
              setPurchasedPrograms(prev => new Set([...prev, program.id]));
              
              // Store program data for onboarding
              localStorage.setItem('ikan-selected-program', JSON.stringify({
                id: program.id,
                slug: program.slug,
                title: program.title,
                description: program.description,
                duration_days: program.duration_days,
                tags: program.tags
              }));
              
              // Navigate to program landing
              if (onNavigate) {
                onNavigate('/equip-programs-landing');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            showToast('error', 'Payment Failed', 'Payment could not be verified. Please contact support.');
          }
        },
        prefill: {
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        theme: {
          color: '#2A2A2A' // iKan primary color
        },
        modal: {
          ondismiss: () => {
            console.log('💳 Payment cancelled by user');
            clearCurrentTransaction(); // Clear transaction on cancellation
            showToast('info', 'Payment Cancelled', 'You can try again anytime');
          }
        }
      });
      
      razorpay.open();
      
    } catch (error) {
      console.error('Purchase failed:', error);
      clearCurrentTransaction(); // Clear transaction on error
      showToast('error', 'Payment Failed', error.message || 'Please try again or contact support');
    }
  };

  const handlePreview = (program: EquipProgram) => {
    console.log('🔍 Previewing program:', program.title);
    
    // Store the selected program for the preview
    localStorage.setItem('ikan-selected-program', JSON.stringify({
      id: program.id,
      slug: program.slug,
      title: program.title,
      description: program.description,
      summary: program.summary,
      duration_days: program.duration_days,
      tags: program.tags,
      price: program.price
    }));
    
    // Navigate to the Figma landing page
    if (onNavigate) {
      onNavigate('/equip-programs-landing');
    }
  };

  const handleStartProgram = (program: EquipProgram) => {
    if (!purchasedPrograms.has(program.id)) {
      handlePurchase(program);
      return;
    }

    console.log('🚀 Starting purchased program:', program.title);
    
    // Store program data
    localStorage.setItem('ikan-selected-program', JSON.stringify({
      id: program.id,
      slug: program.slug,
      title: program.title,
      description: program.description,
      duration_days: program.duration_days,
      tags: program.tags
    }));
    
    // Navigate to program flow
    if (onNavigate) {
      onNavigate('/equip-program-onboarding');
    }
  };

  const isPurchased = (programId: string) => purchasedPrograms.has(programId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-2 border-t-0 mx-auto"
            style={{ borderColor: 'var(--color-primary-default)' }}
          ></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-8 pb-12", className)}>
        {/* Header Section */}
        <div className="space-y-2">
          <h1 
            style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Equip Programs
          </h1>
          <p 
            style={{ 
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Structured programs to help you build mental wellness skills
          </p>
        </div>

        {/* What makes Equip special? Section */}
        <div className="space-y-6">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
            What makes Equip special?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-2 rounded-full bg-blue-50 shrink-0">
                <Icon name="library" variant="roundedFilled" size={20} className="text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Rooted in psychology</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our programmes draw from Cognitive Behavioural Therapy and other proven methodologies give you the best support possible.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-2 rounded-full bg-green-50 shrink-0">
                <Icon name="clock" variant="default" size={20} className="text-green-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Fits in your life</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  With bite size activities which don’t require more than 10 minutes and can be done at your convenience and on the go.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-2 rounded-full bg-purple-50 shrink-0">
                <Icon name="checkCircle" variant="filled" size={20} className="text-purple-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Simple</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our modules are simple and carefully structured.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-2 rounded-full bg-orange-50 shrink-0">
                <Icon name="tools" variant="roundedFilled" size={20} className="text-orange-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Practical</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Take away practical techniques to ease your symptoms and enhance your daily life.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-2 rounded-full bg-teal-50 shrink-0">
                <Icon name="dashboard" variant="filled" size={20} className="text-teal-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Transparent</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  With our dashboard and insights, you will always know where you are in your journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs
            .filter(program => program && program.id)
            .filter((program, index, self) => 
              index === self.findIndex(p => p.id === program.id)
            )
            .map((program, index) => {
            const isProgramPurchased = isPurchased(program.id);
            
            // Image mapping
            let imageUrl = "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80";
            if (program.slug.includes('sleep')) imageUrl = "https://images.unsplash.com/photo-1743748978909-169017ab0720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNsZWVwJTIwYmVkfGVufDF8fHx8MTc2NTQ1ODMxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
            else if (program.slug.includes('stress')) imageUrl = "https://images.unsplash.com/photo-1676386749756-1987d8a0e32a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBuYXR1cmUlMjBzdHJlc3MlMjByZWxpZWZ8ZW58MXx8fHwxNzY1NDU4MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
            else if (program.slug.includes('unburn')) imageUrl = "https://images.unsplash.com/photo-1564341505027-b410c159e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwZW5lcmd5fGVufDF8fHx8MTc2NTQ1ODM0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

            return (
              <div key={`program-${program.id}-${index}`} className="group h-full">
                {/* Desktop Card Layout */}
                <div className="hidden md:block h-full">
                  <Card 
                    className="relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer h-full flex flex-col"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-default)'
                    }}
                    onClick={() => handlePreview(program)}
                  >
                    <div className="flex flex-col p-6 h-full gap-6">
                      
                      {/* Top Section: Tags & Title */}
                      <div className="space-y-2">
                        <p 
                          className="text-xs uppercase tracking-widest font-semibold"
                          style={{ 
                            color: isProgramPurchased ? 'var(--color-status-success)' : 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family-base)'
                          }}
                        >
                          {isProgramPurchased ? 'PURCHASED' : (program.tags && program.tags.length > 0 ? program.tags[0] : 'PROGRAM')}
                        </p>
                        <h3 
                          className="text-3xl font-semibold text-primary"
                          style={{ fontFamily: 'var(--font-family-base)' }}
                        >
                          {program.title}
                        </h3>
                      </div>

                      {/* Summary */}
                      <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                        {program.summary}
                      </p>

                      {/* Bottom Section: Image & Meta */}
                      <div className="flex gap-4 items-end mt-auto">
                        {/* Image */}
                        <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={imageUrl} 
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info & CTA */}
                        <div className="flex flex-col gap-3 flex-grow">
                          
                          {/* Duration */}
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Icon name="calendar" variant="default" size={16} />
                            <span>{program.duration_days} DAYS</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Icon name="tag" variant="default" size={16} />
                            <span>{getDisplayPrice(program)}</span>
                          </div>

                          {/* CTA Button */}
                          <Button
                            className="w-full mt-2 gap-2"
                            style={{
                              backgroundColor: isProgramPurchased ? 'var(--color-status-success)' : '#2A2A2A',
                              color: 'white'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isProgramPurchased) {
                                handleStartProgram(program);
                              } else {
                                handlePreview(program);
                              }
                            }}
                          >
                            <Icon name="arrowRight" variant="outline" size={16} className="text-white" />
                            {isProgramPurchased ? 'CONTINUE' : 'KNOW MORE'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Mobile Layout (Standard Card) */}
                <div className="block md:hidden">
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePreview(program)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          {program.title}
                        </CardTitle>
                        {isProgramPurchased && (
                          <Badge className="bg-green-500">Purchased</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {program.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                         <img 
                            src={imageUrl} 
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {program.summary}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Icon name="calendar" variant="default" size={16} className="mr-1" />
                          {program.duration_days} days
                        </div>
                        <div className="font-semibold text-primary">
                          {getDisplayPrice(program)}
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4" 
                        variant={isProgramPurchased ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isProgramPurchased) {
                            handleStartProgram(program);
                          } else {
                            handlePreview(program);
                          }
                        }}
                      >
                        {isProgramPurchased ? 'Continue Program' : 'Know More'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import { cn } from '../ui/utils';
import { apiClient } from '../../lib/api-client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Skeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { TouchFeedback } from '../ui/touch-feedback';
import { Library, Clock, CheckCircle, PenTool, LayoutDashboard, Calendar, Tag, ArrowRight } from 'lucide-react';

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
  hero_image?: string;
  thumbnail?: string;
  cover_image?: string;
  thumbnail_url?: string;
  image_url?: string;
  category?: string;
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
        
        // Fetch from API
        let apiPrograms: EquipProgram[] = [];
        try {
            const response = await apiClient.getEquipPrograms();
            // getEquipPrograms() already returns the array directly
            if (response && Array.isArray(response)) {
                apiPrograms = response;
            }
        } catch (error) {
            console.warn('Failed to fetch API programs', error);
        }

        // Remove duplicates
        const uniquePrograms = Array.from(new Map(apiPrograms.map(p => {
            // Ensure ID is set
            const programWithId = { 
                ...p, 
                id: p.id || p.equip_id 
            };
            return [programWithId.id, programWithId];
        })).values());

        setPrograms(uniquePrograms as EquipProgram[]);

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
        showToast('error', 'Failed to load programs', 'Please try again later');
        setPrograms([]);
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
              
              // Navigate to program detail
              if (onNavigate) {
                onNavigate(`/equip-detail?id=${program.id}`);
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
    
    // Navigate to the detail page
    if (onNavigate) {
      onNavigate(`/equip-detail?id=${program.id}`);
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
      <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)', padding: '24px' }}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section Skeleton */}
          <div className="space-y-4">
            <Skeleton variant="text" height="48px" width="400px" />
            <Skeleton variant="text" height="24px" width="600px" />
          </div>

          {/* Program Cards Skeleton - 3 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                {/* Image skeleton */}
                <Skeleton variant="rectangular" height="200px" width="100%" />
                
                {/* Content skeleton */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" width="100px" height="20px" />
                    <Skeleton variant="text" width="60px" height="24px" />
                  </div>
                  <Skeleton variant="text" height="28px" width="80%" />
                  <Skeleton variant="text" height="16px" width="100%" />
                  <Skeleton variant="text" height="16px" width="90%" />
                  
                  <div className="flex gap-2 pt-2">
                    <Skeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
                    <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
                  </div>
                  
                  <Skeleton variant="button" height="40px" width="100%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8", className)}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center md:text-left"
      >
        <h1 style={{ 
          fontSize: 'var(--text-3xl)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          Equip Programs
        </h1>
        <p className="text-lg text-[var(--ikan-color-text-muted)] max-w-2xl">
          Structured, psychology-based programs to help you build lasting mental wellness skills.
        </p>
      </motion.div>

      {/* What makes Equip special? Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-medium text-[var(--ikan-color-text-primary)]">
          Why choose Equip?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Rooted in Psychology",
              desc: "Based on CBT and proven methodologies for effective support.",
              icon: Library,
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              title: "Fits Your Life",
              desc: "Bite-sized 10-minute activities you can do anywhere.",
              icon: Clock,
              color: "text-green-600",
              bg: "bg-green-50"
            },
            {
              title: "Simple & Clear",
              desc: "Carefully structured modules that are easy to follow.",
              icon: CheckCircle,
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
            {
              title: "Practical Tools",
              desc: "Learn techniques to ease symptoms and enhance daily life.",
              icon: PenTool,
              color: "text-orange-600",
              bg: "bg-orange-50"
            },
            {
              title: "Transparent Progress",
              desc: "Track your journey with clear insights and dashboards.",
              icon: LayoutDashboard,
              color: "text-teal-600",
              bg: "bg-teal-50"
            }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm bg-white rounded-[16px] overflow-hidden">
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={`p-3 rounded-xl shrink-0 ${item.bg}`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-[var(--ikan-color-text-primary)]">{item.title}</h3>
                  <p className="text-sm text-[var(--ikan-color-text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Programs Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-[var(--ikan-color-text-primary)]">
          Available Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs
            .filter(program => program && program.id)
            .filter((program, index, self) => 
              index === self.findIndex(p => p.id === program.id)
            )
            .map((program, index) => {
            const isProgramPurchased = isPurchased(program.id);
            
            // 🎯 Use backend thumbnail with smart fallbacks
            const imageUrl = program.hero_image || program.thumbnail || program.cover_image || program.thumbnail_url || program.image_url ||
              // Fallback to slug-based images if no backend image
              (program.slug.includes('sleep') ? "https://images.unsplash.com/photo-1743748978909-169017ab0720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNsZWVwJTIwYmVkfGVufDF8fHx8MTc2NTQ1ODMxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" :
               program.slug.includes('stress') ? "https://images.unsplash.com/photo-1676386749756-1987d8a0e32a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBuYXR1cmUlMjBzdHJlc3MlMjByZWxpZWZ8ZW58MXx8fHwxNzY1NDU4MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" :
               program.slug.includes('unburn') ? "https://images.unsplash.com/photo-1564341505027-b410c159e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwZW5lcmd5fGVufDF8fHx8MTc2NTQ1ODM0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" :
               "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80"); // default fallback

            return (
              <motion.div
                key={`program-${program.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card 
                  className="relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer h-full flex flex-col bg-white rounded-[16px] border-none group"
                  onClick={() => handlePreview(program)}
                >
                  <div className="flex flex-col p-6 h-full gap-6">
                    
                    {/* Top Section: Tags & Title */}
                    <div className="space-y-2">
                      <p 
                        className="text-xs uppercase tracking-widest font-medium"
                        style={{ 
                          color: isProgramPurchased ? 'var(--color-status-success)' : 'var(--color-text-primary)',
                        }}
                      >
                        {isProgramPurchased ? 'PURCHASED' : (program.category || (program.tags && program.tags.length > 0 ? program.tags[0] : 'PROGRAM'))}
                      </p>
                      <h3 
                        className="text-2xl font-medium text-[var(--ikan-color-text-primary)] group-hover:text-[var(--ikan-color-primary-default)] transition-colors"
                      >
                        {program.title}
                      </h3>
                    </div>

                    {/* Summary */}
                    <p className="text-[var(--ikan-color-text-muted)] text-sm leading-relaxed flex-grow line-clamp-3">
                      {program.summary || program.description}
                    </p>

                    {/* Bottom Section: Image & Meta */}
                    <div className="flex gap-4 items-end mt-auto pt-4 border-t border-gray-50">
                      {/* Image */}
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-inner">
                        <img 
                          src={imageUrl} 
                          alt={program.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Info & CTA */}
                      <div className="flex flex-col gap-2 flex-grow">
                        
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ikan-color-text-muted)]">
                          <Calendar size={14} />
                          <span>{program.duration_days} DAYS</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ikan-color-text-muted)]">
                          <Tag size={14} />
                          <span>{getDisplayPrice(program)}</span>
                        </div>

                        <Button
                          className="w-full mt-1 gap-2 h-9 text-xs"
                          style={{
                            backgroundColor: isProgramPurchased ? 'var(--color-status-success)' : 'var(--color-primary-default)',
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
                          {isProgramPurchased ? 'CONTINUE' : 'KNOW MORE'}
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
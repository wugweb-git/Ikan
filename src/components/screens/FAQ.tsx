import React from 'react';
import { 
  Search, 
  Info, 
  User, 
  LogIn, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  ChevronRight, 
  MessageSquarePlus, 
  CreditCard, 
  Shield 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom based on App.tsx usage
import { useIsMobile } from '../../hooks/useIsMobile';

interface FAQProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function FAQ({ className, onNavigate }: FAQProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const quickLinks = [
    { 
      icon: Info, 
      color: "text-pink-500", 
      bg: "bg-pink-100", 
      title: "About iKan", 
      path: "/about" 
    },
    { 
      icon: User, 
      color: "text-orange-500", 
      bg: "bg-orange-100", 
      title: "Managing your Profile", 
      path: "/account" 
    },
    { 
      icon: LogIn, 
      color: "text-green-500", 
      bg: "bg-green-100", 
      title: "Signing up", 
      path: "/login" 
    },
    { 
      icon: CreditCard, 
      color: "text-purple-500", 
      bg: "bg-purple-100", 
      title: "Managing your Subscription", 
      path: "/account" 
    },
    { 
      icon: Calendar, 
      color: "text-blue-500", 
      bg: "bg-blue-100", 
      title: "Before a Session", 
      path: "/equip" 
    },
    { 
      icon: Users, 
      color: "text-red-500", 
      bg: "bg-red-100", 
      title: "Community Guidelines", 
      path: "/terms" 
    },
  ];

  const helpCategories = [
    { label: "Getting Started", path: "/equip-onboarding" },
    { label: "Account and Subscription", path: "/account" },
    { label: "iKan Programs", path: "/equip" },
    { label: "Troubleshooting", path: "/contact" },
    { label: "Trust & Safety", path: "/privacy" },
  ];

  const frequentQuestions = [
    "How iKan Works",
    "iKan Subscriptions",
    "iKan Programs During the Holidays 2025",
    "How to Select and Confirm Your Preferences: Goals, Privacy, and Language"
  ];

  return (
    <div className={`min-h-screen bg-[var(--color-bg-page)] ${className || ''}`}>
      {/* Hero Section */}
      <div className="cbt-hero-section flex flex-col items-center justify-center text-center px-4">
        <span 
          className="text-sm font-medium mb-4 uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}
        >
          FAQs & Help Center
        </span>
        <h1 
          className="hero-title mb-8 max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--font-family-base)' }}
        >
          What can we help you with?
        </h1>
        <p 
          className="body-text mb-8 max-w-xl mx-auto"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}
        >
          Search our knowledge base for answers to common questions
        </p>
        
        <div className="relative w-full max-w-xl">
          <input 
            type="text" 
            className="cbt-input-pill w-full pl-12 pr-4 shadow-sm"
            placeholder="Find the answers..."
            style={{ fontFamily: 'var(--font-family-base)' }}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-responsive py-12 space-y-20">
        
        {/* Quick Links Grid */}
        <div className="space-y-6">
            <div className="flex justify-center border-b border-[var(--color-border-default)] mb-8">
                <button 
                  className="pb-4 border-b-2 font-medium px-4"
                  style={{ 
                    borderColor: 'var(--color-text-primary)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)' 
                  }}
                >
                    Customers
                </button>
                <button 
                  className="pb-4 px-4 transition-colors hover:text-[var(--color-text-primary)]"
                  style={{ 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)' 
                  }}
                >
                    Partners
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
                <div 
                key={index}
                onClick={() => handleNavigation(link.path)}
                className="bg-[var(--color-bg-card)] rounded-[var(--radius-sm)] p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 border border-transparent hover:border-[var(--color-border-default)]"
                >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.bg} ${link.color}`}>
                    <link.icon size={20} />
                    </div>
                    <span 
                      className="font-semibold text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-family-base)' }}
                    >
                      {link.title}
                    </span>
                </div>
                <ArrowUpRight className="text-[var(--color-text-muted)] w-5 h-5" />
                </div>
            ))}
            </div>
        </div>

        {/* Categories Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
                <h2 
                  className="hero-title text-4xl leading-tight"
                  style={{ fontFamily: 'var(--font-family-base)' }}
                >
                    Explore Help<br />Center Categories
                </h2>
                <p 
                  className="body-text text-[var(--color-text-muted)]"
                  style={{ fontFamily: 'var(--font-family-base)' }}
                >
                    Looking for answers or troubleshooting tips? Select a category to get help for more information.
                </p>
            </div>
            
            <div className="cbt-instruction-box p-2 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)]">
                 <div className="flex flex-col">
                    {helpCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(category.path)}
                            className="flex items-center justify-between p-6 hover:bg-[var(--color-bg-muted)] transition-colors border-b border-[var(--color-border-default)] last:border-0 first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)] text-left group"
                        >
                            <span 
                              className="font-semibold text-[var(--color-text-primary)]"
                              style={{ fontFamily: 'var(--font-family-base)' }}
                            >
                              {category.label}
                            </span>
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                        </button>
                    ))}
                 </div>
            </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
            <h2 className="section-heading text-center" style={{ fontFamily: 'var(--font-family-base)' }}>Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
                {frequentQuestions.map((question, index) => (
                    <div 
                        key={index}
                        className="bg-[var(--color-bg-card)] rounded-[var(--radius-full)] p-5 px-8 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all"
                        style={{ borderRadius: '999px' }}
                    >
                        <span 
                          className="font-medium text-[var(--color-text-primary)]"
                          style={{ fontFamily: 'var(--font-family-base)' }}
                        >
                          {question}
                        </span>
                        <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </div>
                ))}
            </div>
        </div>

        {/* Create Ticket Section */}
        <div className="cbt-instruction-box bg-[var(--color-bg-muted)] p-12 text-center rounded-[var(--radius-lg)]">
            <div className="flex flex-col items-center gap-4">
                <MessageSquarePlus className="w-12 h-12 text-[var(--color-text-primary)] mb-2" strokeWidth={1.5} />
                <h3 
                  className="text-2xl font-bold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-family-base)' }}
                >
                  Create ticket
                </h3>
                <p 
                  className="text-[var(--color-text-muted)] max-w-md"
                  style={{ fontFamily: 'var(--font-family-base)' }}
                >
                    Couldn't find an answer? Submit a ticket and our team will get back to you asap
                </p>
                <button className="cbt-button-primary mt-4">
                    Contact Support
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

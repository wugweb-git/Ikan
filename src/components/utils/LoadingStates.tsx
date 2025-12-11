import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';

// Skeleton Loading Component
export function SkeletonLoader({ 
  width = '100%', 
  height = '20px', 
  className = '',
  rounded = true 
}: {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <motion.div
      className={`bg-gray-200 ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? 'var(--radius-sm)' : '0',
        background: 'linear-gradient(90deg, var(--color-bg-muted) 25%, rgba(255,255,255,0.8) 50%, var(--color-bg-muted) 75%)',
        backgroundSize: '200% 100%'
      }}
      animate={{
        backgroundPosition: ['-200% 0', '200% 0']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

// Card Skeleton for Dashboard/Library loading
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Card style={{ 
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)'
          }}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <SkeletonLoader width="40px" height="40px" />
                <div className="flex-1 space-y-2">
                  <SkeletonLoader width="60%" height="16px" />
                  <SkeletonLoader width="40%" height="12px" />
                </div>
              </div>
              <SkeletonLoader width="100%" height="60px" />
              <div className="flex space-x-2">
                <SkeletonLoader width="80px" height="32px" />
                <SkeletonLoader width="60px" height="32px" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Chart Loading Animation
export function ChartSkeleton({ type = 'line' }: { type?: 'line' | 'bar' | 'pie' }) {
  return (
    <Card style={{ 
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-default)'
    }}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <SkeletonLoader width="40%" height="20px" />
          <div className="h-64 relative overflow-hidden rounded-md" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            {type === 'line' && (
              <motion.svg
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                className="absolute inset-0"
              >
                <motion.path
                  d="M0,150 Q100,50 200,100 T400,80"
                  stroke="var(--color-primary-default)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="800"
                  initial={{ strokeDashoffset: 800 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.svg>
            )}
            {type === 'bar' && (
              <div className="flex items-end justify-center h-full space-x-2 p-4">
                {[40, 80, 60, 90, 70].map((height, index) => (
                  <motion.div
                    key={index}
                    className="bg-primary/20 rounded-t"
                    style={{ 
                      width: '20%',
                      backgroundColor: 'var(--color-primary-default)',
                      opacity: 0.3
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ 
                      duration: 1,
                      delay: index * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 2
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State with Animation
export function EmptyState({
  icon = 'folder',
  title = 'No data available',
  description = 'There\'s nothing here yet.',
  action,
  illustration
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
}) {
  return (
    <motion.div
      className="text-center py-12 space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {illustration ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {illustration}
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -5, 5, 0]
          }}
        >
          <Icon 
            name={icon} 
            size={64} 
            style={{ 
              color: 'var(--color-text-muted)',
              margin: '0 auto'
            }} 
          />
        </motion.div>
      )}
      
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          {description}
        </p>
      </motion.div>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {action}
        </motion.div>
      )}
      
      {/* Gentle floating particles for ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-20"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Mood Tracking Specific Empty State
export function MoodJournalEmptyState() {
  return (
    <EmptyState
      title="Start Your Mood Journey"
      description="Track your daily emotions and build healthy mindfulness habits."
      illustration={
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl"
          >
            😊
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2 text-2xl"
            animate={{ 
              rotate: 360,
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            ✨
          </motion.div>
        </motion.div>
      }
    />
  );
}

// Assessment Empty State
export function AssessmentEmptyState() {
  return (
    <EmptyState
      title="Ready to Learn About Yourself?"
      description="Take a quick assessment to understand your mental health better."
      illustration={
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ 
              y: [-5, 5, -5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl"
          >
            📝
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-2 text-2xl"
            animate={{ 
              rotate: [0, 20, -20, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            💭
          </motion.div>
        </motion.div>
      }
    />
  );
}

// Library Empty State
export function LibraryEmptyState() {
  return (
    <EmptyState
      title="Building Your Resource Library"
      description="Curated mental health resources will appear here as you explore."
      illustration={
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ 
              rotateY: [0, 20, -20, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl"
          >
            📚
          </motion.div>
          <motion.div
            className="absolute -top-3 -right-3 text-xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            🌟
          </motion.div>
        </motion.div>
      }
    />
  );
}

// Loading Button State
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  ...props 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  [key: string]: any;
}) {
  return (
    <motion.button
      {...props}
      disabled={isLoading || props.disabled}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      style={{
        ...props.style,
        opacity: isLoading ? 0.8 : 1
      }}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={{ opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Icon name="loader" size={16} />
          </motion.div>
        )}
        {isLoading ? loadingText : children}
      </motion.div>
    </motion.button>
  );
}

// Progressive Content Reveal
export function StaggeredReveal({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
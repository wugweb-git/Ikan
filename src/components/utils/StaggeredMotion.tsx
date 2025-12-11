import React from 'react';
import { motion } from 'motion/react';

interface StaggeredMotionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
}

export function StaggeredMotion({ 
  children, 
  className, 
  style, 
  delay = 0, 
  duration = 0.6,
  staggerChildren = 0.1 
}: StaggeredMotionProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration,
        delay,
        staggerChildren,
        delayChildren: delay
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: duration * 0.8,
            delay: index * staggerChildren
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface FadeInUpProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}

export function FadeInUp({ 
  children, 
  className, 
  style, 
  delay = 0, 
  duration = 0.6 
}: FadeInUpProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ 
  children, 
  className, 
  style, 
  delay = 0, 
  duration = 0.5 
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}
import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ParticleProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function TherapyParticles({
  count = 20,
  color = 'var(--color-primary-default)',
  size = 4,
  speed = 20,
  opacity = 0.1,
  className = '',
  style = {}
}: ParticleProps) {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: (Math.random() * size) + 1,
      duration: (Math.random() * speed) + 10,
      delay: Math.random() * 5
    }));
  }, [count, size, speed]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity
          }}
          initial={{ 
            scale: 0,
            opacity: 0 
          }}
          animate={{
            scale: [0, 1, 1, 0],
            opacity: [0, opacity, opacity, 0],
            y: [0, -20, -40, -60],
            x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20, Math.random() * 60 - 30]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Floating orbs for calm ambient effect
export function FloatingOrbs({
  count = 5,
  color = 'var(--color-primary-default)',
  opacity = 0.05,
  className = '',
  style = {}
}: ParticleProps) {
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // Keep away from edges
      y: Math.random() * 80 + 10,
      size: Math.random() * 60 + 40,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * 10
    }));
  }, [count]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-sm"
          style={{
            background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [opacity, opacity * 0.7, opacity],
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0]
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Breathing/pulsing effect for mindfulness
export function BreathingCircles({
  count = 3,
  color = 'var(--color-primary-default)',
  opacity = 0.08,
  className = '',
  style = {}
}: ParticleProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center ${className}`}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            borderColor: color,
            borderWidth: 1,
            width: 100 + (i * 50),
            height: 100 + (i * 50),
            opacity: opacity / (i + 1)
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [opacity / (i + 1), opacity / (i + 1) * 0.5, opacity / (i + 1)]
          }}
          transition={{
            duration: 4 + (i * 0.5), // Breathing rhythm
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default TherapyParticles;
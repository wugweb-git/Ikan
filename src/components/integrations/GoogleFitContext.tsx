import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface GoogleFitData {
  steps: number;
  sleepHours: number;
  activeMinutes: number;
  restingHeartRate: number;
  lastUpdated: string;
}

interface GoogleFitContextType {
  isConnected: boolean;
  isSyncing: boolean;
  data: GoogleFitData | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
}

// ----------------------------------------------------------------------
// Mock Data Generator
// ----------------------------------------------------------------------

const generateMockData = (): GoogleFitData => {
  // Generate realistic looking data
  const now = new Date();
  return {
    steps: Math.floor(Math.random() * (12000 - 3000) + 3000), // 3k - 12k steps
    sleepHours: Number((Math.random() * (9 - 5) + 5).toFixed(1)), // 5 - 9 hours
    activeMinutes: Math.floor(Math.random() * (90 - 15) + 15), // 15 - 90 mins
    restingHeartRate: Math.floor(Math.random() * (75 - 55) + 55), // 55 - 75 bpm
    lastUpdated: now.toISOString(),
  };
};

// ----------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------

const GoogleFitContext = createContext<GoogleFitContextType | undefined>(undefined);

export function GoogleFitProvider({ children }: { children: ReactNode }) {
  const { showToast } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<GoogleFitData | null>(null);

  // Load state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('google_fit_connected');
    const storedData = localStorage.getItem('google_fit_data');

    if (storedAuth === 'true') {
      setIsConnected(true);
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        // If connected but no data, sync automatically
        sync();
      }
    }
  }, []);

  const connect = async () => {
    setIsSyncing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsConnected(true);
    localStorage.setItem('google_fit_connected', 'true');
    
    // Initial Sync
    const newData = generateMockData();
    setData(newData);
    localStorage.setItem('google_fit_data', JSON.stringify(newData));
    
    setIsSyncing(false);
    showToast('success', 'Connected', 'Google Fit connected successfully.');
  };

  const disconnect = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsConnected(false);
    setData(null);
    localStorage.removeItem('google_fit_connected');
    localStorage.removeItem('google_fit_data');
    
    setIsSyncing(false);
    showToast('info', 'Disconnected', 'Google Fit disconnected.');
  };

  const sync = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newData = generateMockData();
    setData(newData);
    localStorage.setItem('google_fit_data', JSON.stringify(newData));
    
    setIsSyncing(false);
  };

  return (
    <GoogleFitContext.Provider value={{ isConnected, isSyncing, data, connect, disconnect, sync }}>
      {children}
    </GoogleFitContext.Provider>
  );
}

export function useGoogleFit() {
  const context = useContext(GoogleFitContext);
  if (context === undefined) {
    throw new Error('useGoogleFit must be used within a GoogleFitProvider');
  }
  return context;
}
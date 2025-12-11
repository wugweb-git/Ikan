import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Icon } from './Icon';
import { apiClient } from '../lib/api-client';
import { cn } from './ui/utils';

interface GoogleFitData {
  steps: number;
  distance: number; // in km
  calories: number;
  activeMinutes: number;
  heartRate: number; // average BPM
  sleepHours: number;
  lastSyncDate: Date;
}

interface GoogleFitSyncProps {
  className?: string;
}

export function GoogleFitSync({ className }: GoogleFitSyncProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fitData, setFitData] = useState<GoogleFitData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check connection status and load data
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has Google Fit connected
      const storedConnectionStatus = localStorage.getItem(`ikan-googlefit-${user?.id}`);
      const storedData = localStorage.getItem(`ikan-googlefit-data-${user?.id}`);
      
      if (storedConnectionStatus === 'connected') {
        setIsConnected(true);
        
        if (storedData) {
          const data = JSON.parse(storedData);
          setFitData({
            ...data,
            lastSyncDate: new Date(data.lastSyncDate)
          });
          setLastSyncTime(new Date(data.lastSyncDate));
        }
      }
    } catch (error) {
      console.error('Error checking Google Fit status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate Google OAuth flow
      showToast('info', 'Connecting to Google Fit', 'Please wait while we establish connection...');
      
      // Simulate OAuth redirect flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection and initial data sync
      const mockData: GoogleFitData = {
        steps: 8432,
        distance: 6.2,
        calories: 2341,
        activeMinutes: 45,
        heartRate: 72,
        sleepHours: 7.5,
        lastSyncDate: new Date()
      };

      // Store connection status and data
      localStorage.setItem(`ikan-googlefit-${user?.id}`, 'connected');
      localStorage.setItem(`ikan-googlefit-data-${user?.id}`, JSON.stringify(mockData));
      
      setIsConnected(true);
      setFitData(mockData);
      setLastSyncTime(new Date());
      
      showToast('success', 'Google Fit Connected!', 'Your fitness data is now syncing with iKan');
      
    } catch (error) {
      console.error('Google Fit connection error:', error);
      showToast('error', 'Connection Failed', 'Could not connect to Google Fit. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Remove stored data
      localStorage.removeItem(`ikan-googlefit-${user?.id}`);
      localStorage.removeItem(`ikan-googlefit-data-${user?.id}`);
      
      setIsConnected(false);
      setFitData(null);
      setLastSyncTime(null);
      
      showToast('info', 'Google Fit Disconnected', 'Your fitness data sync has been disabled');
    } catch (error) {
      console.error('Error disconnecting Google Fit:', error);
      showToast('error', 'Disconnection Failed', 'Could not disconnect Google Fit. Please try again.');
    }
  };

  const handleSyncData = async () => {
    if (!isConnected) return;
    
    try {
      showToast('info', 'Syncing Data', 'Getting latest fitness data from Google Fit...');
      
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update with new mock data
      const updatedData: GoogleFitData = {
        steps: Math.floor(Math.random() * 5000) + 5000,
        distance: Math.round((Math.random() * 8 + 2) * 10) / 10,
        calories: Math.floor(Math.random() * 1000) + 2000,
        activeMinutes: Math.floor(Math.random() * 30) + 30,
        heartRate: Math.floor(Math.random() * 20) + 65,
        sleepHours: Math.round((Math.random() * 3 + 6) * 10) / 10,
        lastSyncDate: new Date()
      };

      localStorage.setItem(`ikan-googlefit-data-${user?.id}`, JSON.stringify(updatedData));
      setFitData(updatedData);
      setLastSyncTime(new Date());
      
      showToast('success', 'Data Synced', 'Your latest fitness data has been updated');
      
    } catch (error) {
      console.error('Error syncing Google Fit data:', error);
      showToast('error', 'Sync Failed', 'Could not sync fitness data. Please try again.');
    }
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'var(--color-status-success)';
    if (percentage >= 60) return 'var(--color-status-warning)';
    return 'var(--color-status-info)';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: isConnected ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: isConnected ? Infinity : 0, repeatDelay: 3 }}
              >
                <Icon 
                  name="monitor" 
                  size={20} 
                  style={{ color: isConnected ? 'var(--color-status-success)' : 'var(--color-text-muted)' }} 
                />
              </motion.div>
              <span>Google Fit Sync</span>
            </div>
            <Badge 
              variant={isConnected ? "secondary" : "outline"}
              style={{
                backgroundColor: isConnected ? 'var(--color-status-success-light)' : 'transparent',
                color: isConnected ? 'var(--color-status-success)' : 'var(--color-text-muted)',
                borderColor: isConnected ? 'var(--color-status-success)' : 'var(--color-border-default)'
              }}
            >
              {isConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div 
                  className="text-center space-y-3"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Icon name="activity" size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    Connect your Google Fit account to track fitness data alongside your mental health journey.
                  </p>
                </div>
                <Button
                  className="w-full ikan-button"
                  onClick={handleConnectGoogleFit}
                  disabled={isConnecting}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    backgroundColor: 'var(--semantic-button-primary-bg)',
                    color: 'var(--semantic-button-primary-fg)'
                  }}
                >
                  {isConnecting ? (
                    <>
                      <Icon name="loading" size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icon name="link" size={16} />
                      Connect Google Fit
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Fitness Data Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Steps
                      </span>
                      <Icon name="footprints" size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.steps.toLocaleString()}
                    </div>
                    <Progress 
                      value={(fitData?.steps || 0) / 100} 
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)',
                        height: '6px'
                      }}
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Distance
                      </span>
                      <Icon name="map" size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.distance} km
                    </div>
                    <Progress 
                      value={(fitData?.distance || 0) * 10} 
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)',
                        height: '6px'
                      }}
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Calories
                      </span>
                      <Icon name="zap" size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.calories}
                    </div>
                    <Progress 
                      value={(fitData?.calories || 0) / 30} 
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)',
                        height: '6px'
                      }}
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Heart Rate
                      </span>
                      <Icon name="heart" size={14} style={{ color: 'var(--color-status-danger)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.heartRate} BPM
                    </div>
                    <Progress 
                      value={(fitData?.heartRate || 0)} 
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)',
                        height: '6px'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Additional Health Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon name="clock" size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Active Minutes
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.activeMinutes} min
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon name="moon" size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Sleep
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {fitData?.sleepHours}h
                    </div>
                  </div>
                </div>

                {/* Sync Actions */}
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                  <Button
                    onClick={handleSyncData}
                    variant="outline"
                    className="flex-1"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)'
                    }}
                  >
                    <Icon name="refresh" size={16} />
                    Sync Now
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      color: 'var(--color-status-danger)',
                      borderColor: 'var(--color-status-danger)'
                    }}
                  >
                    <Icon name="unlink" size={16} />
                    Disconnect
                  </Button>
                </div>

                {/* Last Sync Time */}
                {lastSyncTime && (
                  <div 
                    className="text-center pt-2"
                    style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)' 
                    }}
                  >
                    Last synced: {lastSyncTime.toLocaleString()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
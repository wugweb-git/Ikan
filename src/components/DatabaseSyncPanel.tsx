import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Clock,
  HardDrive
} from 'lucide-react';
import { checkDatabaseState, syncCompleteDatabase, DatabaseSyncResult } from '../lib/database-sync';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DatabaseSyncPanelProps {
  onSyncComplete?: (result: DatabaseSyncResult) => void;
}

export function DatabaseSyncPanel({ onSyncComplete }: DatabaseSyncPanelProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<DatabaseSyncResult | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Running health check from sync panel...');
      
      // Simple but robust health check with timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );
      
      const healthRequest = fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout ? AbortSignal.timeout(4500) : undefined
        }
      );
      
      const healthResponse = await Promise.race([healthRequest, timeoutPromise]);
      const isHealthy = healthResponse.ok;
      
      setIsOnline(isHealthy);
      
      if (isHealthy) {
        console.log('✅ Health check passed, checking database state...');
        const result = await checkDatabaseState();
        setSyncResult(result);
        setLastChecked(new Date());
      } else {
        console.log('❌ Health check failed - server responded but not healthy');
        setSyncResult({
          success: false,
          message: 'Server responded but not healthy',
          assessments_found: 0,
          assessments_expected: 2,
          equip_programs_found: 0,
          missing_data: ['Server not healthy'],
          sync_actions: []
        });
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setIsOnline(false);
      const errorMessage = error instanceof Error ? error.message : 'Connection error';
      setSyncResult({
        success: false,
        message: `Health check failed: ${errorMessage}`,
        assessments_found: 0,
        assessments_expected: 2,
        equip_programs_found: 0,
        missing_data: ['Connection failed'],
        sync_actions: []
      });
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncCompleteDatabase();
      setSyncResult(result);
      setLastChecked(new Date());
      
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({
        success: false,
        message: 'Sync operation failed',
        assessments_found: 0,
        assessments_expected: 2,
        equip_programs_found: 0,
        missing_data: ['Sync operation failed'],
        sync_actions: []
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncProgress = () => {
    if (!syncResult) return 0;
    
    const expectedItems = syncResult.assessments_expected + 1; // 2 assessments + 1 program
    const foundItems = syncResult.assessments_found + syncResult.equip_programs_found;
    
    return Math.min((foundItems / expectedItems) * 100, 100);
  };

  const getStatusColor = () => {
    if (isOnline === false) return 'destructive';
    if (!syncResult) return 'secondary';
    if (syncResult.missing_data.length > 0) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (isChecking || isSyncing) return <RefreshCw className="animate-spin" size={16} />;
    if (isOnline === false) return <AlertTriangle size={16} />;
    if (!syncResult) return <Database size={16} />;
    if (syncResult.missing_data.length > 0) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <Card 
      style={{ 
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader style={{ paddingBottom: 'var(--spacing-3)' }}>
        <CardTitle 
          className="flex items-center gap-2"
          style={{ 
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          <HardDrive size={20} />
          Database Sync Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isOnline === false ? 'destructive' : 'default'}>
              <Activity size={12} className="mr-1" />
              {isOnline === null ? 'Unknown' : isOnline ? 'Online' : 'Offline'}
            </Badge>
            {lastChecked && (
              <span 
                style={{ 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <Clock size={12} className="inline mr-1" />
                {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleHealthCheck}
            disabled={isChecking}
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--spacing-1) var(--spacing-3)'
            }}
          >
            {isChecking ? (
              <RefreshCw size={14} className="animate-spin mr-1" />
            ) : (
              <Database size={14} className="mr-1" />
            )}
            Check Status
          </Button>
        </div>

        {/* Sync Progress */}
        {syncResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Data Completeness
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {Math.round(getSyncProgress())}%
              </span>
            </div>
            <Progress 
              value={getSyncProgress()} 
              className="h-2"
            />
          </div>
        )}

        {/* Status Details */}
        {syncResult && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Assessments
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {syncResult.assessments_found}/{syncResult.assessments_expected}
              </div>
            </div>
            <div className="space-y-1">
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Programs
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {syncResult.equip_programs_found}/1
              </div>
            </div>
          </div>
        )}

        {/* Missing Data Alert */}
        {syncResult && syncResult.missing_data.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle size={16} />
            <AlertDescription>
              <div style={{ fontSize: 'var(--text-sm)' }}>
                <strong>Missing Data:</strong>
                <ul className="mt-1 space-y-1">
                  {syncResult.missing_data.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Actions */}
        {syncResult && syncResult.sync_actions.length > 0 && (
          <Alert>
            <CheckCircle size={16} />
            <AlertDescription>
              <div style={{ fontSize: 'var(--text-sm)' }}>
                <strong>Recent Actions:</strong>
                <ul className="mt-1 space-y-1">
                  {syncResult.sync_actions.map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleHealthCheck}
            disabled={isChecking || !isOnline}
            className="flex-1"
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--spacing-2) var(--spacing-4)'
            }}
          >
            {getStatusIcon()}
            <span className="ml-2">
              {isChecking ? 'Checking...' : 'Check Database'}
            </span>
          </Button>
          
          <Button
            onClick={handleFullSync}
            disabled={isSyncing || !isOnline}
            className="flex-1"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              fontSize: 'var(--text-sm)',
              padding: 'var(--spacing-2) var(--spacing-4)'
            }}
          >
            {isSyncing ? (
              <RefreshCw size={14} className="animate-spin mr-2" />
            ) : (
              <Database size={14} className="mr-2" />
            )}
            {isSyncing ? 'Syncing...' : 'Full Sync'}
          </Button>
        </div>

        {/* Help Text */}
        <div 
          style={{ 
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-sm)'
          }}
        >
          <strong>Check Database:</strong> Verify current data completeness<br />
          <strong>Full Sync:</strong> Seed complete assessments (PHQ-9: 9 questions, GAD-7: 7 questions) and equip program (32 days)
        </div>
      </CardContent>
    </Card>
  );
}
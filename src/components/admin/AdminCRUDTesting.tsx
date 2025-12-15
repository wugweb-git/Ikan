import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { cn } from '../ui/utils';
import { Activity, CheckCircle, AlertCircle, Database, Users, BookOpen, FileText, User, Stethoscope } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
  data?: any;
}

export function AdminCRUDTesting() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningFullTest, setRunningFullTest] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const result = await apiClient.healthCheck();
      const duration = performance.now() - start;
      
      setHealthData({
        status: result.status === 'ok' ? 'Healthy' : 'Unhealthy',
        latency: `${Math.round(duration)}ms`,
        timestamp: new Date().toISOString(),
        serverTime: result.timestamp
      });
      
      if (result.status === 'ok') {
        showToast('success', 'Health Check', 'System is operational');
      } else {
        showToast('error', 'Health Check', 'System is reporting issues');
      }
    } catch (err) {
      setHealthData({ status: 'Error', error: String(err) });
      showToast('error', 'Health Check Failed', String(err));
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (
    name: string, 
    testFn: () => Promise<any>, 
    icon: any
  ): Promise<TestResult> => {
    const start = performance.now();
    try {
      const data = await testFn();
      const duration = performance.now() - start;
      
      return {
        name,
        status: 'success',
        message: `✓ ${name} completed successfully`,
        duration: Math.round(duration),
        data
      };
    } catch (error) {
      const duration = performance.now() - start;
      return {
        name,
        status: 'error',
        message: `✗ ${name} failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Math.round(duration)
      };
    }
  };

  const runFullCRUDTest = async () => {
    setRunningFullTest(true);
    const results: TestResult[] = [];

    // Health Check
    results.push(await runTest('Health Check', () => apiClient.healthCheck(), Activity));

    // User Profile Read
    results.push(await runTest('Read User Profile', () => apiClient.getProfile(), User));

    // Assessments CRUD
    results.push(await runTest('Read Assessments', () => apiClient.getAssessments(), FileText));

    // Equip Programs CRUD
    results.push(await runTest('Read Equip Programs', () => apiClient.getEquipPrograms(), BookOpen));

    // Resources CRUD
    results.push(await runTest('Read Resources', () => apiClient.getResources(), Database));

    // Professionals CRUD
    results.push(await runTest('Read Professionals', () => apiClient.getProfessionals(), Stethoscope));

    // Journal Entries
    results.push(await runTest('Read Journal Entries', () => apiClient.getJournalEntries(), FileText));

    setTestResults(results);
    setRunningFullTest(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      showToast('success', 'All Tests Passed', `${successCount}/${totalCount} tests completed successfully`);
    } else {
      showToast('error', 'Some Tests Failed', `${successCount}/${totalCount} tests passed`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 style={{ 
             fontFamily: 'var(--font-family-base)',
             fontSize: 'var(--text-2xl)',
             fontWeight: 'var(--font-weight-medium)',
             color: 'var(--color-text-primary)'
           }}>
             CRUD Testing
           </h2>
           <p style={{ 
             fontFamily: 'var(--font-family-base)',
             fontSize: 'var(--text-base)',
             color: 'var(--color-text-muted)'
           }}>
             Verify database connectivity and all CRUD operations across entities.
           </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={checkHealth} 
            disabled={loading || runningFullTest}
            variant="outline"
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)'
            }}
          >
            <Activity className="w-4 h-4" /> Health Check
          </Button>
          <Button 
            onClick={runFullCRUDTest} 
            disabled={loading || runningFullTest}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            <Database className="w-4 h-4" /> 
            {runningFullTest ? 'Running Tests...' : 'Run Full Test Suite'}
          </Button>
        </div>
      </div>

      {/* Health Status Cards */}
      {healthData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("flex items-center gap-2", 
                healthData.status === 'Healthy' ? "text-green-500" : "text-red-500"
              )}>
                {healthData.status === 'Healthy' ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <AlertCircle className="w-6 h-6" />
                }
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {healthData.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                {healthData.latency || '-'}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Last Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {healthData.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Server Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {healthData.serverTime ? new Date(healthData.serverTime).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Test Results
            </CardTitle>
            <CardDescription>
              {testResults.filter(r => r.status === 'success').length} / {testResults.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg"
                  style={{ 
                    backgroundColor: result.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.status === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      }
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {result.name}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)',
                      marginTop: 'var(--spacing-1)'
                    }}>
                      {result.message}
                    </p>
                  </div>
                  {result.duration && (
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)',
                      fontFamily: 'monospace'
                    }}>
                      {result.duration}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entity Overview */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Database Entities
          </CardTitle>
          <CardDescription>
            All entities managed in the iKan system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Users', icon: Users, endpoint: '/admin/users' },
              { name: 'Professionals', icon: Stethoscope, endpoint: '/admin/professionals' },
              { name: 'Assessments', icon: FileText, endpoint: '/assessments' },
              { name: 'Equip Programs', icon: BookOpen, endpoint: '/equip/programs' },
              { name: 'Resources', icon: Database, endpoint: '/admin/resources' },
              { name: 'Journal Entries', icon: FileText, endpoint: '/journal/entries' },
            ].map((entity) => (
              <div 
                key={entity.name}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: 'var(--color-border-default)' }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <entity.icon className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {entity.name}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    {entity.endpoint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

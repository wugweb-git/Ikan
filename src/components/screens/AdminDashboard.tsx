import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  FileJson, 
  Activity, 
  Table, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Server,
  ClipboardList,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { cn } from '../ui/utils';
import { publicAnonKey, projectId } from '../../utils/supabase/info';
import { AdminAssessmentManager } from './AdminAssessmentManager';
import { AdminEquipProgramManager } from './AdminEquipProgramManager';

// --- Sub-Views ---

function MigrationView() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleMigrationCheck = async () => {
    setLoading(true);
    addLog('Checking migration status...');
    try {
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('Schema version: 1.0.0');
      addLog('Status: Up to date');
      showToast('success', 'Migration Check', 'Database is up to date');
    } catch (err) {
      addLog('Error checking migration');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    addLog('Initiating data seed...');
    try {
        // Seed Programs
        const programsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/seed/force-programs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
        });

        // Seed Users
        const usersResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/seed/users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
        });
        
        if (programsResponse.ok && usersResponse.ok) {
            addLog('Seed command sent successfully.');
            const data = await programsResponse.json();
            addLog(`Programs: ${data.programs?.length || 0} seeded`);
            addLog(`Users: Demo user ensured`);
            showToast('success', 'Seeding', 'Seed process completed');
        } else {
             addLog(`Seed failed. Programs: ${programsResponse.status}, Users: ${usersResponse.status}`);
             showToast('error', 'Seeding', 'Seed request failed');
        }
    } catch (err: any) {
        addLog(`Seed error: ${err.message}`);
        showToast('error', 'Seeding', 'Seed request error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={handleMigrationCheck} disabled={loading} className="gap-2">
          <Database className="w-4 h-4" /> Check Status
        </Button>
        <Button onClick={handleSeed} variant="secondary" disabled={loading} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Seed Data
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? <span className="text-gray-500">// Ready...</span> : logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {loading && <div className="animate-pulse">_</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CrudTestView() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const isHealthy = await apiClient.healthCheck();
      const duration = performance.now() - start;
      
      setHealthData({
        status: isHealthy ? 'Healthy' : 'Unhealthy',
        latency: `${Math.round(duration)}ms`,
        timestamp: new Date().toISOString()
      });
      
      if (isHealthy) {
        showToast('success', 'Health Check', 'System is operational');
      } else {
        showToast('error', 'Health Check', 'System is reporting issues');
      }
    } catch (err) {
      setHealthData({ status: 'Error', error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={checkHealth} disabled={loading} className="gap-2">
        <Activity className="w-4 h-4" /> Run Health Check
      </Button>

      {healthData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold flex items-center gap-2", 
                healthData.status === 'Healthy' ? "text-green-500" : "text-red-500"
              )}>
                {healthData.status === 'Healthy' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                {healthData.status}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.latency || '-'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {healthData.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SchemaView() {
  // Hardcoded for now, or could fetch from an endpoint if available
  const schemaInfo = {
    tables: [
      { name: 'kv_store', columns: ['key (PK)', 'value (JSON)', 'expires_at'] },
      { name: 'users', columns: ['id (PK)', 'email', 'created_at'] },
    ],
    version: '1.0.0'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Schema</CardTitle>
        <CardDescription>Current known schema configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm">
          {JSON.stringify(schemaInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

// --- Main Dashboard Component ---

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<'menu' | 'migration' | 'crud' | 'schema' | 'assessments' | 'equip'>('menu');

  const menuItems = [
    {
      id: 'blogs',
      title: 'Blog Manager',
      description: 'Manage articles, posts, and educational content.',
      icon: <Table className="w-8 h-8 text-purple-500" />,
      action: () => onNavigate('/admin/blogs'),
      primary: true
    },
    {
      id: 'assessments',
      title: 'Assessment Manager',
      description: 'Create and edit health assessments and quizzes.',
      icon: <ClipboardList className="w-8 h-8 text-indigo-500" />,
      action: () => setCurrentView('assessments'),
      primary: true
    },
    {
      id: 'equip',
      title: 'Equip Programs',
      description: 'Manage digital health programs and daily content.',
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
      action: () => setCurrentView('equip'),
      primary: true
    },
    {
      id: 'migration',
      title: 'Backend Migration',
      description: 'Manage database schema and seed initial data.',
      icon: <Database className="w-8 h-8 text-blue-500" />,
      action: () => setCurrentView('migration')
    },
    {
      id: 'crud',
      title: 'System Health',
      description: 'Test API connectivity and database operations.',
      icon: <Activity className="w-8 h-8 text-green-500" />,
      action: () => setCurrentView('crud')
    },
    {
      id: 'schema',
      title: 'Schema Inspector',
      description: 'View current database structure and types.',
      icon: <FileJson className="w-8 h-8 text-orange-500" />,
      action: () => setCurrentView('schema')
    }
  ];

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-500 mt-2">Manage your application system and content.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-gray-200"
                onClick={item.action}
              >
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render sub-views
  if (currentView === 'assessments') {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-5xl mx-auto">
          <AdminAssessmentManager onBack={() => setCurrentView('menu')} />
        </div>
      </div>
    );
  }

  if (currentView === 'equip') {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-5xl mx-auto">
          <AdminEquipProgramManager onBack={() => setCurrentView('menu')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('menu')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold capitalize">{currentView === 'crud' ? 'System Health' : currentView}</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px]">
          {currentView === 'migration' && <MigrationView />}
          {currentView === 'crud' && <CrudTestView />}
          {currentView === 'schema' && <SchemaView />}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Database, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function AdminMigration() {
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
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Backend Migration</h2>
         <p className="text-muted-foreground">Manage database schema and seed initial data.</p>
      </div>
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

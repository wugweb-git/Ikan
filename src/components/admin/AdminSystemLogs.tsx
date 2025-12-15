import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw, Filter } from 'lucide-react';

export function AdminSystemLogs() {
  const [logs, setLogs] = useState<any[]>([
    { id: 1, level: 'INFO', message: 'System initialization completed', source: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 2, level: 'WARN', message: 'High memory usage detected', source: 'Monitor', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 3, level: 'ERROR', message: 'Failed to sync with external provider', source: 'SyncService', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 4, level: 'INFO', message: 'User database backup successful', source: 'Backup', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  ]);

  const refreshLogs = () => {
    // Simulate refresh
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const sources = ['System', 'Auth', 'Database', 'API'];
    const messages = ['Connection reset', 'User logged in', 'Cache cleared', 'New resource added'];
    
    const newLog = {
      id: Date.now(),
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
           <p className="text-muted-foreground">Internal application events and errors.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" onClick={refreshLogs} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <div className={`mt-1 px-2 py-0.5 rounded text-xs font-bold w-16 text-center shrink-0 ${
                  log.level === 'INFO' ? 'bg-blue-100 text-blue-800' :
                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {log.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{log.source}</span>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

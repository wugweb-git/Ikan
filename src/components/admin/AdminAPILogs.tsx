import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';

export function AdminAPILogs() {
  const [logs, setLogs] = useState<any[]>([
    { id: 1, method: 'GET', path: '/api/resources', status: 200, duration: '45ms', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, method: 'POST', path: '/api/auth/session', status: 200, duration: '120ms', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: 3, method: 'GET', path: '/api/user/profile', status: 200, duration: '85ms', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 4, method: 'POST', path: '/api/assessments/submit', status: 201, duration: '210ms', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  ]);

  const refreshLogs = () => {
    // Simulate refresh
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const paths = ['/api/resources', '/api/users', '/api/settings', '/api/logs'];
    const newLog = {
      id: Date.now(),
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      status: Math.random() > 0.1 ? 200 : 500,
      duration: `${Math.floor(Math.random() * 200) + 20}ms`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">API Logs</h2>
           <p className="text-muted-foreground">Recent API requests and responses.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshLogs} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Method</th>
                  <th className="h-10 px-4 text-left font-medium">Path</th>
                  <th className="h-10 px-4 text-left font-medium">Status</th>
                  <th className="h-10 px-4 text-left font-medium">Duration</th>
                  <th className="h-10 px-4 text-left font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="p-4 font-mono">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        log.method === 'POST' ? 'bg-green-100 text-green-800' :
                        log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{log.path}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 ${log.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${log.status >= 400 ? 'bg-red-500' : 'bg-green-500'}`} />
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{log.duration}</td>
                    <td className="p-4 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

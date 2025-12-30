import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { projectId } from '../../utils/supabase/info';

export function DataSeeder() {
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    if (!secretKey) {
      setError('Please enter the Service Role Key');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLogs([]);
    setSuccess(false);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/init/sample-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed data');
      }

      setLogs(data.logs || []);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>System Initialization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secretKey">Service Role Key</Label>
          <Input
            id="secretKey"
            type="password"
            placeholder="Enter SUPABASE_SERVICE_ROLE_KEY"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Required to bypass admin checks for initial seeding.
          </p>
        </div>

        <Button 
          onClick={handleSeed} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Initializing...' : 'Initialize Sample Data'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Data seeded successfully!</AlertDescription>
          </Alert>
        )}

        {logs.length > 0 && (
          <div className="mt-4 p-4 bg-slate-950 text-slate-50 rounded-md font-mono text-xs h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

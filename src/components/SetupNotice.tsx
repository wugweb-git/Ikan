import React, { useState, useEffect } from 'react';
import { AlertCircle, Server, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { apiClient } from '../lib/api-client';

interface SetupNoticeProps {
  className?: string;
}

export function SetupNotice({ className }: SetupNoticeProps) {
  const [serverStatus, setServerStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        await apiClient.healthCheck();
        setServerStatus('available');
      } catch (error) {
        setServerStatus('unavailable');
      }
    };

    checkServer();
  }, []);

  // Don't show anything if server is available
  if (serverStatus === 'available') {
    return null;
  }

  // Don't show during initial check
  if (serverStatus === 'checking') {
    return null;
  }

  return (
    <div className={className}>
      <Alert className="border-amber-200 bg-amber-50">
        <Server className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <strong>Development Mode</strong> - Backend server not deployed yet
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              {showDetails ? 'Hide' : 'Setup Info'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {showDetails && (
        <Alert className="mt-2 border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <div>
                <strong>✅ Current Status:</strong> All features work with offline sample data
              </div>
              
              <div>
                <strong>🚀 To enable full backend:</strong>
                <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                  <li>Install Supabase CLI: <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm install -g supabase</code></li>
                  <li>Deploy backend: <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run setup:backend</code></li>
                  <li>Initialize data: <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run init:data</code></li>
                </ol>
              </div>

              <div>
                <strong>📚 Features Available Now:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                  <li>All screens and navigation</li>
                  <li>Mood tracking and journaling</li>
                  <li>Mental health assessments</li>
                  <li>Wellness programs (preview mode)</li>
                  <li>Resource library</li>
                  <li>Professional directory</li>
                </ul>
              </div>

              <div>
                <a 
                  href="https://github.com/supabase/cli" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Supabase CLI Installation Guide <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
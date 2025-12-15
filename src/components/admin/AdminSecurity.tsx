import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Lock, Users, AlertTriangle } from 'lucide-react';

export function AdminSecurity() {
  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Security Overview</h2>
         <p className="text-muted-foreground">Monitor system security and access controls.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98/100</div>
            <p className="text-xs text-muted-foreground">System is secure</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Access</CardTitle>
            <Lock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Users with full access</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                 <div className="flex items-start gap-3">
                   <div className="mt-1">
                     <Lock className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <div>
                     <p className="text-sm font-medium">Successful Login</p>
                     <p className="text-xs text-muted-foreground">User admin@example.com authenticated via password</p>
                   </div>
                 </div>
                 <div className="text-xs text-muted-foreground font-mono">
                   {new Date(Date.now() - i * 1000 * 60 * 60).toLocaleString()}
                 </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

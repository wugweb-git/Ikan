import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminHeader } from './AdminHeader';

export function AdminMigration() {
  return (
    <div className="space-y-6">
      <AdminHeader 
        title="System Migration" 
        description="Tools for migrating data between system versions"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Migration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Migration tools are currently under development.</p>
            <p className="text-sm mt-2">Please check back later or use the command line tools.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { AdminHeader } from './AdminHeader';
import { DataSeeder } from './DataSeeder';

export function AdminMigration() {
  return (
    <div className="space-y-6">
      <AdminHeader 
        title="System Migration" 
        description="Tools for initializing and migrating system data"
      />
      
      <DataSeeder />
    </div>
  );
}

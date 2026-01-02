import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AdminDataTable, Column } from '../admin/AdminDataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../Icon';

interface SampleData {
  id: string;
  name: string;
  status: string;
  role: string;
  lastActive: string;
}

export function UIKitDataDisplay() {
  const data: SampleData[] = [
    { id: '1', name: 'Alice Johnson', status: 'Active', role: 'Admin', lastActive: '2 mins ago' },
    { id: '2', name: 'Bob Smith', status: 'Inactive', role: 'User', lastActive: '1 day ago' },
    { id: '3', name: 'Charlie Brown', status: 'Active', role: 'User', lastActive: '5 hours ago' },
    { id: '4', name: 'Diana Prince', status: 'Pending', role: 'Moderator', lastActive: 'Just now' },
    { id: '5', name: 'Evan Wright', status: 'Active', role: 'User', lastActive: '1 week ago' },
  ];

  const columns: Column<SampleData>[] = [
    { header: 'Name', accessorKey: 'name', sortable: true },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      sortable: true,
      render: (item) => (
        <Badge variant={
          item.status === 'Active' ? 'success' : 
          item.status === 'Inactive' ? 'secondary' : 
          'warning'
        }>
          {item.status}
        </Badge>
      )
    },
    { header: 'Role', accessorKey: 'role', sortable: true },
    { header: 'Last Active', accessorKey: 'lastActive' },
    {
      header: 'Actions',
      render: () => (
        <Button variant="ghost" size="sm">
          <Icon name="more-horizontal" size={16} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Admin Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Data Table</CardTitle>
          <CardDescription>
            The standard table component used throughout the Admin panel (`AdminDataTable`).
            Includes built-in search, filtering, sorting, and pagination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminDataTable 
            columns={columns} 
            data={data} 
            searchKeys={['name', 'role']}
            searchPlaceholder="Search users..."
            pageSize={5}
            filters={[
              { 
                key: 'status', 
                label: 'Status', 
                options: [
                  { label: 'Active', value: 'Active' }, 
                  { label: 'Inactive', value: 'Inactive' },
                  { label: 'Pending', value: 'Pending' }
                ] 
              }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Edit, Shield, Building, UserPlus, MoreHorizontal } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { UserEditPage } from './UserEditPage';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  corporate_user?: boolean;
  is_admin?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  location?: string | null;
  created_at: string;
  updated_at?: string;
  googleConnected?: boolean;
  linkedinConnected?: boolean;
}

interface AdminUserManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminUserManager({ onBack, className }: AdminUserManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadUsers();
    }
  }, [viewMode]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();

      if (response.users) {
        setUsers(response.users);
      } else {
        console.warn('No users array in response:', response);
        setUsers([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load users:', error);

      if (
        error.message?.includes('insufficient permissions') ||
        error.message?.includes('Admin access required')
      ) {
        showToast(
          'error',
          'Admin Access Required',
          'You need admin privileges to view users. Please go back to the Dashboard and click "Promote to Admin" in the Debug Panel.'
        );
        setLoading(false);
      } else {
        // GLOBAL APPROACH: Show infinite loader on backend errors
        console.error('Backend error - showing infinite loader to force proper backend setup');
      }
    }
  };

  const handleExport = () => {
    // Export all loaded users
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Location', 'Created At'].join(','),
      ...users.map((u) => [
        `"${(u.name || '').replace(/"/g, '""')}"`,
        u.email,
        u.phone || '',
        u.is_admin ? 'Admin' : u.corporate_user ? 'Corporate' : 'User',
        `"${(u.location || '').replace(/"/g, '""')}"`,
        new Date(u.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'Users exported to CSV');
  };

  const handleCreateNew = () => {
    setSelectedUserId(undefined);
    setViewMode('create');
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUserId(undefined);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // -- Data Table Configuration --

  const columns: Column<UserProfile>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-medium">
            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[200px]" title={user.name}>{user.name || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={user.email}>{user.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'is_admin', // Sort by admin status primarily
      sortable: true,
      render: (user) => (
        <div className="flex gap-1">
          {user.is_admin && (
            <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
              Admin
            </Badge>
          )}
          {user.corporate_user && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
              Corporate
            </Badge>
          )}
          {!user.is_admin && !user.corporate_user && (
             <Badge variant="outline">User</Badge>
          )}
        </div>
      )
    },
    {
      header: 'Contact',
      accessorKey: 'phone',
      render: (user) => (
        <div className="flex flex-col text-sm">
          {user.phone && <span>{user.phone}</span>}
          {user.location && <span className="text-muted-foreground text-xs">{user.location}</span>}
          {!user.phone && !user.location && <span className="text-muted-foreground text-xs">-</span>}
        </div>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'created_at',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.created_at)}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(user.user_id); }}>
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters: FilterOption[] = [
    // We can simulate role filtering by checking multiple boolean flags in the main table logic if we passed a custom filter function
    // But for now, our generic table supports simple equality checks. 
    // We'll skip complex role filtering in the generic table for this quick refactor, 
    // OR we could map roles to a string property 'role' in a wrapper if needed.
    // For simplicity, let's rely on Search which covers most use cases.
  ];

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <Users className="w-4 h-4 text-primary" />
    },
    {
      label: 'Admins',
      value: users.filter((u) => u.is_admin).length,
      icon: <Shield className="w-4 h-4 text-orange-500" />
    },
    {
      label: 'Corporate',
      value: users.filter((u) => u.corporate_user).length,
      icon: <Building className="w-4 h-4 text-blue-500" />
    },
    {
      label: 'Regular Users',
      value: users.filter((u) => !u.is_admin && !u.corporate_user).length,
      icon: <Users className="w-4 h-4 text-green-500" />
    }
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return <UserEditPage userId={selectedUserId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-background', className)} style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="User Manager"
          description="Manage all registered users, permissions, and profiles"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'User Manager' }]}
          stats={stats}
          actions={
            <Button onClick={handleCreateNew} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {!isMobile && 'Add User'}
            </Button>
          }
        />

        <AdminDataTable 
          columns={columns} 
          data={users} 
          searchKeys={['name', 'email', 'phone']}
          searchPlaceholder="Search users..."
          onRowClick={(item) => handleEdit(item.user_id)}
          idField="user_id"
          actions={
             <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              {!isMobile && 'Export'}
            </Button>
          }
        />
      </div>
    </div>
  );
}
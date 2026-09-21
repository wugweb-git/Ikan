import { useState, useEffect } from 'react';
import { Users, Download, Pencil, Shield, Building, UserPlus, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../shared/api-client';
import { AdminHeader } from '../components/AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { UserEditPage } from './UserEditPage';
import { AdminDataTable, Column, FilterOption } from '../components/AdminDataTable';
import { SkeletonTable } from '../ui/skeleton-loader';
import { ErrorState } from '../ui/error-state';
import { EmptyState } from '../ui/empty-state';
import { useMetadata } from '../../hooks/useMetadata';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  const { accountTypes: kvAccountTypes } = useMetadata();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadData();
    }
  }, [viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, enrollmentsData, programsData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getEquipEnrollments(),
        apiClient.getEquipPrograms()
      ]);

      if (usersData.users) {
        setUsers(usersData.users);
      } else {
        setUsers([]);
      }

      setEnrollments(enrollmentsData || []);
      setPrograms(programsData || []);
      
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load data:', error);

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
        console.error('Backend error:', error);
        setError('Failed to load users. Please try again later.');
      }
    }
  };

  const handleExport = () => {
    // Export all loaded users
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Active Program', 'Day', 'Location', 'Created At'].join(','),
      ...users.map((u) => {
        const enrollment = enrollments.find(e => e.user_id === u.user_id && e.status === 'active');
        const program = enrollment ? programs.find(p => p.id === enrollment.equip_id) : null;
        
        return [
          `"${(u.name || '').replace(/"/g, '""')}"`,
          u.email,
          u.phone || '',
          u.is_admin ? 'Admin' : u.corporate_user ? 'Corporate' : 'User',
          program ? `"${(program.title || program.name).replace(/"/g, '""')}"` : '',
          enrollment ? enrollment.current_day_number : '',
          `"${(u.location || '').replace(/"/g, '""')}"`,
          new Date(u.created_at).toLocaleDateString()
        ].join(',');
      })
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

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      await apiClient.updateUserAdmin(userId, { is_admin: !currentIsAdmin });
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, is_admin: !currentIsAdmin } : u)));
      showToast('success', 'User Updated', `Admin privileges ${!currentIsAdmin ? 'granted' : 'removed'}`);
      loadData(); // Reload to get fresh data
    } catch (error: any) {
      console.error('Failed to update user:', error);
      showToast('error', 'API Error', 'Failed to update user');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    
    try {
      await apiClient.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      showToast('success', 'User Deleted', 'User has been permanently deleted');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showToast('error', 'API Error', 'Failed to delete user');
    }
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

  // Compute role string for filtering
  const usersWithRole = users.map(u => ({
    ...u,
    role: u.is_admin ? 'admin' : u.corporate_user ? 'corporate' : 'user',
  }));

  // -- Data Table Configuration --

  const FALLBACK_ACCOUNT_TYPES = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Corporate', value: 'corporate' },
  ];

  const accountTypeOptions = kvAccountTypes.length > 0
    ? kvAccountTypes.map(t => ({ label: t.label, value: t.value }))
    : FALLBACK_ACCOUNT_TYPES;

  const columns: Column<UserProfile & { role?: string }>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-primary-default)', fontWeight: 'var(--font-weight-medium)' }}>
            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col">
            <span className="truncate max-w-[200px]" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }} title={user.name}>{user.name || 'Unknown'}</span>
            <span className="truncate max-w-[200px]" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }} title={user.email}>{user.email}</span>
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
            <AdminStatusBadge status="warning" label="Admin" />
          )}
          {user.corporate_user && (
            <AdminStatusBadge status="info" label="Corporate" />
          )}
          {!user.is_admin && !user.corporate_user && (
             <AdminStatusBadge status="neutral" label="User" />
          )}
        </div>
      )
    },
    {
      header: 'Active Program',
      accessorKey: 'program_progress', // Virtual key
      render: (user) => {
        const userEnrollment = enrollments.find(e => e.user_id === user.user_id && e.status === 'active');
        if (!userEnrollment) return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>-</span>;
        
        const program = programs.find(p => p.id === userEnrollment.equip_id);
        const programName = program?.title || program?.name || 'Unknown Program';
        
        return (
          <div className="flex flex-col">
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-default)' }}>{programName}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <div 
                   className="h-full rounded-full" 
                   style={{ width: `${Math.min(100, (userEnrollment.current_day_number / (program?.days?.length || 30)) * 100)}%`, backgroundColor: 'var(--color-primary-default)' }} 
                />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Day {userEnrollment.current_day_number}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact',
      accessorKey: 'phone',
      render: (user) => (
        <div className="flex flex-col" style={{ fontSize: 'var(--text-sm)' }}>
          {user.phone && <span>{user.phone}</span>}
          {user.location && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.location}</span>}
          {!user.phone && !user.location && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>-</span>}
        </div>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'created_at',
      sortable: true,
      render: (user) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
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
              <Pencil className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleAdmin(user.user_id, user.is_admin || false); }}>
              <Shield className="mr-2 h-4 w-4" /> {user.is_admin ? 'Remove Admin' : 'Grant Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); handleDelete(user.user_id, user.name || 'Unknown'); }}
              style={{ color: 'var(--color-status-danger)' }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'role',
      label: 'Account Type',
      options: accountTypeOptions,
    },
  ];

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Admins',
      value: users.filter((u) => u.is_admin).length,
      icon: <Shield className="w-4 h-4" style={{ color: 'var(--color-status-warning)' }} />
    },
    {
      label: 'Corporate',
      value: users.filter((u) => u.corporate_user).length,
      icon: <Building className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Regular Users',
      value: users.filter((u) => !u.is_admin && !u.corporate_user).length,
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
    }
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return <UserEditPage userId={selectedUserId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Account Management"
          description="Loading users..."
        />
        <SkeletonTable rows={10} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Account Management"
          description="Manage platform access, roles, and user profiles"
        />
        <ErrorState
          variant="error"
          title="Failed to Load Users"
          message={error}
          onRetry={loadData}
          onGoBack={onBack}
        />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Account Management"
          description="Manage platform access, roles, and user profiles"
        />
        <EmptyState
          variant="default"
          title="No Users Found"
          description="There are no users registered in the system yet."
          actionLabel="Add First User"
          onAction={handleCreateNew}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Account Management"
        description="Manage platform access, roles, and user profiles"
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
        data={usersWithRole} 
        searchKeys={['name', 'email', 'phone']}
        filters={filters}
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
  );
}
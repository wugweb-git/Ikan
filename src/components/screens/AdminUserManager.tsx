import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Users, Search, Filter, Download, Edit, Trash2, Shield, Building } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

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
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  googleConnected?: boolean;
  googleEmail?: string | null;
  googleConnectedAt?: string | null;
  linkedinConnected?: boolean;
  linkedinEmail?: string | null;
  linkedinConnectedAt?: string | null;
  created_at: string;
  updated_at?: string;
}

interface AdminUserManagerProps {
  onBack?: () => void;
  className?: string;
}

export function AdminUserManager({ onBack, className }: AdminUserManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'corporate' | 'user'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      
      if (response.users) {
        setUsers(response.users);
      }
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showToast('error', 'Load Failed', error.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.updateUserAdmin(selectedUser.user_id, editForm);
      showToast('success', 'User Updated', 'User profile has been updated successfully');
      setIsEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      showToast('error', 'Update Failed', error.message || 'Failed to update user');
    }
  };

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.deleteUser(userToDelete.user_id);
      showToast('success', 'User Deleted', 'User has been deleted successfully');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showToast('error', 'Delete Failed', error.message || 'Failed to delete user');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Location', 'Created At'].join(','),
      ...filteredUsers.map(u => [
        u.name,
        u.email,
        u.phone || '',
        u.is_admin ? 'Admin' : u.corporate_user ? 'Corporate' : 'User',
        u.location || '',
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

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.user_id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      filterRole === 'all' ||
      (filterRole === 'admin' && user.is_admin) ||
      (filterRole === 'corporate' && user.corporate_user) ||
      (filterRole === 'user' && !user.is_admin && !user.corporate_user);

    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Users', value: users.length, icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} /> },
    { label: 'Admins', value: users.filter(u => u.is_admin).length, icon: <Shield className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} /> },
    { label: 'Corporate', value: users.filter(u => u.corporate_user).length, icon: <Building className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} /> },
    { label: 'Regular Users', value: users.filter(u => !u.is_admin && !u.corporate_user).length, icon: <Users className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} /> },
  ];

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--color-bg-page)',
          padding: 'var(--spacing-4)'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full border-4 mx-auto mb-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
          <p style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)'
          }}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("min-h-screen", className)}
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="User Manager"
          description="Manage all registered users, permissions, and profiles"
          onBack={onBack}
          breadcrumbs={[
            { label: 'Admin', onClick: onBack },
            { label: 'User Manager' }
          ]}
          stats={stats}
          actions={
            <>
              <Button
                variant="outline"
                onClick={handleExport}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <Download className="w-4 h-4" />
                {!isMobile && 'Export'}
              </Button>
              <Button
                onClick={loadUsers}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Icon name="refresh" size={16} />
                {!isMobile && 'Refresh'}
              </Button>
            </>
          }
        />

        {/* Filters and Search */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: 'var(--spacing-10)',
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'admin', 'corporate', 'user'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={filterRole === role ? 'default' : 'outline'}
                    onClick={() => setFilterRole(role)}
                    size="sm"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontWeight: 'var(--font-weight-medium)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            {selectedUserIds.size > 0 && (
              <div 
                className="mt-4 p-3 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {selectedUserIds.size} user{selectedUserIds.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserIds(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title={searchQuery || filterRole !== 'all' ? 'No users found' : 'No users yet'}
            description={searchQuery || filterRole !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'There are no registered users yet. Users will appear here once they sign up.'
            }
            actionLabel={searchQuery || filterRole !== 'all' ? 'Clear Filters' : undefined}
            onAction={searchQuery || filterRole !== 'all' ? () => {
              setSearchQuery('');
              setFilterRole('all');
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <Card 
                key={user.user_id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedUserIds.has(user.user_id)}
                      onCheckedChange={() => toggleSelectUser(user.user_id)}
                    />
                    
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: 'var(--color-primary-default)',
                        color: 'var(--color-primary-on)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
                      {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--spacing-1)'
                          }}>
                            {user.name || 'Unknown Name'}
                          </h3>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-muted)'
                          }}>
                            {user.email}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {user.is_admin && (
                          <Badge variant="default" style={{ backgroundColor: 'var(--color-warning-default)' }}>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.corporate_user && (
                          <Badge variant="default" style={{ backgroundColor: 'var(--color-info-default)' }}>
                            <Building className="w-3 h-3 mr-1" />
                            Corporate
                          </Badge>
                        )}
                        {!user.is_admin && !user.corporate_user && (
                          <Badge variant="outline">
                            User
                          </Badge>
                        )}
                        {user.phone && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {user.phone}
                          </span>
                        )}
                        {user.location && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            📍 {user.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Joined: {formatDate(user.created_at)}</span>
                        {user.googleConnected && <span>🔗 Google</span>}
                        {user.linkedinConnected && <span>🔗 LinkedIn</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_admin"
                  checked={editForm.is_admin || false}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_admin: checked as boolean })}
                />
                <Label htmlFor="is_admin">Admin</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="corporate_user"
                  checked={editForm.corporate_user || false}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, corporate_user: checked as boolean })}
                />
                <Label htmlFor="corporate_user">Corporate User</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone and will delete all associated data including journal entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, MoreVertical, Search, 
  Layout, Users, BarChart3, ChevronRight 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { Skeleton } from '../ui/skeleton-loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { apiClient } from '../../lib/api-client';
import { EquipProgram } from '../../lib/equip-admin-types';
import { useNotifications } from '../../contexts/NotificationContext';
import { EquipProgramWizard } from './EquipProgramWizard';

interface EquipAdminDashboardProps {
  onBack?: () => void;
}

export function EquipAdminDashboard({ onBack }: EquipAdminDashboardProps = {}) {
  const [programs, setPrograms] = useState<EquipProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const { showToast } = useNotifications();

  // Load Programs
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      // Fetch list of programs
      const data = await apiClient.getEquipPrograms();
      const loadedPrograms = Array.isArray(data) ? data : (data as any).programs || [];
      setPrograms(loadedPrograms);
    } catch (error) {
      console.error('Failed to load programs:', error);
      showToast('error', 'Error', 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedProgramId(null);
    setView('editor');
  };

  const handleAddDefaultOnboarding = async () => {
    try {
      showToast('info', 'Processing...', 'Adding default onboarding to programs');
      const response = await apiClient.addDefaultOnboarding();
      showToast('success', 'Success!', response.message || 'Default onboarding added');
      loadPrograms(); // Reload to see changes
    } catch (error) {
      console.error('Failed to add default onboarding:', error);
      showToast('error', 'Error', 'Failed to add default onboarding');
    }
  };

  const handleEdit = (id: string) => {
    setSelectedProgramId(id);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await apiClient.deleteEquipProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Deleted', 'Program deleted successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to delete program');
    }
  };

  // Render Editor
  if (view === 'editor') {
    return (
      <EquipProgramWizard
        programId={selectedProgramId || undefined}
        onBack={() => {
            setView('list');
            loadPrograms();
        }}
        onSave={() => {
            setView('list');
            loadPrograms();
        }}
      />
    );
  }

  // Render List
  const filteredPrograms = programs.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="gap-2"
              >
                <ChevronRight className="rotate-180" size={16} /> Back
              </Button>
            )}
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Equip Programs</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Manage your mental health programs and courses.</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus size={16} /> Create Program
          </Button>
        </div>

        {/* Stats (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Total Programs</CardTitle>
              <Layout className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }}>{programs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Active Users</CardTitle>
              <Users className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }}>--</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }}>--%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4 p-4 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            <Input 
              placeholder="Search programs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
              style={{ backgroundColor: 'var(--color-bg-muted)', borderColor: 'var(--color-border-default)' }}
            />
          </div>
          <Button 
            onClick={handleAddDefaultOnboarding} 
            variant="outline"
            className="gap-2"
          >
            ✨ Setup Onboarding
          </Button>
        </div>

        {/* Program List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
             <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row p-6 gap-6">
                    {/* Thumbnail Skeleton */}
                    <div className="w-full md:w-48 h-32 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                      <Skeleton className="w-full h-full" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-full mr-4">
                          <div className="flex items-center gap-2 mb-2">
                             <Skeleton className="w-20 h-5 rounded-full" />
                             <Skeleton className="w-20 h-5 rounded-full" />
                          </div>
                          <Skeleton className="w-1/2 h-7 mb-2" />
                          <Skeleton className="w-3/4 h-5" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-md" />
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <Skeleton className="w-24 h-5" />
                        <Skeleton className="w-24 h-5" />
                        <div className="flex-1" />
                        <Skeleton className="w-32 h-9 rounded-md" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-24 rounded-xl border border-dashed" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>
                <Layout size={32} />
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>No programs found</h3>
              <p className="max-w-sm mx-auto mt-2 mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Get started by creating your first program. You can define content, enrollment flow, and daily schedules.
              </p>
              <Button onClick={handleCreateNew} variant="outline">
                Create First Program
              </Button>
            </div>
          ) : (
            filteredPrograms.map(program => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row p-6 gap-6">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 h-32 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    {program.thumbnail ? (
                      <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                        <Layout size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AdminStatusBadge status="info" label={program.category || 'General'} />
                          <AdminStatusBadge 
                            status={program.published ? 'published' : 'draft'} 
                            label={program.published ? 'Published' : 'Draft'} 
                          />
                        </div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{program.title}</h3>
                        <p className="line-clamp-2 mt-1" style={{ color: 'var(--color-text-muted)' }}>{program.description}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(program.id)}>
                            <Edit3 size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem style={{ color: 'var(--color-status-danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(program.id); }}>
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-6 pt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>0 Enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layout size={16} />
                        <span>{program.daily_content?.length || 0} Days</span>
                      </div>
                      <div className="flex-1" />
                      <Button onClick={() => handleEdit(program.id)} variant="secondary" size="sm">
                        Edit Program <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
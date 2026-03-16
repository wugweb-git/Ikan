import { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, MoreVertical, Search, 
  LayoutGrid, Users, ChevronRight 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
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
import { AdminHeader } from '../admin/AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';

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
  const isMobile = useIsMobile();

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
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Equip Program Manager"
        description="Manage wellness and therapeutic programs"
        stats={[
          { label: 'Total Programs', value: programs.length, icon: <LayoutGrid className="h-4 w-4" style={{ color: 'var(--color-primary-default)' }} /> },
          { label: 'Published', value: programs.filter(p => p.published).length, icon: <LayoutGrid className="h-4 w-4" style={{ color: 'var(--color-status-success)' }} /> },
          { label: 'Total Enrollments', value: programs.reduce((acc, p) => acc + (p.enrollmentCount || 0), 0), icon: <Users className="h-4 w-4" style={{ color: 'var(--color-status-info)' }} /> },
        ]}
        actions={
          <Button onClick={handleCreateNew} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus size={16} />
            {!isMobile && 'Add Program'}
          </Button>
        }
      />

      {/* Search */}
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
      </div>

      {/* Program List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row p-6 gap-6">
                  <div className="w-full md:w-48 h-32 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <Skeleton className="w-full h-full" />
                  </div>
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
              <LayoutGrid size={32} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>No programs found</h3>
            <p className="max-w-sm mx-auto mt-2 mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Get started by creating your first program.
            </p>
            <Button onClick={handleCreateNew} variant="outline">
              Create First Program
            </Button>
          </div>
        ) : (
          filteredPrograms.map(program => (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row p-6 gap-6">
                <div className="w-full md:w-48 h-32 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  {program.thumbnail ? (
                    <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                      <LayoutGrid size={32} />
                    </div>
                  )}
                </div>
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
                          <Pencil size={14} className="mr-2" /> Edit
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
                      <span>{program.enrollmentCount || 0} Enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={16} />
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
  );
}
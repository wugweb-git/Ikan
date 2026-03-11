import { useState, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, Mail, Eye, Download, MoreHorizontal, Calendar } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminLoading } from '../admin/AdminLoading';
import { AdminDataTable, Column } from '../admin/AdminDataTable';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  energy: number;
  sleep_hours: number;
  notes?: string;
  created_at: string;
}

interface AssessmentResponse {
  id: string;
  user_id: string;
  assessment_id: string;
  assessment_title: string;
  score: number;
  completed_at: string;
  responses: any[];
}

interface EquipEnrollment {
  id: string;
  user_id: string;
  program_id: string;
  program_title: string;
  progress: number;
  enrolled_at: string;
  last_accessed?: string;
}

interface Consultation {
  id: string;
  user_id: string;
  professional_id: string;
  professional_name: string;
  professional_title?: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface AdminUserDataManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'user-detail';

export function AdminUserDataManager({ onBack, className }: AdminUserDataManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // User detail data
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<AssessmentResponse[]>([]);
  const [equipEnrollments, setEquipEnrollments] = useState<EquipEnrollment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'list') {
      loadUsers();
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedUserId && viewMode === 'user-detail') {
      loadUserDetails(selectedUserId);
    }
  }, [selectedUserId, viewMode]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const data = Array.isArray(response) ? response : response.users || [];
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showToast('error', 'Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      setDetailLoading(true);
      
      // Find selected user
      const user = users.find(u => u.id === userId);
      setSelectedUser(user || null);

      // Load user's data in parallel
      const [moodData, assessmentData, equipData, consultationData] = await Promise.all([
        apiClient.getUserMoodEntries(userId).catch(() => []),
        apiClient.getUserAssessmentResponses(userId).catch(() => []),
        apiClient.getUserEquipEnrollments(userId).catch(() => []),
        apiClient.getUserConsultations(userId).catch(() => [])
      ]);

      setMoodEntries(Array.isArray(moodData) ? moodData : moodData.entries || []);
      setAssessmentResponses(Array.isArray(assessmentData) ? assessmentData : assessmentData.history || assessmentData.responses || []);
      setEquipEnrollments(Array.isArray(equipData) ? equipData : equipData.enrollments || []);
      setConsultations(Array.isArray(consultationData) ? consultationData : consultationData.consultations || []);
    } catch (error: any) {
      console.error('Failed to load user details:', error);
      showToast('error', 'Error', 'Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('user-detail');
  };

  // User List Table
  const userColumns: Column<User>[] = [
    {
      header: 'User',
      accessorKey: 'email',
      sortable: true,
      className: 'min-w-[250px]',
      render: (user) => (
        <div className="flex flex-col">
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{user.name || 'Unknown'}</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{user.email}</span>
        </div>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'created_at',
      sortable: true,
      render: (user) => (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Last Active',
      accessorKey: 'last_sign_in_at',
      sortable: true,
      render: (user) => (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = [
    { label: 'Total Users', value: users.length, icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} /> },
    { 
      label: 'Active This Month', 
      value: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      icon: <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} /> 
    }
  ];

  // User Detail View
  if (viewMode === 'user-detail' && selectedUser) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title={selectedUser.name || 'User Details'}
          description={selectedUser.email}
          onBack={() => setViewMode('list')}
          breadcrumbs={[
            { label: 'Admin', onClick: onBack },
            { label: 'Care Seeker Activity', onClick: () => setViewMode('list') },
            { label: selectedUser.email }
          ]}
        />

        {detailLoading ? (
          <AdminLoading message="Loading user data..." />
        ) : (
            <Tabs defaultValue="mood" className="space-y-6">
              <TabsList>
                <TabsTrigger value="mood">Mood Journal ({moodEntries.length})</TabsTrigger>
                <TabsTrigger value="assessments">Assessments ({assessmentResponses.length})</TabsTrigger>
                <TabsTrigger value="equip">Equip Programs ({equipEnrollments.length})</TabsTrigger>
                <TabsTrigger value="consultations">Consultations ({consultations.length})</TabsTrigger>
              </TabsList>

              {/* Mood Journal Tab */}
              <TabsContent value="mood" className="space-y-4">
                {moodEntries.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p style={{ color: 'var(--color-text-muted)' }}>No mood journal entries yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {moodEntries.map((entry) => (
                      <Card key={entry.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <AdminStatusBadge status="neutral" label={entry.mood} />
                                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                  {new Date(entry.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>Energy: </span>
                                  <span>{entry.energy}/10</span>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>Sleep: </span>
                                  <span>{entry.sleep_hours}h</span>
                                </div>
                              </div>
                              {entry.notes && (
                                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginTop: '8px' }}>
                                  {entry.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments" className="space-y-4">
                {assessmentResponses.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p style={{ color: 'var(--color-text-muted)' }}>No assessment responses yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {assessmentResponses.map((response) => (
                      <Card key={response.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                  {response.assessment_title}
                                </h4>
                                <AdminStatusBadge status="neutral" label={`Score: ${response.score}`} />
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Completed: {new Date(response.completed_at).toLocaleString()}
                              </p>
                              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                Responses: {response.responses.length} questions answered
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Equip Programs Tab */}
              <TabsContent value="equip" className="space-y-4">
                {equipEnrollments.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p style={{ color: 'var(--color-text-muted)' }}>No program enrollments yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {equipEnrollments.map((enrollment) => (
                      <Card key={enrollment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                  {enrollment.program_title}
                                </h4>
                                <AdminStatusBadge status="info" label={`${enrollment.progress}% Complete`} />
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </p>
                              {enrollment.last_accessed && (
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                  Last accessed: {new Date(enrollment.last_accessed).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Consultations Tab */}
              <TabsContent value="consultations" className="space-y-4">
                {consultations.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p style={{ color: 'var(--color-text-muted)' }}>No consultations booked yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {consultations.map((consultation) => (
                      <Card key={consultation.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                  {consultation.professional_name}
                                </h4>
                                <AdminStatusBadge 
                                  status={
                                    consultation.status === 'completed' ? 'success' :
                                    consultation.status === 'cancelled' ? 'danger' :
                                    'info'
                                  }
                                  label={consultation.status}
                                />
                              </div>
                              {consultation.professional_title && (
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                  {consultation.professional_title}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(consultation.appointment_date).toLocaleString()}</span>
                              </div>
                              {consultation.notes && (
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                                  Notes: {consultation.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
    );
  }

  // User List View
  if (loading) {
    return <AdminLoading message="Loading users..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Care Seeker Activity"
        description="Monitor user progress across assessments, programs, and consultations"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Care Seeker Activity' }]}
        stats={stats}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {!isMobile && 'Export Data'}
          </Button>
        }
      />

      <AdminDataTable 
        columns={userColumns} 
        data={users} 
        searchKeys={['email', 'name']}
        searchPlaceholder="Search users..."
        onRowClick={(user) => handleViewUser(user.id)}
      />
    </div>
  );
}
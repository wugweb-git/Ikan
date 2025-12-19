import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { cn } from '../ui/utils';
import { Activity, CheckCircle, AlertCircle, Database, Users, BookOpen, FileText, User, Stethoscope } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
  data?: any;
}

interface CRUDTestDetails {
  create?: number;
  read?: number;
  update?: number;
  delete?: number;
}

export function AdminCRUDTesting() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningFullTest, setRunningFullTest] = useState(false);
  const [entityCounts, setEntityCounts] = useState<Record<string, CRUDTestDetails>>({});

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const result = await apiClient.healthCheck();
      const duration = performance.now() - start;
      
      setHealthData({
        status: result.status === 'ok' ? 'Healthy' : 'Unhealthy',
        latency: `${Math.round(duration)}ms`,
        timestamp: new Date().toISOString(),
        serverTime: result.timestamp
      });
      
      if (result.status === 'ok') {
        showToast('success', 'Health Check', 'System is operational');
      } else {
        showToast('error', 'Health Check', 'System is reporting issues');
      }
    } catch (err) {
      setHealthData({ status: 'Error', error: String(err) });
      showToast('error', 'Health Check Failed', String(err));
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (
    name: string, 
    testFn: () => Promise<any>, 
    icon: any
  ): Promise<TestResult> => {
    const start = performance.now();
    try {
      const data = await testFn();
      const duration = performance.now() - start;
      
      return {
        name,
        status: 'success',
        message: `✓ ${name} completed successfully`,
        duration: Math.round(duration),
        data
      };
    } catch (error) {
      const duration = performance.now() - start;
      return {
        name,
        status: 'error',
        message: `✗ ${name} failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Math.round(duration)
      };
    }
  };

  const runFullCRUDTest = async () => {
    setRunningFullTest(true);
    const results: TestResult[] = [];
    const counts: Record<string, CRUDTestDetails> = {};

    // Health Check
    results.push(await runTest('Health Check', () => apiClient.healthCheck(), Activity));

    // Helper to generate unique test IDs
    const generateTestId = (prefix: string) => `${prefix}-crud-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // ASSESSMENTS - Full CRUD with 3 instances
    const assessmentTests = {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[]
    };
    
    // CREATE 3 assessments
    for (let i = 1; i <= 3; i++) {
      const testId = generateTestId('assessment');
      const createResult = await runTest(
        `Create Assessment ${i}/3`,
        async () => {
          const newAssessment = {
            assessment_id: testId,
            slug: `test-assessment-${i}`,
            title: `CRUD Test Assessment ${i}`,
            description: `Test assessment ${i} for CRUD validation`,
            image_url: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000',
            info: '2 min test',
            version: '1.0',
            metadata: {
              estimated_minutes: 2,
              category: 'test',
              allow_repeat_days: 30,
              created_at: new Date().toISOString()
            },
            questions: [
              {
                question_id: 'test-q1',
                id: 'test-q1',
                order: 1,
                text: 'Test question',
                type: 'scale',
                required: true,
                options: [
                  { id: '0', label: 'Never', value: 0, score: 0 },
                  { id: '1', label: 'Sometimes', value: 1, score: 1 }
                ]
              }
            ]
          };
          const response = await apiClient.createAssessment(newAssessment);
          assessmentTests.created.push(testId);
          return response;
        },
        FileText
      );
      results.push(createResult);
    }

    // READ assessments
    const readAssessmentResult = await runTest(
      `Read All Assessments (verify 3+ exist)`,
      async () => {
        const assessments = await apiClient.getAssessments();
        const testAssessments = assessments.filter((a: any) => 
          assessmentTests.created.includes(a.assessment_id)
        );
        if (testAssessments.length !== 3) {
          throw new Error(`Expected 3 test assessments, found ${testAssessments.length}`);
        }
        return { total: assessments.length, testItems: testAssessments.length };
      },
      FileText
    );
    results.push(readAssessmentResult);

    // UPDATE the 3 assessments
    for (let i = 0; i < assessmentTests.created.length; i++) {
      const updateResult = await runTest(
        `Update Assessment ${i + 1}/3`,
        async () => {
          const updatedData = {
            title: `CRUD Test Assessment ${i + 1} (Updated)`,
            description: `Updated test assessment ${i + 1}`
          };
          const response = await apiClient.updateAssessment(assessmentTests.created[i], updatedData);
          assessmentTests.updated.push(assessmentTests.created[i]);
          return response;
        },
        FileText
      );
      results.push(updateResult);
    }

    // DELETE the 3 assessments
    for (let i = 0; i < assessmentTests.created.length; i++) {
      const deleteResult = await runTest(
        `Delete Assessment ${i + 1}/3`,
        async () => {
          const response = await apiClient.deleteAssessment(assessmentTests.created[i]);
          assessmentTests.deleted.push(assessmentTests.created[i]);
          return response;
        },
        FileText
      );
      results.push(deleteResult);
    }

    counts.assessments = {
      create: assessmentTests.created.length,
      read: 1,
      update: assessmentTests.updated.length,
      delete: assessmentTests.deleted.length
    };

    // EQUIP PROGRAMS - Full CRUD with 3 instances
    const equipTests = {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[]
    };

    // CREATE 3 equip programs
    for (let i = 1; i <= 3; i++) {
      const testId = generateTestId('equip');
      const createResult = await runTest(
        `Create Equip Program ${i}/3`,
        async () => {
          const newProgram = {
            equip_id: testId,
            slug: `test-program-${i}`,
            title: `CRUD Test Program ${i}`,
            description: `Test program ${i} for CRUD validation`,
            price: {
              currency: 'INR',
              amount_cents: 9900,
              payment_provider: 'razorpay',
              one_time: true
            },
            duration_days: 7,
            expiry_days_after_purchase: 90,
            days: [
              {
                day: 1,
                title: 'Test Day',
                type: 'lesson',
                content: [{ kind: 'text', body: 'Test content' }],
                required: true,
                estimated_min: 10
              }
            ]
          };
          const response = await apiClient.createEquipProgram(newProgram);
          equipTests.created.push(testId);
          return response;
        },
        BookOpen
      );
      results.push(createResult);
    }

    // READ equip programs
    const readEquipResult = await runTest(
      `Read All Equip Programs (verify 3+ exist)`,
      async () => {
        const programs = await apiClient.getEquipPrograms();
        const testPrograms = programs.filter((p: any) => 
          equipTests.created.includes(p.equip_id)
        );
        if (testPrograms.length !== 3) {
          throw new Error(`Expected 3 test programs, found ${testPrograms.length}`);
        }
        return { total: programs.length, testItems: testPrograms.length };
      },
      BookOpen
    );
    results.push(readEquipResult);

    // UPDATE the 3 equip programs
    for (let i = 0; i < equipTests.created.length; i++) {
      const updateResult = await runTest(
        `Update Equip Program ${i + 1}/3`,
        async () => {
          const updatedData = {
            title: `CRUD Test Program ${i + 1} (Updated)`,
            description: `Updated test program ${i + 1}`
          };
          const response = await apiClient.updateEquipProgram(equipTests.created[i], updatedData);
          equipTests.updated.push(equipTests.created[i]);
          return response;
        },
        BookOpen
      );
      results.push(updateResult);
    }

    // DELETE the 3 equip programs
    for (let i = 0; i < equipTests.created.length; i++) {
      const deleteResult = await runTest(
        `Delete Equip Program ${i + 1}/3`,
        async () => {
          const response = await apiClient.deleteEquipProgram(equipTests.created[i]);
          equipTests.deleted.push(equipTests.created[i]);
          return response;
        },
        BookOpen
      );
      results.push(deleteResult);
    }

    counts.equipPrograms = {
      create: equipTests.created.length,
      read: 1,
      update: equipTests.updated.length,
      delete: equipTests.deleted.length
    };

    // RESOURCES - Full CRUD with 3 instances
    const resourceTests = {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[]
    };

    // CREATE 3 resources
    for (let i = 1; i <= 3; i++) {
      const testId = generateTestId('resource');
      const createResult = await runTest(
        `Create Resource ${i}/3`,
        async () => {
          const newResource = {
            id: testId,
            title: `CRUD Test Resource ${i}`,
            excerpt: `Test resource excerpt ${i}`,
            content: `Test content ${i}`,
            image_url: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&q=80&w=1000',
            category: 'Test',
            author: {
              name: 'Test Author',
              avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'
            },
            read_time_minutes: 3,
            created_at: new Date().toISOString()
          };
          const response = await apiClient.createResource(newResource);
          resourceTests.created.push(testId);
          return response;
        },
        Database
      );
      results.push(createResult);
    }

    // READ resources
    const readResourceResult = await runTest(
      `Read All Resources (verify 3+ exist)`,
      async () => {
        const resources = await apiClient.getResources();
        const testResources = resources.filter((r: any) => 
          resourceTests.created.includes(r.id)
        );
        if (testResources.length !== 3) {
          throw new Error(`Expected 3 test resources, found ${testResources.length}`);
        }
        return { total: resources.length, testItems: testResources.length };
      },
      Database
    );
    results.push(readResourceResult);

    // UPDATE the 3 resources
    for (let i = 0; i < resourceTests.created.length; i++) {
      const updateResult = await runTest(
        `Update Resource ${i + 1}/3`,
        async () => {
          const updatedData = {
            title: `CRUD Test Resource ${i + 1} (Updated)`,
            excerpt: `Updated excerpt ${i + 1}`
          };
          const response = await apiClient.updateResource(resourceTests.created[i], updatedData);
          resourceTests.updated.push(resourceTests.created[i]);
          return response;
        },
        Database
      );
      results.push(updateResult);
    }

    // DELETE the 3 resources
    for (let i = 0; i < resourceTests.created.length; i++) {
      const deleteResult = await runTest(
        `Delete Resource ${i + 1}/3`,
        async () => {
          const response = await apiClient.deleteResource(resourceTests.created[i]);
          resourceTests.deleted.push(resourceTests.created[i]);
          return response;
        },
        Database
      );
      results.push(deleteResult);
    }

    counts.resources = {
      create: resourceTests.created.length,
      read: 1,
      update: resourceTests.updated.length,
      delete: resourceTests.deleted.length
    };

    // PROFESSIONALS - Full CRUD with 3 instances
    const professionalTests = {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[]
    };

    // CREATE 3 professionals
    for (let i = 1; i <= 3; i++) {
      const testId = generateTestId('professional');
      const createResult = await runTest(
        `Create Professional ${i}/3`,
        async () => {
          const newProfessional = {
            professional_id: testId,
            name: `Dr. Test Professional ${i}`,
            specialty: 'Test Specialty',
            qualifications: ['PhD', 'Licensed'],
            bio: `Test bio ${i}`,
            image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
            rating: 4.5,
            availability: {
              slots: [],
              timezone: 'UTC'
            }
          };
          const response = await apiClient.createProfessional(newProfessional);
          professionalTests.created.push(testId);
          return response;
        },
        Stethoscope
      );
      results.push(createResult);
    }

    // READ professionals
    const readProfessionalResult = await runTest(
      `Read All Professionals (verify 3+ exist)`,
      async () => {
        const professionals = await apiClient.getProfessionals();
        const testProfessionals = professionals.filter((p: any) => 
          professionalTests.created.includes(p.professional_id)
        );
        if (testProfessionals.length !== 3) {
          throw new Error(`Expected 3 test professionals, found ${testProfessionals.length}`);
        }
        return { total: professionals.length, testItems: testProfessionals.length };
      },
      Stethoscope
    );
    results.push(readProfessionalResult);

    // UPDATE the 3 professionals
    for (let i = 0; i < professionalTests.created.length; i++) {
      const updateResult = await runTest(
        `Update Professional ${i + 1}/3`,
        async () => {
          const updatedData = {
            name: `Dr. Test Professional ${i + 1} (Updated)`,
            bio: `Updated bio ${i + 1}`
          };
          const response = await apiClient.updateProfessional(professionalTests.created[i], updatedData);
          professionalTests.updated.push(professionalTests.created[i]);
          return response;
        },
        Stethoscope
      );
      results.push(updateResult);
    }

    // DELETE the 3 professionals
    for (let i = 0; i < professionalTests.created.length; i++) {
      const deleteResult = await runTest(
        `Delete Professional ${i + 1}/3`,
        async () => {
          const response = await apiClient.deleteProfessional(professionalTests.created[i]);
          professionalTests.deleted.push(professionalTests.created[i]);
          return response;
        },
        Stethoscope
      );
      results.push(deleteResult);
    }

    counts.professionals = {
      create: professionalTests.created.length,
      read: 1,
      update: professionalTests.updated.length,
      delete: professionalTests.deleted.length
    };

    // Journal Entries - READ only (user-specific)
    results.push(await runTest('Read Journal Entries', () => apiClient.getJournalEntries(), FileText));

    // User Profile - READ only
    results.push(await runTest('Read User Profile', () => apiClient.getProfile(), User));

    setTestResults(results);
    setEntityCounts(counts);
    setRunningFullTest(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      showToast('success', 'All Tests Passed', `${successCount}/${totalCount} tests completed successfully`);
    } else {
      showToast('error', 'Some Tests Failed', `${successCount}/${totalCount} tests passed`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 style={{ 
             fontFamily: 'var(--font-family-base)',
             fontSize: 'var(--text-2xl)',
             fontWeight: 'var(--font-weight-medium)',
             color: 'var(--color-text-primary)'
           }}>
             CRUD Testing
           </h2>
           <p style={{ 
             fontFamily: 'var(--font-family-base)',
             fontSize: 'var(--text-base)',
             color: 'var(--color-text-muted)'
           }}>
             Comprehensive CRUD validation - 3 instances per entity type (Create, Read, Update, Delete).
           </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={checkHealth} 
            disabled={loading || runningFullTest}
            variant="outline"
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)'
            }}
          >
            <Activity className="w-4 h-4" /> Health Check
          </Button>
          <Button 
            onClick={runFullCRUDTest} 
            disabled={loading || runningFullTest}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            <Database className="w-4 h-4" /> 
            {runningFullTest ? 'Running Tests...' : 'Run Full CRUD Test Suite'}
          </Button>
        </div>
      </div>

      {/* Health Status Cards */}
      {healthData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("flex items-center gap-2", 
                healthData.status === 'Healthy' ? "text-green-500" : "text-red-500"
              )}>
                {healthData.status === 'Healthy' ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <AlertCircle className="w-6 h-6" />
                }
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {healthData.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                {healthData.latency || '-'}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Last Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {healthData.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Server Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {healthData.serverTime ? new Date(healthData.serverTime).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CRUD Test Summary */}
      {Object.keys(entityCounts).length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
              CRUD Operations Summary
            </CardTitle>
            <CardDescription>
              Operations performed per entity type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(entityCounts).map(([entity, ops]) => (
                <div 
                  key={entity}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    {entity}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Create:</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{ops.create || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Read:</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{ops.read || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Update:</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{ops.update || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Delete:</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{ops.delete || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Detailed Test Results
            </CardTitle>
            <CardDescription>
              {testResults.filter(r => r.status === 'success').length} / {testResults.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg"
                  style={{ 
                    backgroundColor: result.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.status === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      }
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {result.name}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)',
                      marginTop: 'var(--spacing-1)',
                      marginLeft: '24px'
                    }}>
                      {result.message}
                    </p>
                  </div>
                  {result.duration && (
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)',
                      fontFamily: 'monospace'
                    }}>
                      {result.duration}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entity Overview */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Database Entities
          </CardTitle>
          <CardDescription>
            All entities tested in the iKan CRUD test suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Assessments', icon: FileText, endpoint: '/assessments', crud: 'Full CRUD' },
              { name: 'Equip Programs', icon: BookOpen, endpoint: '/equip/programs', crud: 'Full CRUD' },
              { name: 'Resources', icon: Database, endpoint: '/admin/resources', crud: 'Full CRUD' },
              { name: 'Professionals', icon: Stethoscope, endpoint: '/admin/professionals', crud: 'Full CRUD' },
              { name: 'Journal Entries', icon: FileText, endpoint: '/journal/entries', crud: 'Read Only' },
              { name: 'Users', icon: Users, endpoint: '/admin/users', crud: 'Read Only' },
            ].map((entity) => (
              <div 
                key={entity.name}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{ borderColor: 'var(--color-border-default)' }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <entity.icon className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {entity.name}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    {entity.endpoint}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-primary-default)',
                    marginTop: 'var(--spacing-1)'
                  }}>
                    {entity.crud}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

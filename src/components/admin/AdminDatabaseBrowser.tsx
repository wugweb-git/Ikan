import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Database, RefreshCw, Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface DataEntity {
  name: string;
  count: number;
  prefix: string;
  data: any[];
  expanded: boolean;
}

export function AdminDatabaseBrowser() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<DataEntity[]>([
    { name: 'Users', count: 0, prefix: 'user:', data: [], expanded: false },
    { name: 'Professionals', count: 0, prefix: 'professional:', data: [], expanded: false },
    { name: 'Assessments', count: 0, prefix: 'assessment:', data: [], expanded: false },
    { name: 'Equip Programs', count: 0, prefix: 'equip:', data: [], expanded: false },
    { name: 'Resources', count: 0, prefix: 'resource:', data: [], expanded: false },
    { name: 'Journal Entries', count: 0, prefix: 'journal:', data: [], expanded: false },
    { name: 'CMS Pages', count: 0, prefix: 'cms:', data: [], expanded: false },
  ]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load Users
      const usersResponse = await apiClient.getUsers();
      const users = usersResponse.users || [];

      // Load Professionals
      const professionalsResponse = await apiClient.getProfessionals();
      const professionals = professionalsResponse.professionals || [];

      // Load Assessments
      const assessmentsResponse = await apiClient.getAssessments();
      const assessments = assessmentsResponse.assessments || [];

      // Load Equip Programs
      const equipResponse = await apiClient.getEquipPrograms();
      const equipPrograms = equipResponse.programs || [];

      // Load Resources
      const resourcesResponse = await apiClient.getResources();
      const resources = resourcesResponse.resources || [];

      // Load Journal Entries
      const journalResponse = await apiClient.getJournalEntries();
      const journalEntries = journalResponse.entries || [];

      setEntities([
        { name: 'Users', count: users.length, prefix: 'user:', data: users, expanded: false },
        { name: 'Professionals', count: professionals.length, prefix: 'professional:', data: professionals, expanded: false },
        { name: 'Assessments', count: assessments.length, prefix: 'assessment:', data: assessments, expanded: false },
        { name: 'Equip Programs', count: equipPrograms.length, prefix: 'equip:', data: equipPrograms, expanded: false },
        { name: 'Resources', count: resources.length, prefix: 'resource:', data: resources, expanded: false },
        { name: 'Journal Entries', count: journalEntries.length, prefix: 'journal:', data: journalEntries, expanded: false },
        { name: 'CMS Pages', count: 0, prefix: 'cms:', data: [], expanded: false },
      ]);

      showToast('success', 'Data Loaded', 'All database entities loaded successfully');
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('error', 'Load Failed', 'Failed to load database entities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const toggleEntity = (index: number) => {
    setEntities(prev => prev.map((entity, i) => 
      i === index ? { ...entity, expanded: !entity.expanded } : entity
    ));
  };

  const schemaInfo = {
    tables: [
      { 
        name: 'kv_store_cc205da9', 
        columns: ['key (PK)', 'value (JSONB)', 'created_at', 'updated_at'], 
        description: 'Primary key-value store for all application data using JSON storage'
      },
      { 
        name: 'auth.users', 
        columns: ['id (PK)', 'email', 'encrypted_password', 'created_at', 'updated_at'], 
        description: 'Supabase authentication users table'
      },
    ],
    version: '2.0.0'
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
             Database Browser
           </h2>
           <p style={{ 
             fontFamily: 'var(--font-family-base)',
             fontSize: 'var(--text-base)',
             color: 'var(--color-text-muted)'
           }}>
             Browse all data entities and view database schema.
           </p>
        </div>
        <Button 
          onClick={loadAllData} 
          disabled={loading}
          style={{
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            fontWeight: 'var(--font-weight-medium)',
            gap: 'var(--spacing-2)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)'
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
          Refresh Data
        </Button>
      </div>

      {/* Data Entities */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Entities
            </div>
          </CardTitle>
          <CardDescription>
            All entity collections stored in the key-value database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entities.map((entity, index) => (
              <div key={entity.name}>
                <div 
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  onClick={() => toggleEntity(index)}
                >
                  <div className="flex items-center gap-3">
                    {entity.expanded ? 
                      <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> :
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    }
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {entity.name}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-full"
                      style={{ 
                        fontSize: 'var(--text-xs)',
                        backgroundColor: 'var(--color-primary-default)',
                        color: 'var(--color-primary-on)'
                      }}
                    >
                      {entity.count}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    {entity.prefix}*
                  </span>
                </div>

                {entity.expanded && entity.data.length > 0 && (
                  <div 
                    className="mt-2 ml-8 p-3 rounded-lg overflow-x-auto"
                    style={{ 
                      backgroundColor: 'var(--color-bg-page)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    <pre style={{ 
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'monospace',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}>
                      {JSON.stringify(entity.data.slice(0, 5), null, 2)}
                      {entity.data.length > 5 && `\n... and ${entity.data.length - 5} more items`}
                    </pre>
                  </div>
                )}

                {entity.expanded && entity.data.length === 0 && (
                  <div 
                    className="mt-2 ml-8 p-3 rounded-lg text-center"
                    style={{ 
                      backgroundColor: 'var(--color-bg-page)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      No data available
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schema Information */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Schema Information
          </CardTitle>
          <CardDescription>
            Current database schema configuration version {schemaInfo.version}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schemaInfo.tables.map((table) => (
              <div 
                key={table.name} 
                className="border rounded-lg p-4"
                style={{ 
                  borderColor: 'var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-muted)'
                }}
              >
                <h3 style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  {table.name}
                </h3>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  {table.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {table.columns.map((col) => (
                    <span 
                      key={col} 
                      className="px-2 py-1 rounded"
                      style={{ 
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(42, 42, 42, 0.1)',
                        color: 'var(--color-primary-default)'
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

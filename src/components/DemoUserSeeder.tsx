import React, { useState } from 'react';
import { apiClient } from '../lib/api-client';
import { ButtonPrimary } from './buttons/ButtonPrimary';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Users, Database, AlertCircle } from 'lucide-react';

export function DemoUserSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedUsers = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedResult(null);

    try {
      const result = await apiClient.seedDemoUsers();
      setSeedResult(result);
      console.log('✅ Demo users seeded successfully:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seed demo users';
      setError(errorMessage);
      console.error('❌ Demo user seeding failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card 
      className="w-full max-w-2xl mx-auto"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6)',
        borderColor: 'var(--color-border-default)'
      }}
    >
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-3">
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-default)' }}
          >
            <Users size={24} style={{ color: 'white' }} />
          </div>
        </div>
        <CardTitle 
          style={{ 
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          Demo User Seeding
        </CardTitle>
        <p 
          style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          Create three demo users with different engagement levels and sample data
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Descriptions */}
        <div className="space-y-4">
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border-light)'
            }}
          >
            <h4 
              style={{ 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              User 1: demo1@ikan.com (Alex Johnson)
            </h4>
            <Badge 
              variant="secondary"
              style={{ 
                marginRight: 'var(--spacing-2)',
                backgroundColor: 'var(--color-status-info-light)',
                color: 'var(--color-status-info)'
              }}
            >
              New User
            </Badge>
            <p 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--spacing-2)'
              }}
            >
              Recently joined, minimal activity. 3 journal entries, no assessments or programs.
            </p>
          </div>

          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border-light)'
            }}
          >
            <h4 
              style={{ 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              User 2: demo2@ikan.com (Sam Rivera)
            </h4>
            <Badge 
              variant="secondary"
              style={{ 
                marginRight: 'var(--spacing-2)',
                backgroundColor: 'var(--color-status-warning-light)',
                color: 'var(--color-status-warning)'
              }}
            >
              Active User
            </Badge>
            <p 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--spacing-2)'
              }}
            >
              25 journal entries, 2 completed assessments + 1 in progress, 1 completed equip program + 1 ongoing, read 6 resources.
            </p>
          </div>

          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border-light)'
            }}
          >
            <h4 
              style={{ 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              User 3: demo3@ikan.com (Jordan Chen)
            </h4>
            <Badge 
              variant="secondary"
              style={{ 
                marginRight: 'var(--spacing-2)',
                backgroundColor: 'var(--color-status-success-light)',
                color: 'var(--color-status-success)'
              }}
            >
              Power User
            </Badge>
            <p 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--spacing-2)'
              }}
            >
              100 days of journals, all assessments completed, multiple equip programs completed, 12 resources read, 2 consultations.
            </p>
          </div>
        </div>

        {/* Seed Button */}
        <div className="flex justify-center">
          <ButtonPrimary
            onClick={handleSeedUsers}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Seeding Users...
              </>
            ) : (
              <>
                <Database size={16} />
                Seed Demo Users
              </>
            )}
          </ButtonPrimary>
        </div>

        {/* Results */}
        {seedResult && (
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-status-success-light)',
              borderColor: 'var(--color-status-success)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle 
                size={20} 
                style={{ color: 'var(--color-status-success)' }} 
              />
              <h4 
                style={{ 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-status-success)'
                }}
              >
                Seeding Successful!
              </h4>
            </div>
            <p 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--spacing-3)'
              }}
            >
              {seedResult.message}
            </p>
            {seedResult.users && (
              <div className="space-y-2">
                {seedResult.users.map((user: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded"
                    style={{ backgroundColor: 'white' }}
                  >
                    <span 
                      style={{ 
                        fontWeight: 'var(--font-weight-medium)',
                        fontSize: 'var(--text-sm)'
                      }}
                    >
                      {user.name} ({user.email})
                    </span>
                    <Badge 
                      variant="outline"
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-status-danger-light)',
              borderColor: 'var(--color-status-danger)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle 
                size={20} 
                style={{ color: 'var(--color-status-danger)' }} 
              />
              <h4 
                style={{ 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-status-danger)'
                }}
              >
                Seeding Failed
              </h4>
            </div>
            <p 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)'
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div 
          className="text-center text-xs p-3 rounded"
          style={{ 
            backgroundColor: 'var(--color-bg-muted)',
            color: 'var(--color-text-muted)'
          }}
        >
          <p>
            After seeding, you can test the different user experiences by logging in with the demo credentials.
            All users use password: <code>demo123</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
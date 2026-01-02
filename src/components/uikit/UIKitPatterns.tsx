import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Icon } from '../Icon';

export function UIKitPatterns() {
  return (
    <div className="space-y-8">
      {/* Admin Dashboard Card Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard Card</CardTitle>
          <CardDescription>
            The primary navigation card used on the Admin Dashboard. Uses a colored icon background and hover effects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-primary-light)', // e.g. blue-50
                    color: 'var(--color-primary-default)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Icon name="users" size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    Account Management
                  </h3>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)' 
                  }}>
                    Manage user access & roles
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-accent-light)',
                      color: 'var(--color-accent-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <Icon name="book-open" size={24} />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)' 
                    }}>
                      Equip Programs
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)' 
                    }}>
                      Manage courses
                    </p>
                  </div>
                </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Mood Streak Card Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Card Pattern</CardTitle>
          <CardDescription>
            Visual pattern from `MoodJournal.tsx` to display user progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="max-w-xs mx-auto">
            <CardHeader>
              <CardTitle>Streak</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-orange-500 flex items-center gap-2">
                <Icon name="flame" size={32} />
                12
              </div>
              <p className="text-sm text-muted-foreground mt-2">Days in a row</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Admin Stat Card Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Stat Card</CardTitle>
          <CardDescription>
            Used in `AdminHeader` to show quick stats.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                   <Icon name="users" size={20} />
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Total Users</p>
                   <p className="text-2xl font-bold">1,234</p>
                </div>
             </div>
             
             <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                   <Icon name="activity" size={20} />
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Active Now</p>
                   <p className="text-2xl font-bold">56</p>
                </div>
             </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

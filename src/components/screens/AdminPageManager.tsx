import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Icon } from '../Icon';
import { useNotifications } from '../../contexts/NotificationContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

interface Page {
  id: string;
  name: string;
}

const PAGES: Page[] = [
  { id: 'faq', name: 'FAQ' },
  { id: 'contact', name: "Let's Talk (Contact)" },
  { id: 'privacy', name: 'Privacy Policy' },
  { id: 'terms', name: 'Terms & Conditions' },
  { id: 'return-policy', name: 'Return Policy' },
  { id: 'sitemap', name: 'Sitemap' },
  { id: 'cancellation-policy', name: 'Cancellation Policy' }
];

interface AdminPageManagerProps {
  onBack: () => void;
}

export function AdminPageManager({ onBack }: AdminPageManagerProps) {
  const { showToast } = useNotifications();
  const { session } = useAuth();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setLoadingSave] = useState(false);

  useEffect(() => {
    if (selectedPageId) {
      fetchPageContent(selectedPageId);
    }
  }, [selectedPageId]);

  const fetchPageContent = async (pageId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/cms/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch page content');
      }
      
      const data = await response.json();
      setTitle(data.title || '');
      setContent(data.content || '');
    } catch (error) {
      console.error('Error fetching page content:', error);
      showToast('error', 'Error', 'Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPageId) return;

    try {
      setLoadingSave(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/cms/pages/${selectedPageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}` // Requires auth token for updates
        },
        body: JSON.stringify({
          title,
          content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save page content');
      }

      showToast('success', 'Success', 'Page content updated successfully');
    } catch (error) {
      console.error('Error saving page content:', error);
      showToast('error', 'Error', 'Failed to save changes');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back to admin dashboard">
            <Icon name="arrow-left" size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-medium">Page Content Manager</h2>
            <p className="text-gray-500">Edit content for static pages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Page List */}
        <div className="md:col-span-1 space-y-2">
          {PAGES.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                selectedPageId === page.id
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
              }`}
            >
              {page.name}
              <Icon name="chevron-right" size={16} className={`opacity-50 ${selectedPageId === page.id ? 'text-blue-500' : ''}`} />
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="md:col-span-3">
          {selectedPageId ? (
            <Card>
              <CardHeader>
                <CardTitle>Editing: {PAGES.find(p => p.id === selectedPageId)?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Page Title</label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Page Title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        HTML Content
                        <span className="ml-2 text-xs text-gray-500 font-normal">(Edit the raw HTML structure below)</span>
                      </label>
                      <Textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        className="font-mono text-sm min-h-[500px]"
                        placeholder="<div>Your content here...</div>"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => fetchPageContent(selectedPageId)} disabled={saving || loading}>
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="save" size={16} />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg p-12 bg-gray-50">
              <Icon name="file-text" size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a page to start editing</p>
              <p className="text-sm">Choose from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
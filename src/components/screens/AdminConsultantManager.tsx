import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Consultant, expertiseCategories } from '../../lib/sample-data/consultants';

interface AdminConsultantManagerProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  className?: string;
}

export function AdminConsultantManager({ onNavigate, onBack, className }: AdminConsultantManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state - simplified for now, will expand as needed
  const [formData, setFormData] = useState<Partial<Consultant>>({
    name: '',
    credentials: '',
    category: 'therapist',
    bio: '',
    photo: '',
    yearsExperience: 5,
    languages: [],
    expertises: [],
    pricing: { video: 1000, call: 800, chat: 500, offline: 1500 },
    available: true,
    location: '',
    sessionModes: ['online', 'video'],
    qualifications: [],
    topExpertises: [],
    approaches: [],
    concernsICanHelp: []
  });

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProfessionals();
      if (response && Array.isArray(response)) {
        setConsultants(response);
      } else if (response && response.professionals) {
         setConsultants(response.professionals);
      }
    } catch (error: any) {
      console.error('Failed to load consultants:', error);
      showToast('error', 'Load Failed', error.message || 'Could not load consultants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingConsultant(null);
    setFormData({
      name: '',
      credentials: '',
      category: 'therapist',
      bio: '',
      photo: '',
      yearsExperience: 5,
      languages: ['English'],
      expertises: [],
      pricing: { video: 1000, call: 800, chat: 500, offline: 1500 },
      available: true,
      location: '',
      sessionModes: ['online', 'video'],
      qualifications: [],
      topExpertises: [],
      approaches: [],
      concernsICanHelp: []
    });
  };

  const handleEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setIsCreating(false);
    setFormData(consultant);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.credentials) {
        showToast('warning', 'Validation Error', 'Name and credentials are required');
        return;
      }

      if (editingConsultant) {
        // Update existing
        const response = await apiClient.updateProfessional(editingConsultant.id, formData);
        showToast('success', 'Consultant Updated', 'Consultant updated successfully');
        setConsultants(prev => prev.map(c => c.id === editingConsultant.id ? (response.data || response) : c));
      } else {
        // Create new
        const response = await apiClient.createProfessional(formData);
        showToast('success', 'Consultant Created', 'New consultant created successfully');
        setConsultants(prev => [(response.data || response), ...prev]);
      }

      setEditingConsultant(null);
      setIsCreating(false);
      loadConsultants(); // Reload to ensure sync
    } catch (error: any) {
      console.error('Save failed:', error);
      showToast('error', 'Save Failed', error.message || 'Could not save consultant');
    }
  };

  const handleDelete = async (consultantId: string) => {
    if (!confirm('Are you sure you want to delete this consultant? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteProfessional(consultantId);
      showToast('success', 'Consultant Deleted', 'Consultant deleted successfully');
      setConsultants(prev => prev.filter(c => c.id !== consultantId));
      
      if (editingConsultant?.id === consultantId) {
        setEditingConsultant(null);
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast('error', 'Delete Failed', error.message || 'Could not delete consultant');
    }
  };

  const handleCancel = () => {
    setEditingConsultant(null);
    setIsCreating(false);
  };

  const toggleArrayItem = (field: keyof Consultant, item: string) => {
    setFormData(prev => {
        const currentList = (prev[field] as string[]) || [];
        const exists = currentList.includes(item);
        return {
            ...prev,
            [field]: exists 
                ? currentList.filter(i => i !== item)
                : [...currentList, item]
        };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading consultants...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingConsultant) {
    return (
      <div className={cn("min-h-screen bg-gray-50 p-6", className)}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium">
              {editingConsultant ? 'Edit Consultant' : 'Create New Consultant'}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Consultant</Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Credentials *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={formData.credentials || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Category</label>
                   <select 
                     className="w-full p-2 border rounded-md"
                     value={formData.category || 'therapist'}
                     onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                   >
                     <option value="therapist">Therapist</option>
                     <option value="psychiatrist">Psychiatrist</option>
                     <option value="counselor">Counselor</option>
                     <option value="family-therapist">Family Therapist</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                   <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={formData.yearsExperience || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

               <div>
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

               <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
               <h2 className="text-lg font-medium mb-4">Pricing & Availability</h2>
               <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Video (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={formData.pricing?.video || 0}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing!, video: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Call (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={formData.pricing?.call || 0}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing!, call: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chat (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={formData.pricing?.chat || 0}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing!, chat: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">Offline (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={formData.pricing?.offline || 0}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing!, offline: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
               </div>
               
               <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="available" className="text-sm font-medium">Currently Available</label>
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-medium mb-4">Expertise</h2>
               <div className="h-64 overflow-y-auto border rounded-md p-4 grid grid-cols-2 gap-2">
                 {expertiseCategories.map(exp => (
                   <div key={exp} className="flex items-center gap-2">
                     <input
                       type="checkbox"
                       id={`exp-${exp}`}
                       checked={(formData.expertises || []).includes(exp)}
                       onChange={() => toggleArrayItem('expertises', exp)}
                       className="w-4 h-4"
                     />
                     <label htmlFor={`exp-${exp}`} className="text-sm">{exp}</label>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-medium mb-4">Languages (comma separated)</h2>
                <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={(formData.languages || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                />
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 p-6", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             {onBack && (
               <Button variant="ghost" onClick={onBack} size="icon">
                 <Icon name="arrow-left" size={20} />
               </Button>
             )}
             <h1 className="text-2xl font-medium">Consultant Manager</h1>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Icon name="plus" size={20} /> Create Consultant
          </Button>
        </div>

        {consultants.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border">
            <h2 className="text-lg font-medium mb-2">No consultants found</h2>
            <p className="text-muted-foreground">Create your first consultant to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {consultants.map(consultant => (
              <div 
                key={consultant.id}
                className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {consultant.photo ? (
                    <img src={consultant.photo} alt={consultant.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-500">{consultant.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{consultant.name}</h3>
                    <p className="text-sm text-muted-foreground">{consultant.category} • {consultant.credentials}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(consultant)}>Edit</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(consultant.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

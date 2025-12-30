import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { EquipMetaEditor } from './EquipMetaEditor';
import { EquipDaysManager } from './EquipDaysManager';
import { useNotifications } from '../../../contexts/NotificationContext';
import { apiClient } from '../../../lib/api-client';

interface EquipEditorProps {
  programId?: string | null;
  onBack: () => void;
}

export function EquipEditor({ programId, onBack }: EquipEditorProps) {
  const [activeTab, setActiveTab] = useState<'meta' | 'days'>('meta');
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(!!programId);
  const { showToast } = useNotifications();

  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      // New program shell
      setProgram({
        name: 'New Program',
        description: '',
        category: 'general',
        duration_days: 7,
        price_cents: 0,
        status: 'draft',
        slug: `program-${Date.now()}`
      });
    }
  }, [programId]);

  const loadProgram = async () => {
    try {
      // We need to use the new route. 
      // `apiClient.getEquipProgram` maps to `/equip/programs/:id`
      const data = await apiClient.getEquipProgram(programId!);
      setProgram(data);
    } catch (error) {
      showToast('error', 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (programId) {
        await apiClient.updateEquipProgram(programId, program);
        showToast('success', 'Changes saved');
      } else {
        const newProg = await apiClient.createEquipProgram(program);
        showToast('success', 'Program created');
        // If we want to switch to edit mode, we'd need to pass the ID back up or replace URL.
        // For now, just go back to list.
        onBack();
      }
    } catch (error) {
      showToast('error', 'Failed to save');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!program) return <div>Error loading program.</div>;

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
             <h1 className="text-lg font-medium">{program.name}</h1>
             <div className="flex gap-2 text-sm text-neutral-500">
               <span className={`cursor-pointer hover:text-neutral-900 ${activeTab === 'meta' ? 'text-neutral-900 font-medium' : ''}`} onClick={() => setActiveTab('meta')}>Settings</span>
               <span>/</span>
               <span className={`cursor-pointer hover:text-neutral-900 ${activeTab === 'days' ? 'text-neutral-900 font-medium' : ''}`} onClick={() => setActiveTab('days')}>Curriculum</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={handleSave} className="gap-2">
             <Save className="w-4 h-4" /> Save
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'meta' && (
          <EquipMetaEditor 
            program={program} 
            onChange={(updates: any) => setProgram({ ...program, ...updates })} 
          />
        )}
        {activeTab === 'days' && (
          <EquipDaysManager 
            programId={program.id || program.equip_id || programId} // Handle legacy ID confusion
            durationDays={program.duration_days}
          />
        )}
      </div>
    </div>
  );
}

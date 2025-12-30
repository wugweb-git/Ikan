import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationContext';
import { CheckCircle, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ProgramViewProps {
  equipId: string;
  onBack: () => void;
}

export function ProgramView({ equipId, onBack }: ProgramViewProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const { showToast } = useNotifications();

  useEffect(() => {
    loadContent();
  }, [equipId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const content = await apiClient.getTodayContent(equipId);
      setData(content);
      // Pre-fill responses if any exist in progress
      if (content.progress?.block_responses) {
        setResponses(content.progress.block_responses);
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (blockId: string, value: any) => {
    setResponses(prev => ({ ...prev, [blockId]: value }));
    apiClient.saveBlockResponse(equipId, data.day.day_number, blockId, value).catch(console.error);
  };

  const handleCompleteDay = async () => {
    try {
      await apiClient.completeDay(equipId, data.day.day_number);
      showToast('success', 'Day Complete!');
      onBack(); // Return to dashboard
    } catch (error) {
      showToast('error', 'Failed to complete day');
    }
  };

  useEffect(() => {
    if (data && blocks.length > 0 && Object.keys(responses).length > 0) {
        // Find first incomplete interactive block
        const firstIncompleteIndex = blocks.findIndex((b: any) => {
            const isInteractive = b.block_type === 'reflection' || b.dataset_id;
            return isInteractive && !responses[b.id];
        });

        if (firstIncompleteIndex !== -1) {
            // Scroll after a short delay to allow rendering
            setTimeout(() => {
                const el = document.getElementById(`block-${blocks[firstIncompleteIndex].id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
  }, [data, blocks]);

  if (loading) return <div className="p-8 text-center">Loading session...</div>;
  if (!data) return <div className="p-8 text-center">Content not found.</div>;

  const { day, blocks } = data;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Day {day.day_number}</h2>
          <h1 className="text-2xl font-bold text-neutral-900">{day.title}</h1>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-12">
        {blocks.map((block: any, index: number) => (
           <div id={`block-${block.id}`} key={block.id}>
             <BlockRenderer 
               block={block} 
               index={index}
               value={responses[block.id]}
               onChange={(val: any) => handleResponseChange(block.id, val)}
             />
           </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 flex justify-center">
         <Button 
           size="lg" 
           className="w-full max-w-md bg-neutral-900 text-white"
           onClick={handleCompleteDay}
         >
           <CheckCircle className="w-5 h-5 mr-2" /> Complete Day
         </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// BLOCK RENDERER
// ------------------------------------------------------------------

function BlockRenderer({ block, index, value, onChange }: any) {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
       
       {block.content && (
         <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>{block.content.body}</ReactMarkdown>
         </div>
       )}

       {/* Interaction */}
       {block.block_type === 'reflection' && (
         <textarea
           className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:outline-none min-h-[120px]"
           placeholder="Write your thoughts here..."
           value={value || ''}
           onChange={(e) => onChange(e.target.value)}
         />
       )}
       
       {/* Dataset Interactions */}
       {block.dataset_id && (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
             <p className="text-sm text-neutral-500 mb-2">Interaction Required</p>
             <textarea
               className="w-full p-2 rounded border"
               placeholder="Record your response..."
               value={typeof value === 'object' ? JSON.stringify(value) : (value || '')}
               onChange={(e) => onChange(e.target.value)} 
             />
          </div>
       )}
    </div>
  );
}

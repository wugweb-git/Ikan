import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { ArrowLeft, Plus, Trash2, GripVertical, FileText, MessageSquare, Database } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useNotifications } from '../../../contexts/NotificationContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BLOCK_TYPES } from '../../../lib/constants/blockTypes';

export function EquipDayEditor({ day, onBack }: { day: any, onBack: () => void }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [dayTitle, setDayTitle] = useState(day.title);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    loadBlocks();
  }, [day.id]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      // Need endpoint for blocks
      const res = await apiClient.request(`/equip/days/${day.id}/blocks`, { method: 'GET' }, true, 0);
      setBlocks(res.blocks || []);
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  const handleUpdateDay = async () => {
     try {
         await apiClient.request(`/equip/days/${day.id}`, {
             method: 'PUT',
             body: JSON.stringify({ title: dayTitle })
         }, true, 0);
         showToast('success', 'Day updated');
     } catch (e) {
         showToast('error', 'Failed to update day');
     }
  };

  const handleAddBlock = async (type: string) => {
      try {
          const res = await apiClient.request(`/equip/days/${day.id}/blocks`, {
              method: 'POST',
              body: JSON.stringify({
                  block_type: type,
                  sort_order: blocks.length
              })
          }, true, 0);
          setBlocks([...blocks, res.block]);
      } catch (e) {
          showToast('error', 'Failed to add block');
      }
  };

  const handleUpdateBlock = async (blockId: string, updates: any) => {
      try {
          const res = await apiClient.request(`/equip/blocks/${blockId}`, {
              method: 'PUT',
              body: JSON.stringify(updates)
          }, true, 0);
          setBlocks(blocks.map(b => b.id === blockId ? res.block : b));
      } catch (e) {
          showToast('error', 'Failed to update block');
      }
  };

  const handleDeleteBlock = async (blockId: string) => {
      if(!confirm('Delete block?')) return;
      try {
          await apiClient.request(`/equip/blocks/${blockId}`, { method: 'DELETE' }, true, 0);
          setBlocks(blocks.filter(b => b.id !== blockId));
      } catch (e) {
          showToast('error', 'Failed to delete block');
      }
  };
  
  const handleDragEnd = (result: any) => {
      if (!result.destination) return;
      const items = Array.from(blocks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setBlocks(items);
      
      // Sync order to backend
      // Map items to get array of IDs in order
      const orderedIds = items.map(b => b.id);
      apiClient.request(`/equip/days/${day.id}/blocks/reorder`, {
          method: 'POST',
          body: JSON.stringify({ orderedIds })
      }, true, 0).catch(console.error);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50">
       <div className="h-14 bg-white border-b border-neutral-200 flex items-center px-4 gap-4 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
             <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-neutral-200" />
          <Input 
             className="h-8 w-64 font-medium" 
             value={dayTitle} 
             onChange={(e) => setDayTitle(e.target.value)}
             onBlur={handleUpdateDay}
          />
       </div>

       <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks">
                      {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                              {blocks.map((block, index) => (
                                  <Draggable key={block.id} draggableId={block.id} index={index}>
                                      {(provided) => (
                                          <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden"
                                          >
                                              <div className="flex items-center gap-3 p-3 bg-neutral-50 border-b border-neutral-100">
                                                  <div {...provided.dragHandleProps} className="text-neutral-400 cursor-grab hover:text-neutral-600">
                                                      <GripVertical className="w-4 h-4" />
                                                  </div>
                                                  <span className="text-xs font-mono uppercase text-neutral-500 font-medium">
                                                      {block.block_type}
                                                  </span>
                                                  <div className="flex-1" />
                                                  <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-6 w-6 text-neutral-400 hover:text-red-500"
                                                      onClick={() => handleDeleteBlock(block.id)}
                                                  >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                  </Button>
                                              </div>
                                              
                                              <div className="p-4 space-y-4">
                                                  {/* EDITOR FIELDS BASED ON TYPE */}
                                                  <div className="grid gap-2">
                                                      <label className="text-xs font-medium text-neutral-500">Content Slug / ID</label>
                                                      <div className="flex gap-2">
                                                          <Input 
                                                              value={block.content_ref_id || ''} 
                                                              onChange={(e) => handleUpdateBlock(block.id, { content_ref_id: e.target.value })}
                                                              placeholder={block.block_type === 'content' ? "intro-article-1" : "Optional content reference"}
                                                          />
                                                          {/* Could add a "Pick" button here */}
                                                      </div>
                                                  </div>

                                                  {(block.block_type === 'exercise' || block.block_type === 'dataset') && (
                                                      <div className="grid gap-2">
                                                          <label className="text-xs font-medium text-neutral-500">Dataset ID</label>
                                                          <Input 
                                                              value={block.dataset_id || ''} 
                                                              onChange={(e) => handleUpdateBlock(block.id, { dataset_id: e.target.value })}
                                                              placeholder="dataset-123"
                                                          />
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </Draggable>
                              ))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
              </DragDropContext>

              {/* Add Buttons */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                  {BLOCK_TYPES.map(type => (
                      <Button 
                        key={type.value}
                        variant="outline" 
                        className="border-dashed h-24 flex flex-col gap-2 hover:bg-neutral-50" 
                        onClick={() => handleAddBlock(type.value)}
                      >
                          <Database className="w-6 h-6 text-neutral-400" />
                          <span>Add {type.label}</span>
                      </Button>
                  ))}
              </div>
          </div>
       </div>
    </div>
  );
}

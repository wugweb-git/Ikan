import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calendar, GripVertical, Search, Copy, 
  ChevronRight, MoreHorizontal, LayoutList, BookOpen, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AdminFormField } from '../admin/AdminFormField';
import { DayContent, Activity } from '../../lib/equip-admin-types';
import { EquipBlockEditor } from './EquipBlockEditor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface EquipDailyEditorProps {
  days: DayContent[];
  onChange: (days: DayContent[]) => void;
}

export function EquipDailyEditor({ days, onChange }: EquipDailyEditorProps) {
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(days.length > 0 ? 1 : null);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  // Ensure we have a valid selection
  useEffect(() => {
    if (selectedDayNum === null && days.length > 0) {
      setSelectedDayNum(days[0].day);
    }
  }, [days.length]);

  const activeDay = days.find(d => d.day === selectedDayNum);

  const handleUpdateDay = (dayNum: number, updates: Partial<DayContent>) => {
    const newDays = days.map(d => d.day === dayNum ? { ...d, ...updates } : d);
    onChange(newDays);
  };

  const handleAddDay = () => {
    const newDayNum = days.length + 1;
    const newDay: DayContent = {
      day: newDayNum,
      title: `Day ${newDayNum}`,
      description: '',
      activities: [],
      dayType: 'lesson'
    };
    onChange([...days, newDay]);
    setSelectedDayNum(newDayNum);
  };

  const handleDeleteDay = (dayNum: number) => {
    if (!confirm('Are you sure? This will shift subsequent days.')) return;
    const filtered = days.filter(d => d.day !== dayNum);
    // Re-index days
    const reindexed = filtered.map((d, i) => ({ ...d, day: i + 1 }));
    onChange(reindexed);
    if (selectedDayNum === dayNum) {
      setSelectedDayNum(reindexed.length > 0 ? reindexed[0].day : null);
    }
  };

  const handleDuplicateDay = (day: DayContent) => {
    const newDayNum = days.length + 1;
    const newDay: DayContent = {
      ...day,
      day: newDayNum,
      title: `${day.title} (Copy)`,
      activities: day.activities.map(a => ({ ...a, id: `block_${Date.now()}_${Math.random()}` }))
    };
    onChange([...days, newDay]);
    setSelectedDayNum(newDayNum);
  };

  // Block Management
  const addBlock = (dayNum: number) => {
    const target = days.find(d => d.day === dayNum);
    if (!target) return;
    const newBlock: Activity = {
      id: `block_${Date.now()}`,
      title: '',
      type: 'lesson',
      content: '',
      duration: 5,
      required: true,
      order: target.activities.length
    };
    handleUpdateDay(dayNum, { activities: [...target.activities, newBlock] });
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
  };

  const updateBlock = (dayNum: number, blockId: string, updates: Partial<Activity>) => {
    const target = days.find(d => d.day === dayNum);
    if (!target) return;
    const updatedActivities = target.activities.map(a => a.id === blockId ? { ...a, ...updates } : a);
    handleUpdateDay(dayNum, { activities: updatedActivities });
  };

  const deleteBlock = (dayNum: number, blockId: string) => {
    const target = days.find(d => d.day === dayNum);
    if (!target) return;
    handleUpdateDay(dayNum, { activities: target.activities.filter(a => a.id !== blockId) });
  };

  const moveBlock = (dayNum: number, index: number, direction: 'up' | 'down') => {
    const target = days.find(d => d.day === dayNum);
    if (!target) return;
    const activities = [...target.activities];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activities.length) return;
    [activities[index], activities[newIndex]] = [activities[newIndex], activities[index]];
    handleUpdateDay(dayNum, { activities });
  };

  return (
    <div className="h-[calc(100vh-250px)] flex border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* LEFT SIDEBAR: DAY LIST */}
      <div className="w-[280px] flex flex-col border-r bg-gray-50/50">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Days ({days.length})</span>
          <Button onClick={handleAddDay} size="sm" variant="outline" className="h-8 gap-1">
            <Plus size={14} /> Add
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {days.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 text-xs">
              No days added.
            </div>
          ) : (
            days.map((day) => (
              <div 
                key={day.day}
                onClick={() => setSelectedDayNum(day.day)}
                className={`
                  group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                  ${selectedDayNum === day.day 
                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/10' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0
                  ${selectedDayNum === day.day ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}
                `}>
                  {day.day}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedDayNum === day.day ? 'text-gray-900' : 'text-gray-600'}`}>
                    {day.title || `Day ${day.day}`}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    {day.activities.length} blocks • {day.dayType === 'practice' ? 'Practice' : 'Lesson'}
                  </p>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicateDay(day)}>
                      <Copy className="w-4 h-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteDay(day.day)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: DAY EDITOR */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
        {activeDay ? (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-8 space-y-8">
              
              {/* Day Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    Day {activeDay.day} Configuration
                  </h3>
                  <Badge variant="outline" className="px-3 py-1">
                    {activeDay.activities.length} Activities
                  </Badge>
                </div>

                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-6 grid grid-cols-2 gap-6">
                    <AdminFormField label="Day Title">
                      <Input 
                        value={activeDay.title} 
                        onChange={e => handleUpdateDay(activeDay.day, { title: e.target.value })}
                        placeholder="e.g. Understanding Sleep Cycles"
                      />
                    </AdminFormField>
                    <AdminFormField label="Day Type">
                      <Select 
                        value={activeDay.dayType || 'lesson'} 
                        onValueChange={(v: any) => handleUpdateDay(activeDay.day, { dayType: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lesson">📖 Lesson Day</SelectItem>
                          <SelectItem value="practice">🌙 Practice Mode</SelectItem>
                          <SelectItem value="conclusion">🏆 Conclusion</SelectItem>
                        </SelectContent>
                      </Select>
                    </AdminFormField>
                  </CardContent>
                </Card>
              </div>

              {/* Block Sequence */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <LayoutList size={16} /> Block Sequence
                  </h4>
                  <Button onClick={() => addBlock(activeDay.day)} size="sm" className="gap-2">
                    <Plus size={14} /> Add Block
                  </Button>
                </div>

                {activeDay.activities.length === 0 ? (
                  <div className="border-2 border-dashed rounded-xl p-12 text-center bg-white/50">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Plus size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">No content blocks yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add a block to start building this day's curriculum</p>
                    <Button onClick={() => addBlock(activeDay.day)} variant="outline" className="mt-4">
                      Add First Block
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDay.activities.map((block, idx) => (
                      <EquipBlockEditor
                        key={block.id}
                        block={block}
                        onChange={updates => updateBlock(activeDay.day, block.id, updates)}
                        onDelete={() => deleteBlock(activeDay.day, block.id)}
                        isExpanded={expandedBlocks[block.id] || false}
                        onToggleExpand={() => setExpandedBlocks(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                        isFirst={idx === 0}
                        isLast={idx === activeDay.activities.length - 1}
                        moveUp={() => moveBlock(activeDay.day, idx, 'up')}
                        moveDown={() => moveBlock(activeDay.day, idx, 'down')}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a day to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
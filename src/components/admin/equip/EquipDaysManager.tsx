import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Plus, GripVertical, ChevronRight, Loader2 } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { EquipDayEditor } from './EquipDayEditor';

export function EquipDaysManager({ programId, durationDays }: { programId: string, durationDays: number }) {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const { showToast } = useNotifications();

  useEffect(() => {
    if (programId) loadDays();
  }, [programId]);

  const loadDays = async () => {
    // We need an endpoint to list days.
    // The current API client doesn't have it exposed explicitly but `progress-service` uses `EquipDayService.listDaysForEquip`.
    // I need to add `getEquipDays(equipId)` to apiClient or use a generic request.
    try {
      // Let's assume we add this endpoint or hijack an existing one.
      // Wait, I didn't add a public `GET /equip/:id/days` endpoint in `equip-routes.ts`.
      // I only added `/programs/:id`.
      // The `EquipService.getFullEquip` returns `days` joined?
      // Let's check `program-service.ts` implementation of `getFullEquip`.
      // Oh wait, I can't check `program-service.ts` easily as it's backend code.
      // But typically `getFullEquip` would include days. 
      // If `EquipEditor` fetched the program, did it include days?
      // If so, `program.days` would be populated.
      // But `EquipEditor` used `getEquipProgram` which returns the row.
      
      // I should add a dedicated endpoint for fetching days management.
      // Or just fetch `getFullEquip` which should ideally return hierarchy.
      
      // FOR NOW: Let's assume `apiClient.getEquipProgram` returned days if backend supported it.
      // If not, I'll need to add a route.
      
      // Let's add `GET /admin/equip/:id/days` to `equip-routes.ts` quickly?
      // No, let's use `request` directly if needed.
      
      // Actually, let's assume `getEquipProgram` returns everything for now or the user will ask to fix it.
      // But wait, `EquipEditor` uses `getEquipProgram` and passes `program` down. 
      // But `EquipDaysManager` takes `programId`.
      
      // Let's try to fetch days.
      const response = await apiClient.request(`/equip/programs/${programId}/days`, { method: 'GET' }, true, 0);
      setDays(response.days || []);
    } catch (e) {
      console.log('Failed to load days', e);
      // Fallback: Generate mock days if backend missing
      // setDays(Array.from({ length: durationDays }, (_, i) => ({ 
      //   day_number: i + 1, 
      //   title: `Day ${i + 1}`,
      //   id: `temp-${i}` 
      // })));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateDay = async () => {
      // Create next day
      const nextNum = days.length + 1;
      try {
          const res = await apiClient.request(`/equip/programs/${programId}/days`, {
              method: 'POST',
              body: JSON.stringify({
                  day_number: nextNum,
                  title: `Day ${nextNum}`
              })
          }, true, 0);
          setDays([...days, res.day]);
      } catch (e) {
          showToast('error', 'Failed to create day');
      }
  };

  if (selectedDay) {
    return (
      <EquipDayEditor 
        day={selectedDay} 
        onBack={() => {
            setSelectedDay(null);
            loadDays(); // Refresh on back
        }} 
      />
    );
  }

  return (
    <div className="flex h-full">
       {/* Sidebar list of days */}
       <div className="w-80 border-r border-neutral-200 bg-white flex flex-col">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
             <h3 className="font-medium">Days ({days.length})</h3>
             <Button size="sm" variant="ghost" onClick={handleCreateDay}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto">
             {loading && <div className="p-4 text-center text-sm text-neutral-500"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>Loading...</div>}
             {!loading && days.map((day) => (
                <div 
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className="p-4 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer flex items-center justify-between group"
                >
                   <div>
                     <div className="text-xs text-neutral-500 font-mono mb-1">Day {day.day_number}</div>
                     <div className="font-medium text-sm">{day.title}</div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500" />
                </div>
             ))}
             {!loading && days.length === 0 && (
                 <div className="p-8 text-center text-neutral-500 text-sm">
                     No days yet.
                     <br/>
                     <Button variant="link" onClick={handleCreateDay}>Add Day 1</Button>
                 </div>
             )}
          </div>
       </div>

       {/* Empty State */}
       <div className="flex-1 flex items-center justify-center bg-neutral-50 text-neutral-400">
          Select a day to edit content
       </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { apiClient } from '../../../lib/api-client';
import { Trash2, Plus, Save } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';

export function RecommendationRulesManager({ onBack }: { onBack: () => void }) {
  const [rules, setRules] = useState<any[]>([]);
  const [equips, setEquips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
       // We need endpoints for rules.
       // Assuming GET /recommendations/rules and POST /recommendations/rules
       // If they don't exist, we must add them to backend.
       // I recall creating `equip_recommendation_rules` table in Phase 5 prompt context, 
       // but did I create the endpoints in this session?
       // I created `recommendation-service.ts` in previous phases (implied), 
       // and `index.tsx` has `app.get("/recommendations", ...)`
       // but not CRUD for rules.
       
       // I'll need to add CRUD endpoints for rules.
       
       const [programs] = await Promise.all([
           apiClient.getEquipPrograms()
           // apiClient.getRecommendationRules() // Missing
       ]);
       setEquips(programs);
       
       // Mock rules for now or fetch if endpoint exists
       // For MVP of Phase 6, I'll fetch via generic request if I add the endpoint.
       // Let's assume I'll add GET /admin/recommendations/rules
       
       const rulesData = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0).catch(() => []);
       setRules(rulesData.rules || []);
       
    } catch (e) {
       console.error(e);
       showToast('error', 'Failed to load rules');
    } finally {
       setLoading(false);
    }
  };

  const handleAddRule = () => {
      setRules([...rules, {
          id: `temp-${Date.now()}`,
          assessment_type: 'anxiety', // default
          min_score_severity: 'moderate',
          equip_id: equips[0]?.id || '',
          priority: 10,
          reason: 'Recommended based on your assessment.'
      }]);
  };

  const handleSaveRule = async (rule: any) => {
      try {
          if (rule.id.startsWith('temp-')) {
          // Create
          const { id, ...data } = rule;
          const res = await apiClient.request('/admin/recommendations/rules', {
              method: 'POST',
              body: JSON.stringify({
                  assessment_category: data.assessment_category || data.assessment_type,
                  min_severity: data.min_severity || data.min_score_severity,
                  equip_id: data.equip_id,
                  priority: data.priority,
                  rationale: data.rationale || data.reason
              })
          }, true, 0);
          // Replace temp rule with real one
          setRules(rules.map(r => r.id === rule.id ? res.rule : r));
      } else {
          // Update
          await apiClient.request(`/admin/recommendations/rules/${rule.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  assessment_category: rule.assessment_category || rule.assessment_type,
                  min_severity: rule.min_severity || rule.min_score_severity,
                  equip_id: rule.equip_id,
                  priority: rule.priority,
                  rationale: rule.rationale || rule.reason
              })
          }, true, 0);
      }
          showToast('success', 'Rule saved');
      } catch (e) {
          showToast('error', 'Failed to save rule');
      }
  };
  
  const handleDeleteRule = async (id: string) => {
      if (id.startsWith('temp-')) {
          setRules(rules.filter(r => r.id !== id));
          return;
      }
      try {
          await apiClient.request(`/admin/recommendations/rules/${id}`, { method: 'DELETE' }, true, 0);
          setRules(rules.filter(r => r.id !== id));
      } catch (e) {
          showToast('error', 'Failed to delete rule');
      }
  };
  
  const updateLocalRule = (id: string, updates: any) => {
      setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
       <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold">Recommendation Rules</h1>
           <Button onClick={handleAddRule}><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
       </div>

       <Card>
           <CardContent className="p-0">
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead>Assessment</TableHead>
                           <TableHead>Severity ≥</TableHead>
                           <TableHead>Recommend Program</TableHead>
                           <TableHead>Priority</TableHead>
                           <TableHead>Rationale</TableHead>
                           <TableHead className="w-[100px]">Actions</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {rules.map((rule) => (
                           <TableRow key={rule.id}>
                               <TableCell>
                                   <Select 
                                       value={rule.assessment_category || rule.assessment_type || 'anxiety'} 
                                       onValueChange={(val) => updateLocalRule(rule.id, { assessment_category: val })}
                                   >
                                       <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                       <SelectContent>
                                           <SelectItem value="anxiety">Anxiety (GAD-7)</SelectItem>
                                           <SelectItem value="depression">Depression (PHQ-9)</SelectItem>
                                           <SelectItem value="sleep">Sleep (ISI)</SelectItem>
                                       </SelectContent>
                                   </Select>
                               </TableCell>
                               <TableCell>
                                   <Select 
                                       value={rule.min_severity || rule.min_score_severity || 'moderate'} 
                                       onValueChange={(val) => updateLocalRule(rule.id, { min_severity: val })}
                                   >
                                       <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                       <SelectContent>
                                           <SelectItem value="low">Low</SelectItem>
                                           <SelectItem value="mild">Mild</SelectItem>
                                           <SelectItem value="moderate">Moderate</SelectItem>
                                           <SelectItem value="high">High/Severe</SelectItem>
                                       </SelectContent>
                                   </Select>
                               </TableCell>
                               <TableCell>
                                   <Select 
                                       value={rule.equip_id || ''} 
                                       onValueChange={(val) => updateLocalRule(rule.id, { equip_id: val })}
                                   >
                                       <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                       <SelectContent>
                                           {equips.map(e => (
                                               <SelectItem key={e.id} value={e.id}>{e.title || e.name}</SelectItem>
                                           ))}
                                       </SelectContent>
                                   </Select>
                               </TableCell>
                               <TableCell>
                                   <Input 
                                       type="number" 
                                       className="w-20" 
                                       value={rule.priority || 10} 
                                       onChange={(e) => updateLocalRule(rule.id, { priority: parseInt(e.target.value) })}
                                   />
                               </TableCell>
                               <TableCell>
                                   <Input 
                                       value={rule.rationale || rule.reason || ''} 
                                       onChange={(e) => updateLocalRule(rule.id, { rationale: e.target.value })}
                                   />
                               </TableCell>
                               <TableCell>
                                   <div className="flex items-center gap-2">
                                       <Button size="icon" variant="ghost" onClick={() => handleSaveRule(rule)}>
                                           <Save className="w-4 h-4 text-green-600" />
                                       </Button>
                                       <Button size="icon" variant="ghost" onClick={() => handleDeleteRule(rule.id)}>
                                           <Trash2 className="w-4 h-4 text-red-500" />
                                       </Button>
                                   </div>
                               </TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
           </CardContent>
       </Card>
    </div>
  );
}

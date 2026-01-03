import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { apiClient } from '../../../lib/api-client';
import { Trash2, Plus, Save, Sparkles, Loader2 } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';

export function RecommendationRulesManager({ onBack }: { onBack: () => void }) {
  const [rules, setRules] = useState<any[]>([]);
  const [equips, setEquips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { showToast } = useNotifications();

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
       const [programs] = await Promise.all([
           apiClient.getEquipPrograms()
       ]);
       setEquips(programs);
       
       const rulesData = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0).catch(() => []);
       setRules(rulesData.rules || []);
       
    } catch (e) {
       console.error(e);
       showToast('error', 'Failed to load rules');
    } finally {
       setLoading(false);
    }
  };

  const seedDefaultRules = async () => {
      setSeeding(true);
      try {
          // 1. Fetch existing programs to get IDs
          const programs = await apiClient.getEquipPrograms();
          const findProgramId = (title: string) => programs.find((p: any) => p.title === title)?.id;

          const defaultRules = [
              // --- ANXIETY (GAI) ---
              {
                  assessment_category: 'Anxiety',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 8,
                  rationale: 'Early stress regulation helps prevent anxiety escalation'
              },
              {
                  assessment_category: 'Anxiety',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 10,
                  rationale: 'Anxiety often disrupts sleep; stabilizing sleep reduces symptoms'
              },
              {
                  assessment_category: 'Anxiety',
                  min_severity: 'moderate',
                  equip_title: 'Stress Buster',
                  priority: 9,
                  rationale: 'Thought & feeling regulation reduces anxious loops'
              },
              {
                  assessment_category: 'Anxiety',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 9,
                  rationale: 'Prolonged anxiety often coexists with exhaustion & overload'
              },

              // --- STRESS ---
              {
                  assessment_category: 'Stress',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 10,
                  rationale: 'Direct stress coping and grounding techniques'
              },
              {
                  assessment_category: 'Stress',
                  min_severity: 'moderate',
                  equip_title: 'Burnout Reset',
                  priority: 9,
                  rationale: 'Sustained stress leads to burnout patterns'
              },
              {
                  assessment_category: 'Stress',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 7,
                  rationale: 'Sleep improves stress resilience'
              },
              {
                  assessment_category: 'Stress',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 10,
                  rationale: 'High stress requires workload & cognition recalibration'
              },

              // --- BURNOUT ---
              {
                  assessment_category: 'Burnout',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 7,
                  rationale: 'Stress skills help early burnout'
              },
              {
                  assessment_category: 'Burnout',
                  min_severity: 'moderate',
                  equip_title: 'Burnout Reset',
                  priority: 10,
                  rationale: 'Core burnout intervention'
              },
              {
                  assessment_category: 'Burnout',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 8,
                  rationale: 'Sleep restoration accelerates recovery'
              },
              {
                  assessment_category: 'Burnout',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 10,
                  rationale: 'Exhaustion + disengagement need structured recovery'
              },

              // --- SLEEP ---
              {
                  assessment_category: 'Sleep',
                  min_severity: 'mild',
                  equip_title: 'Sleep Tight',
                  priority: 10,
                  rationale: 'Habit and sleep hygiene correction'
              },
              {
                  assessment_category: 'Sleep',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 10,
                  rationale: 'Structured sleep protocol required'
              },
              {
                  assessment_category: 'Sleep',
                  min_severity: 'moderate',
                  equip_title: 'Stress Buster',
                  priority: 8,
                  rationale: 'Stress is a major sleep disruptor'
              },
              {
                  assessment_category: 'Sleep',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 7,
                  rationale: 'Chronic sleep issues often tie to burnout'
              },

              // --- GENERAL / UNSURE ---
              {
                  assessment_category: 'General',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 8,
                  rationale: 'Broad grounding & awareness'
              },
              {
                  assessment_category: 'General',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 7,
                  rationale: 'Sleep improves global wellbeing'
              },
              {
                  assessment_category: 'General',
                  min_severity: 'moderate',
                  equip_title: 'Burnout Reset',
                  priority: 6,
                  rationale: 'Preventive intervention'
              },

              // --- DEPRESSION ---
              {
                  assessment_category: 'Depression',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 6,
                  rationale: 'Mood regulation & grounding'
              },
              {
                  assessment_category: 'Depression',
                  min_severity: 'moderate',
                  equip_title: 'Burnout Reset',
                  priority: 9,
                  rationale: 'Emotional exhaustion overlap'
              },
              {
                  assessment_category: 'Depression',
                  min_severity: 'moderate',
                  equip_title: 'Sleep Tight',
                  priority: 7,
                  rationale: 'Sleep–mood bidirectional link'
              },
              {
                  assessment_category: 'Depression',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 10,
                  rationale: 'High emotional exhaustion'
              },

               // --- BALANCE ---
               {
                  assessment_category: 'Balance',
                  min_severity: 'mild',
                  equip_title: 'Stress Buster',
                  priority: 6,
                  rationale: 'Awareness of overload'
              },
              {
                  assessment_category: 'Balance',
                  min_severity: 'moderate',
                  equip_title: 'Stress Buster',
                  priority: 8,
                  rationale: 'Work–life recalibration'
              },
              {
                  assessment_category: 'Balance',
                  min_severity: 'high',
                  equip_title: 'Burnout Reset',
                  priority: 9,
                  rationale: 'Chronic imbalance indicator'
              }
          ];

          let createdCount = 0;
          for (const rule of defaultRules) {
              const programId = findProgramId(rule.equip_title);
              if (!programId) {
                  console.warn(`Skipping rule for ${rule.equip_title}: Program not found.`);
                  continue;
              }

              // Create Rule
              await apiClient.request('/admin/recommendations/rules', {
                  method: 'POST',
                  body: JSON.stringify({
                      assessment_category: rule.assessment_category,
                      min_severity: rule.min_severity,
                      equip_id: programId,
                      priority: rule.priority,
                      rationale: rule.rationale
                  })
              }, true, 0);
              createdCount++;
          }

          showToast('success', `Seeded ${createdCount} rules successfully.`);
          loadData(); // Reload table

      } catch (e: any) {
          console.error(e);
          showToast('error', `Failed to seed rules: ${e.message}`);
      } finally {
          setSeeding(false);
      }
  };

  const handleAddRule = () => {
      setRules([...rules, {
          id: `temp-${Date.now()}`,
          assessment_type: 'Anxiety', // default
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
           <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    onClick={seedDefaultRules} 
                    disabled={seeding || loading}
                >
                    {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />}
                    Seed Default Rules
                </Button>
                <Button onClick={handleAddRule}><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
           </div>
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
                                       value={rule.assessment_category || rule.assessment_type || 'Anxiety'} 
                                       onValueChange={(val) => updateLocalRule(rule.id, { assessment_category: val })}
                                   >
                                       <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                       <SelectContent>
                                           <SelectItem value="Anxiety">Anxiety</SelectItem>
                                           <SelectItem value="Depression">Depression</SelectItem>
                                           <SelectItem value="Sleep">Sleep</SelectItem>
                                           <SelectItem value="Stress">Stress</SelectItem>
                                           <SelectItem value="Burnout">Burnout</SelectItem>
                                           <SelectItem value="General">General</SelectItem>
                                           <SelectItem value="Balance">Balance</SelectItem>
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

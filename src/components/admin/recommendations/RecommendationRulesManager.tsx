import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { apiClient } from '../../../lib/api-client';
import { Trash2, Plus, Save, ShieldCheck } from 'lucide-react';
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

  const handleTestIntegrity = () => {
    let issues = 0;
    const report: string[] = [];
    
    // Check if we have rules loaded
    if (rules.length === 0) {
        showToast('warning', 'Integrity Check', 'No rules found to check.');
        return;
    }

    rules.forEach((rule, index) => {
        const missingFields = [];
        const ruleName = `Rule #${index + 1} (${rule.assessment_category || 'Unknown'})`;
        
        if (!rule.assessment_category) missingFields.push('Assessment Category');
        if (!rule.min_severity) missingFields.push('Min Severity');
        if (!rule.equip_id) missingFields.push('Equip Program');
        
        // Validate Equip ID exists in current programs
        if (rule.equip_id) {
             const programExists = equips.some(e => e.id === rule.equip_id);
             if (!programExists) {
                 issues++;
                 report.push(`${ruleName}: References non-existent program ID ${rule.equip_id}`);
             }
        }
        
        if (missingFields.length > 0) {
            issues++;
            report.push(`${ruleName}: Missing ${missingFields.join(', ')}`);
        }
    });

    if (issues === 0) {
        showToast('success', 'Integrity Check Passed', 'All rules appear valid and reference existing programs.');
    } else {
        console.warn('Integrity Issues:', report);
        showToast('warning', 'Integrity Issues Found', `Found ${issues} issues. Check console for details.`);
    }
  };

  const handleDeduplicate = async () => {
      setSeeding(true); // Re-using seeding state for loading spinner
      try {
          const rulesData = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0);
          const allRules = rulesData.rules || [];
          
          const uniqueMap = new Map<string, string>(); // Key -> RuleID to KEEP
          const toDelete: string[] = [];

          allRules.forEach((rule: any) => {
              // Create a unique key for the rule logic
              const key = `${rule.assessment_category}-${rule.min_severity}-${rule.equip_id}`;
              
              if (uniqueMap.has(key)) {
                  // Duplicate found! Mark this one for deletion
                  toDelete.push(rule.id);
              } else {
                  // New unique rule, keep it
                  uniqueMap.set(key, rule.id);
              }
          });

          if (toDelete.length === 0) {
              showToast('success', 'No duplicates found.');
              setSeeding(false);
              return;
          }

          // Delete duplicates
          // Execute sequentially to avoid overwhelming the server/rate limits
          let deletedCount = 0;
          for (const id of toDelete) {
              await apiClient.request(`/admin/recommendations/rules/${id}`, { method: 'DELETE' }, true, 0);
              deletedCount++;
          }

          showToast('success', `Cleaned up ${deletedCount} duplicate rules.`);
          loadData(); // Reload table

      } catch (e: any) {
          console.error(e);
          showToast('error', `Cleanup failed: ${e.message}`);
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
           <h1 className="text-2xl font-medium">Recommendation Rules</h1>
           <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    onClick={handleTestIntegrity} 
                    className="gap-2"
                >
                    <ShieldCheck className="w-4 h-4" />
                    Test Integrity
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
                                           <Save className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
                                       </Button>
                                       <Button size="icon" variant="ghost" onClick={() => handleDeleteRule(rule.id)}>
                                           <Trash2 className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
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
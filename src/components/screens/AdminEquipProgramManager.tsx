import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Table, 
  Trash2, 
  Edit, 
  Plus, 
  ArrowLeft, 
  Save, 
  X, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { TextArea } from '../inputs/TextArea';
import { Label } from '../ui/label';

interface AdminEquipProgramManagerProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

export function AdminEquipProgramManager({ onNavigate, onBack }: AdminEquipProgramManagerProps) {
  const { showToast } = useNotifications();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEquipPrograms();
      if (response && response.programs) {
        setPrograms(response.programs);
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
      showToast('error', 'Error', 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProgram({
      title: '',
      description: '',
      summary: '',
      duration_days: 7,
      price: { amount_cents: 0, currency: 'INR' },
      days: [],
      tags: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (program: any) => {
    setEditingProgram({ ...program });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProgramToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;
    
    try {
      await apiClient.deleteEquipProgram(programToDelete);
      showToast('success', 'Success', 'Program deleted successfully');
      loadPrograms();
    } catch (error) {
      console.error('Failed to delete program:', error);
      showToast('error', 'Error', 'Failed to delete program');
    } finally {
      setIsDeleteConfirmOpen(false);
      setProgramToDelete(null);
    }
  };

  const handleSave = async () => {
    if (!editingProgram.title) {
        showToast('error', 'Validation', 'Title is required');
        return;
    }

    try {
      if (editingProgram.equip_id) {
        await apiClient.updateEquipProgram(editingProgram.equip_id, editingProgram);
        showToast('success', 'Success', 'Program updated successfully');
      } else {
        await apiClient.createEquipProgram(editingProgram);
        showToast('success', 'Success', 'Program created successfully');
      }
      setIsDialogOpen(false);
      loadPrograms();
    } catch (error) {
      console.error('Failed to save program:', error);
      showToast('error', 'Error', 'Failed to save program');
    }
  };

  // Simplified Day Editor for MVP
  const handleAddDay = () => {
    const newDay = {
      day: (editingProgram.days?.length || 0) + 1,
      title: `Day ${(editingProgram.days?.length || 0) + 1}`,
      content: [
        { kind: 'text', body: 'Lesson content here...' }
      ],
      estimated_min: 15
    };
    setEditingProgram({
      ...editingProgram,
      days: [...(editingProgram.days || []), newDay]
    });
  };

  const updateDay = (index: number, field: string, value: any) => {
    const updatedDays = [...(editingProgram.days || [])];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setEditingProgram({ ...editingProgram, days: updatedDays });
  };

  const removeDay = (index: number) => {
    const updatedDays = [...(editingProgram.days || [])];
    updatedDays.splice(index, 1);
    // Renumber days
    const renumberedDays = updatedDays.map((d, i) => ({ ...d, day: i + 1 }));
    setEditingProgram({ ...editingProgram, days: renumberedDays });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Equip Program Manager</h2>
            <p className="text-muted-foreground">Create and manage digital programs</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create Program
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium">No Programs Found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first program.</p>
              <Button onClick={handleCreate}>Create Program</Button>
            </CardContent>
          </Card>
        ) : (
          programs.map((program) => (
            <Card key={program.equip_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{program.title}</h3>
                    <Badge variant="secondary">{program.duration_days} Days</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-1">
                    {program.summary || program.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(program.equip_id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram?.equip_id ? 'Edit Program' : 'Create Program'}</DialogTitle>
          </DialogHeader>
          
          {editingProgram && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={editingProgram.title} 
                    onChange={(e) => setEditingProgram({...editingProgram, title: e.target.value})}
                    placeholder="e.g. Sleep Well Program"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Days)</Label>
                  <Input 
                    type="number"
                    value={editingProgram.duration_days} 
                    onChange={(e) => setEditingProgram({...editingProgram, duration_days: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summary (Short Description)</Label>
                <TextArea 
                  value={editingProgram.summary} 
                  onChange={(val) => setEditingProgram({...editingProgram, summary: val})}
                  placeholder="Short summary for cards..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Full Description</Label>
                <TextArea 
                  value={editingProgram.description} 
                  onChange={(val) => setEditingProgram({...editingProgram, description: val})}
                  placeholder="Detailed program description..."
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Daily Content</h3>
                  <Button size="sm" onClick={handleAddDay} variant="secondary">
                    <Plus className="w-4 h-4 mr-1" /> Add Day
                  </Button>
                </div>
                
                {editingProgram.days?.map((day: any, idx: number) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2 mr-4">
                          <Label>Day {day.day} Title</Label>
                          <Input 
                            value={day.title} 
                            onChange={(e) => updateDay(idx, 'title', e.target.value)}
                            placeholder="e.g. Introduction to Sleep"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeDay(idx)} className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!editingProgram.days || editingProgram.days.length === 0) && (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    No daily content added yet.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <CardDescription>
              Are you sure you want to delete this program? This action cannot be undone.
            </CardDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
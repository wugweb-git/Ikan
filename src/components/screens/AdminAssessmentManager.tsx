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

interface AdminAssessmentManagerProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

export function AdminAssessmentManager({ onNavigate, onBack }: AdminAssessmentManagerProps) {
  const { showToast } = useNotifications();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssessments();
      if (response && response.assessments) {
        setAssessments(response.assessments);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      showToast('error', 'Error', 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAssessment({
      title: '',
      description: '',
      category: 'wellness',
      questions: [],
      scoring: { type: 'sum', ranges: [] },
      metadata: { estimated_minutes: 5 }
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (assessment: any) => {
    setEditingAssessment({ ...assessment });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAssessmentToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;
    
    try {
      await apiClient.deleteAssessment(assessmentToDelete);
      showToast('success', 'Success', 'Assessment deleted successfully');
      loadAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      showToast('error', 'Error', 'Failed to delete assessment');
    } finally {
      setIsDeleteConfirmOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const handleSave = async () => {
    if (!editingAssessment.title) {
        showToast('error', 'Validation', 'Title is required');
        return;
    }

    try {
      if (editingAssessment.id) {
        await apiClient.updateAssessment(editingAssessment.id, editingAssessment);
        showToast('success', 'Success', 'Assessment updated successfully');
      } else {
        await apiClient.createAssessment(editingAssessment);
        showToast('success', 'Success', 'Assessment created successfully');
      }
      setIsDialogOpen(false);
      loadAssessments();
    } catch (error) {
      console.error('Failed to save assessment:', error);
      showToast('error', 'Error', 'Failed to save assessment');
    }
  };

  // Simplified Question Editor for the MVP
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: '',
      type: 'single-choice',
      options: [
        { text: 'Never', value: 0 },
        { text: 'Sometimes', value: 1 },
        { text: 'Often', value: 2 },
        { text: 'Always', value: 3 }
      ],
      required: true
    };
    setEditingAssessment({
      ...editingAssessment,
      questions: [...(editingAssessment.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(editingAssessment.questions || [])];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setEditingAssessment({ ...editingAssessment, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...(editingAssessment.questions || [])];
    updatedQuestions.splice(index, 1);
    setEditingAssessment({ ...editingAssessment, questions: updatedQuestions });
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
            <h2 className="text-2xl font-bold">Assessment Manager</h2>
            <p className="text-muted-foreground">Create and manage health assessments</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create Assessment
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium">No Assessments Found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first assessment.</p>
              <Button onClick={handleCreate}>Create Assessment</Button>
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id || assessment.slug} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{assessment.title}</h3>
                    <Badge variant="secondary">{assessment.category}</Badge>
                    {assessment.questions?.length > 0 && (
                      <Badge variant="outline">{assessment.questions.length} Questions</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-1">
                    {assessment.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(assessment)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(assessment.id || assessment.slug)}>
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
            <DialogTitle>{editingAssessment?.id ? 'Edit Assessment' : 'Create Assessment'}</DialogTitle>
          </DialogHeader>
          
          {editingAssessment && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={editingAssessment.title} 
                    onChange={(e) => setEditingAssessment({...editingAssessment, title: e.target.value})}
                    placeholder="e.g. Anxiety Assessment"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingAssessment.category}
                    onChange={(e) => setEditingAssessment({...editingAssessment, category: e.target.value})}
                  >
                    <option value="wellness">Wellness</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="depression">Depression</option>
                    <option value="stress">Stress</option>
                    <option value="burnout">Burnout</option>
                    <option value="sleep">Sleep</option>
                    <option value="work-life">Work-Life</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <TextArea 
                  value={editingAssessment.description} 
                  onChange={(val) => setEditingAssessment({...editingAssessment, description: val})}
                  placeholder="Brief description of the assessment..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Questions</h3>
                  <Button size="sm" onClick={handleAddQuestion} variant="secondary">
                    <Plus className="w-4 h-4 mr-1" /> Add Question
                  </Button>
                </div>
                
                {editingAssessment.questions?.map((q: any, idx: number) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2 mr-4">
                          <Label>Question Text</Label>
                          <Input 
                            value={q.text} 
                            onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                            placeholder="Enter question..."
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx)} className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={q.type}
                            onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                          >
                            <option value="single-choice">Single Choice</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="scale">Scale (1-10)</option>
                            <option value="text">Free Text</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <input 
                                type="checkbox" 
                                checked={q.required} 
                                onChange={(e) => updateQuestion(idx, 'required', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label>Required</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!editingAssessment.questions || editingAssessment.questions.length === 0) && (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    No questions added yet.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Assessment
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
              Are you sure you want to delete this assessment? This action cannot be undone.
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
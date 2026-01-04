import { EquipDayContentEditor } from './EquipDayContentEditor';
import { EquipProgram, DayContent } from '../../lib/equip-admin-types';

interface EquipProgramDetailedEditorProps {
  formData: Partial<EquipProgram>;
  setFormData: (data: Partial<EquipProgram>) => void;
  activeTab: 'basic' | 'content';
  setActiveTab: (tab: 'basic' | 'content') => void;
  editingProgram: EquipProgram | null;
}

export function EquipProgramDetailedEditor({
  formData,
  setFormData,
  activeTab,
  setActiveTab,
  editingProgram
}: EquipProgramDetailedEditorProps) {

  const handleDayContentChange = (newDays: DayContent[]) => {
    setFormData({
      ...formData,
      daily_content: newDays
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div 
        className="flex gap-2 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <button
          onClick={() => setActiveTab('basic')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'basic' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'basic' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'content' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'content' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Daily Content ({formData.daily_content?.length || 0} days)
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={formData.title || ''} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., 30-Day Anxiety Management Program"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the program..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug (URL Path)</Label>
            <Input 
              value={formData.slug || ''} 
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="e.g., anxiety-management-30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category || 'wellness'} 
                onValueChange={(v: any) => setFormData({...formData, category: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="stress">Stress Management</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="depression">Depression</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select 
                value={formData.difficulty || 'beginner'} 
                onValueChange={(v: any) => setFormData({...formData, difficulty: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input 
                type="number"
                value={formData.duration_days || 7}
                onChange={(e) => setFormData({
                  ...formData, 
                  duration_days: parseInt(e.target.value) || 7
                })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input 
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({
                  ...formData, 
                  price: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Checkbox 
              checked={formData.published || false}
              onCheckedChange={(c) => setFormData({...formData, published: !!c})}
              id="published"
            />
            <Label htmlFor="published">Published (Visible to users)</Label>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <EquipDayContentEditor 
          days={formData.daily_content || []}
          onChange={handleDayContentChange}
          durationDays={formData.duration_days || 7}
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { DayDefinition, ProgramBlock, ExerciseBlock, ChecklistBlock, SleepDiaryBlock } from '../../lib/equip-block-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  CheckCircle, 
  BookOpen, 
  PenTool, 
  List, 
  MessageCircle, 
  Moon, 
  Clock 
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useNotifications } from '../../contexts/NotificationContext';

interface DailyProgramRuntimeProps {
  day: DayDefinition;
  onDayComplete: () => void;
  initialProgress?: Record<string, any>; // blockId -> data
}

export function DailyProgramRuntime({ day, onDayComplete, initialProgress = {} }: DailyProgramRuntimeProps) {
  const [blockProgress, setBlockProgress] = useState<Record<string, any>>(initialProgress);

  // Check if all required blocks are completed
  const isDayComplete = day.blocks.every(block => {
    if (!block.required) return true;
    return blockProgress[block.id] !== undefined; // Completed if entry exists
  });

  const handleBlockComplete = (blockId: string, data: any) => {
    setBlockProgress(prev => ({
      ...prev,
      [blockId]: data
    }));
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Day Header */}
      <div className="mb-8 text-center">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Day {day.dayNumber}
        </h2>
        <h1 className="text-3xl font-medium text-[var(--color-text-primary)] mt-1 mb-2">
          {day.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span>⏱ {day.estimatedTime} min</span>
          <span>•</span>
          <span>{day.intent}</span>
        </div>
      </div>

      {/* Block Stack */}
      <div className="space-y-8">
        {day.blocks.map((block, index) => (
          <div key={block.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
            <BlockRenderer 
              block={block} 
              isCompleted={blockProgress[block.id] !== undefined}
              onComplete={(data) => handleBlockComplete(block.id, data)}
            />
          </div>
        ))}
      </div>

      {/* Finish Day Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-bg-page)] border-t border-[var(--color-border-default)] shadow-lg z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="text-sm text-[var(--color-text-muted)]">
            {Object.keys(blockProgress).length} / {day.blocks.length} blocks completed
          </div>
          <Button
            onClick={onDayComplete}
            disabled={!isDayComplete}
            className="min-w-[150px]"
            style={{
              backgroundColor: isDayComplete ? 'var(--color-primary-default)' : 'var(--color-neutral-300)',
              color: 'var(--color-primary-on)'
            }}
          >
            Finish Day {day.dayNumber}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// BLOCK RENDERERS
// ----------------------------------------------------------------------------

function BlockRenderer({ block, isCompleted, onComplete }: { block: ProgramBlock, isCompleted: boolean, onComplete: (data: any) => void }) {
  const Icon = getBlockIcon(block.type);

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isCompleted ? "border-[var(--color-primary-default)] ring-1 ring-[var(--color-primary-default)] bg-[var(--color-bg-subtle)]" : ""
    )}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isCompleted ? "bg-[var(--color-primary-default)] text-white" : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
        )}>
          {isCompleted ? <CheckCircle size={20} /> : Icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase text-[var(--color-text-muted)]">
              {block.type.replace('_', ' ')}
            </span>
            {block.required && <span className="text-xs text-red-500">*Required</span>}
          </div>
          <CardTitle className="text-lg font-medium leading-tight mt-1">
            {block.title || "Untitled Block"}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <BlockContent block={block} isCompleted={isCompleted} onComplete={onComplete} />
      </CardContent>
    </Card>
  );
}

function BlockContent({ block, isCompleted, onComplete }: { block: ProgramBlock, isCompleted: boolean, onComplete: (data: any) => void }) {
  switch (block.type) {
    case 'lesson':
      return <LessonBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    case 'exercise':
      return <ExerciseBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    case 'journal':
      return <JournalBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    case 'checklist':
      return <ChecklistBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    case 'sleep_diary':
      return <SleepDiaryBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    case 'conclude':
      return <ConcludeBlockRenderer block={block} isCompleted={isCompleted} onComplete={onComplete} />;
    default:
      return <div>Unsupported block type: {(block as any).type}</div>;
  }
}

// --- Specific Renderers ---

function LessonBlockRenderer({ block, isCompleted, onComplete }: { block: any, isCompleted: boolean, onComplete: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none text-[var(--color-text-primary)]">
        {block.content.split('\n').map((line: string, i: number) => {
          if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.replace('## ', '')}</h3>;
          if (line.startsWith('### ')) return <h4 key={i} className="text-base font-medium mt-3 mb-1">{line.replace('### ', '')}</h4>;
          if (line.startsWith('**')) return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
          if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
          if (line === '') return <div key={i} className="h-2" />;
          return <p key={i} className="leading-relaxed">{line}</p>;
        })}
      </div>
      
      {!isCompleted && (
        <Button onClick={() => onComplete(true)} variant="outline" className="w-full mt-4">
          Mark as Read
        </Button>
      )}
    </div>
  );
}

function ExerciseBlockRenderer({ block, isCompleted, onComplete }: { block: ExerciseBlock, isCompleted: boolean, onComplete: (data: any) => void }) {
  const [value, setValue] = useState<any>(null);

  const handleSubmit = () => {
    onComplete(value);
  };

  if (block.exerciseType === 'mcq' || block.exerciseType === 'multi_select') {
    return (
      <div className="space-y-4">
        <p className="font-medium text-[var(--color-text-primary)]">{block.prompt}</p>
        
        {block.exerciseType === 'mcq' ? (
          <RadioGroup onValueChange={setValue} className="space-y-3">
            {block.options?.map(opt => (
              <div key={opt.id} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${block.id}-${opt.id}`} />
                <Label htmlFor={`${block.id}-${opt.id}`} className="font-normal cursor-pointer text-base">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {block.options?.map(opt => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${block.id}-${opt.id}`}
                  onCheckedChange={(checked) => {
                    setValue((prev: string[] = []) => checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value));
                  }}
                />
                <Label htmlFor={`${block.id}-${opt.id}`} className="font-normal cursor-pointer text-base">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {!isCompleted && (
          <Button onClick={handleSubmit} disabled={!value || (Array.isArray(value) && value.length === 0)} className="w-full mt-4">
            Complete Exercise
          </Button>
        )}
      </div>
    );
  }

  if (block.exerciseType === 'table') {
    return (
      <div className="space-y-4">
        <p className="font-medium text-[var(--color-text-primary)]">{block.prompt}</p>
        
        <div className="border rounded-md overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {block.columns?.map(col => (
                  <th key={col.id} className="px-3 py-2 text-left font-medium text-gray-500">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {block.rows?.map((row, i) => (
                <tr key={i} className="bg-gray-50/50">
                  {block.columns?.map(col => (
                    <td key={col.id} className="px-3 py-2 text-gray-600">{row[col.id]}</td>
                  ))}
                </tr>
              ))}
              {block.config?.editable && (
                <tr>
                  {block.columns?.map(col => (
                    <td key={col.id} className="px-3 py-2">
                      <Input placeholder="..." className="h-8 text-sm" />
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isCompleted && (
          <Button onClick={() => onComplete({ tableData: [] })} className="w-full mt-4">
            Save Entry
          </Button>
        )}
      </div>
    );
  }
  
  // New: List Type (if not checklist)
  if (block.exerciseType === 'list') {
      return (
          <div className="space-y-4">
              <p className="font-medium text-[var(--color-text-primary)]">{block.prompt}</p>
              <div className="space-y-2">
                  {block.options?.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                          <Checkbox id={`${block.id}-${opt.id}`} />
                          <Label htmlFor={`${block.id}-${opt.id}`}>{opt.label}</Label>
                      </div>
                  ))}
              </div>
              {!isCompleted && (
                <Button onClick={() => onComplete({ list: [] })} className="w-full mt-4">
                    Save List
                </Button>
              )}
          </div>
      )
  }

  return <div>Unknown exercise type</div>;
}

function ChecklistBlockRenderer({ block, isCompleted, onComplete }: { block: ChecklistBlock, isCompleted: boolean, onComplete: (data: any) => void }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      {block.title && <p className="font-medium text-[var(--color-text-primary)]">{block.title}</p>}
      <div className="space-y-3">
        {block.items.map(item => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:border-[var(--color-primary-default)] transition-colors">
            <Checkbox 
              id={`${block.id}-${item.id}`}
              checked={checkedItems[item.id] || false}
              onCheckedChange={(c) => setCheckedItems(prev => ({ ...prev, [item.id]: !!c }))}
            />
            <Label htmlFor={`${block.id}-${item.id}`} className="font-normal cursor-pointer flex-1">
              {item.text}
            </Label>
          </div>
        ))}
      </div>
      {!isCompleted && (
        <Button onClick={() => onComplete(checkedItems)} className="w-full mt-4">
          Save Checklist
        </Button>
      )}
    </div>
  );
}

function SleepDiaryBlockRenderer({ block, isCompleted, onComplete }: { block: SleepDiaryBlock, isCompleted: boolean, onComplete: (data: any) => void }) {
  const [data, setData] = useState({
    bedtime: '',
    latency: '',
    awakenings: '',
    wakeTime: '',
    quality: '',
    notes: ''
  });

  const handleChange = (field: string, val: string) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const isValid = data.bedtime && data.wakeTime && data.quality;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">Please record last night's sleep details.</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bedtime</Label>
          <div className="relative">
            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="time" 
              className="pl-8" 
              value={data.bedtime}
              onChange={e => handleChange('bedtime', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Wake Up Time</Label>
          <div className="relative">
            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="time" 
              className="pl-8"
              value={data.wakeTime}
              onChange={e => handleChange('wakeTime', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Time to fall asleep (min)</Label>
          <Input 
            type="number" 
            placeholder="e.g. 15"
            value={data.latency}
            onChange={e => handleChange('latency', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Woke up how many times?</Label>
          <Input 
            type="number" 
            placeholder="e.g. 1"
            value={data.awakenings}
            onChange={e => handleChange('awakenings', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sleep Quality</Label>
        <div className="flex justify-between gap-2">
          {['Very Poor', 'Poor', 'Fair', 'Good', 'Very Good'].map((q) => (
            <button
              key={q}
              onClick={() => handleChange('quality', q)}
              className={cn(
                "flex-1 py-2 text-xs rounded border transition-colors",
                data.quality === q 
                  ? "bg-[var(--color-primary-default)] text-white border-[var(--color-primary-default)]" 
                  : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea 
          placeholder="Any disturbances?" 
          className="h-20"
          value={data.notes}
          onChange={e => handleChange('notes', e.target.value)}
        />
      </div>

      {!isCompleted && (
        <Button onClick={() => onComplete(data)} disabled={!isValid} className="w-full mt-4">
          Save Sleep Diary
        </Button>
      )}
    </div>
  );
}

function JournalBlockRenderer({ block, isCompleted, onComplete }: { block: any, isCompleted: boolean, onComplete: (data: any) => void }) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-4">
      <p className="font-medium text-[var(--color-text-primary)]">{block.prompt}</p>
      <Textarea 
        placeholder="Start writing here..." 
        className="min-h-[150px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {block.isEphemeral && (
        <p className="text-xs text-[var(--color-text-muted)] italic">
          This entry will disappear in 48 hours to help you let go.
        </p>
      )}
      {!isCompleted && (
        <Button onClick={() => onComplete(text)} disabled={!text.trim()} className="w-full mt-4">
          Save Entry
        </Button>
      )}
    </div>
  );
}

function ConcludeBlockRenderer({ block, isCompleted, onComplete }: { block: any, isCompleted: boolean, onComplete: (data: any) => void }) {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <CheckCircle size={24} />
      </div>
      <h3 className="text-lg font-medium">Day Complete!</h3>
      <p className="text-[var(--color-text-muted)]">{block.message}</p>
      {!isCompleted && (
        <Button onClick={() => onComplete(true)} variant="outline" className="mt-4">
          I'm done for today
        </Button>
      )}
    </div>
  );
}

// Helper
function getBlockIcon(type: string) {
  switch (type) {
    case 'lesson': return <BookOpen size={20} />;
    case 'exercise': return <PenTool size={20} />;
    case 'journal': return <MessageCircle size={20} />;
    case 'checklist': return <List size={20} />;
    case 'sleep_diary': return <Moon size={20} />;
    case 'conclude': return <CheckCircle size={20} />;
    default: return <CheckCircle size={20} />;
  }
}

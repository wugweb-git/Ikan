import React from 'react';
import { Activity, ExerciseConfig } from '../../lib/equip-admin-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { Play, Pause, AlertCircle } from 'lucide-react';

interface BlockRendererProps {
  block: Activity;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export function BlockRenderer({ block, value, onChange, readOnly = false }: BlockRendererProps) {
  const { type, title, content, exerciseConfig } = block;

  // --- HELPERS ---
  const isVideo = block.image_url && (
    block.image_url.includes('youtube') || 
    block.image_url.includes('vimeo') || 
    block.image_url.endsWith('.mp4') || 
    block.image_url.endsWith('.webm')
  );

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // --- RENDERERS ---

  const renderMedia = () => {
    if (!block.image_url) return null;

    if (isVideo) {
      const embedUrl = getEmbedUrl(block.image_url);
      const isNative = block.image_url.endsWith('.mp4') || block.image_url.endsWith('.webm');

      return (
        <div className="rounded-xl overflow-hidden aspect-video bg-black mb-6 shadow-sm">
          {isNative ? (
            <video 
              src={block.image_url} 
              controls 
              className="w-full h-full"
            />
          ) : (
            <iframe 
              src={embedUrl} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 mb-6 shadow-sm">
        <img 
          src={block.image_url} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  };

  const renderLesson = () => {
    return (
      <div className="space-y-6">
        {renderMedia()}
        <div 
          className="prose prose-gray max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    );
  };

  const renderMCQ = (config: ExerciseConfig) => {
    const options = config.options || [];
    return (
      <RadioGroup 
        value={value as string} 
        onValueChange={readOnly ? undefined : onChange} 
        className="space-y-3"
        disabled={readOnly}
      >
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50">
            <RadioGroupItem value={option} id={`opt-${block.id}-${index}`} />
            <Label htmlFor={`opt-${block.id}-${index}`} className="flex-1 cursor-pointer font-normal text-base">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderMultiSelect = (config: ExerciseConfig) => {
    const options = config.options || [];
    const currentValues = Array.isArray(value) ? value : [];

    const toggleValue = (option: string) => {
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v: string) => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    };

    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => !readOnly && toggleValue(option)}
          >
            <Checkbox 
              checked={currentValues.includes(option)} 
              onCheckedChange={() => !readOnly && toggleValue(option)}
              id={`multi-${block.id}-${index}`}
              disabled={readOnly}
            />
            <Label htmlFor={`multi-${block.id}-${index}`} className="flex-1 cursor-pointer font-normal text-base">
              {option}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  const renderChecklist = (config: ExerciseConfig) => {
    // Similar to MultiSelect but presentation might differ (e.g. strikethrough)
    // For now reusing logic but using config.listItems
    const items = config.listItems || config.options || [];
    const currentValues = Array.isArray(value) ? value : [];

    const toggleValue = (item: string) => {
      if (currentValues.includes(item)) {
        onChange(currentValues.filter((v: string) => v !== item));
      } else {
        onChange([...currentValues, item]);
      }
    };

    return (
      <div className="space-y-2">
        {items.map((item, index) => {
          const isChecked = currentValues.includes(item);
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer",
                isChecked ? "bg-green-50 text-gray-500" : "bg-gray-50"
              )}
              onClick={() => !readOnly && toggleValue(item)}
            >
              <Checkbox 
                checked={isChecked} 
                onCheckedChange={() => !readOnly && toggleValue(item)}
                id={`check-${block.id}-${index}`}
                disabled={readOnly}
              />
              <Label 
                htmlFor={`check-${block.id}-${index}`} 
                className={cn(
                  "flex-1 cursor-pointer font-normal text-base",
                  isChecked && "line-through opacity-70"
                )}
              >
                {item}
              </Label>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTextResponse = (config: ExerciseConfig) => {
    return (
      <div className="space-y-2">
        <Textarea 
          placeholder={config.prompt || "Type your answer here..."}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          disabled={readOnly}
          className="text-base p-4 resize-none"
        />
        {config.maxEntries && (
          <p className="text-xs text-gray-400 text-right">
            {(value || '').length} / {config.maxEntries} characters
          </p>
        )}
      </div>
    );
  };

  const renderSleepDiary = () => {
    // Sleep Diary is a composite block
    // We expect value to be { bedTime: string, wakeTime: string, quality: number }
    const diaryData = value || { bedTime: '', wakeTime: '', quality: 3 };
    
    return (
       <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Bed Time</Label>
               <Input 
                 type="time" 
                 value={diaryData.bedTime} 
                 onChange={e => onChange({ ...diaryData, bedTime: e.target.value })}
                 disabled={readOnly}
               />
             </div>
             <div className="space-y-2">
               <Label>Wake Time</Label>
               <Input 
                 type="time" 
                 value={diaryData.wakeTime} 
                 onChange={e => onChange({ ...diaryData, wakeTime: e.target.value })}
                 disabled={readOnly}
               />
             </div>
          </div>
          
          <div className="space-y-3">
             <Label>Sleep Quality (1-5)</Label>
             <div className="flex justify-between gap-2">
               {[1, 2, 3, 4, 5].map(num => (
                 <button
                   key={num}
                   onClick={() => !readOnly && onChange({ ...diaryData, quality: num })}
                   className={cn(
                     "flex-1 h-12 rounded-lg border flex items-center justify-center font-bold transition-all",
                     diaryData.quality === num 
                       ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                       : "bg-white text-gray-600 hover:bg-gray-50"
                   )}
                 >
                   {num}
                 </button>
               ))}
             </div>
             <div className="flex justify-between text-xs text-gray-400 px-1">
               <span>Poor</span>
               <span>Excellent</span>
             </div>
          </div>
       </div>
    );
  };

  const renderClinicalInstrument = (config: ExerciseConfig) => {
    // Table of questions with same scale
    const questions = config.questions || [];
    const scale = config.scale || [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half', value: 2 },
      { label: 'Nearly every day', value: 3 }
    ];

    const currentAnswers = value || {}; // Record<questionIndex, value>

    return (
      <div className="space-y-8">
         {questions.map((question, qIdx) => (
           <div key={qIdx} className="space-y-3 pb-6 border-b last:border-0">
             <h3 className="font-medium text-gray-900">{question}</h3>
             <RadioGroup
                value={currentAnswers[qIdx]?.toString()}
                onValueChange={(val) => {
                   onChange({ ...currentAnswers, [qIdx]: parseInt(val) });
                }}
                disabled={readOnly}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2"
             >
                {scale.map((opt, optIdx) => (
                  <div key={optIdx} className="relative">
                    <RadioGroupItem 
                      value={opt.value.toString()} 
                      id={`q${qIdx}-opt${optIdx}`} 
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`q${qIdx}-opt${optIdx}`}
                      className="flex items-center justify-center w-full p-3 text-sm font-medium text-gray-500 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-600"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
             </RadioGroup>
           </div>
         ))}
      </div>
    );
  };

  // --- DISPATCHER ---

  const renderContent = () => {
    // Specific block type handlers
    if (type === 'sleep_diary') {
      return renderSleepDiary();
    }

    if (type === 'lesson' || type === 'conclude') {
      return renderLesson();
    }

    // Interactive types via Exercise Config
    const config = exerciseConfig || {};
    
    if (config.subtype === 'clinical_instrument') {
      return renderClinicalInstrument(config);
    }
    if (config.subtype === 'mcq' || config.subtype === 'single-select') {
      return renderMCQ(config);
    }
    if (config.subtype === 'multi-select') {
      return renderMultiSelect(config);
    }
    if (config.subtype === 'structured-list' || type === 'checklist') {
      return renderChecklist(config);
    }
    if (type === 'journal' || type === 'reflection' || config.subtype === 'ephemeral-journal') {
      return renderTextResponse(config);
    }
    
    // Fallback for exercises without specific subtype (default to text if prompt exists, else lesson-like)
    if (type === 'exercise') {
      if (config.options?.length) return renderMCQ(config);
      return renderTextResponse(config);
    }

    // Fallback: render content as lesson
    return renderLesson();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* Optional: Block Header/Title if not embedded in content */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
            {type.replace('_', ' ')}
          </Badge>
          {block.stepGroup && (
             <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">
               Step: {block.stepGroup}
             </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {title}
        </h2>
        {exerciseConfig?.prompt && (
          <p className="text-lg text-gray-600 font-medium">
            {exerciseConfig.prompt}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
}

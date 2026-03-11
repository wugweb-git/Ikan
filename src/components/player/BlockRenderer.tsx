import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Activity, ExerciseConfig } from '../../lib/equip-admin-types';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../ui/utils';

interface BlockRendererProps {
  block: Activity;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export function BlockRenderer({ block, value, onChange, readOnly = false }: BlockRendererProps) {
  const { type, title, subtitle, content, exerciseConfig } = block;

  // --- HELPERS ---
  const cleanOptionLabel = (text: string) => {
    // Strips "0 - ", "1 - " prefixes used for scoring
    return text.replace(/^\d+\s*-\s*/, '');
  };

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
        <div className="rounded-2xl overflow-hidden aspect-video bg-black mb-8 shadow-sm">
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
      <div className="rounded-2xl overflow-hidden aspect-video mb-8 shadow-sm" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
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
      <div className="space-y-8 py-2 md:py-6">
        {renderMedia()}
        
        {/* Enhanced Lesson Typography */}
        <div className="relative">
          {/* Decorative side line to add visual interest */}
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[var(--color-primary-default)] to-transparent opacity-10 rounded-full hidden md:block" />
          
          <div 
            className="prose prose-lg md:prose-xl max-w-none text-[var(--color-text-primary)] md:pl-6"
          >
             {/* Inject custom styles for this block content */}
             <style>{`
               .lesson-content h3 { 
                  font-size: 1.75rem; 
                  font-weight: 500; 
                  letter-spacing: -0.02em; 
                  margin-bottom: 1rem; 
                  margin-top: 0;
                  color: var(--color-text-primary); 
                }
                .lesson-content p { 
                  font-size: 1.125rem; 
                  line-height: 1.7; 
                  color: var(--grey-8); 
                  margin-bottom: 1.5rem; 
                }
                .lesson-content strong { 
                  font-weight: 500; 
                  color: var(--color-text-primary); 
                }
               .lesson-content ul {
                 list-style-type: disc;
                 padding-left: 1.5rem;
                 margin-bottom: 1.5rem;
               }
               .lesson-content li { 
                 margin-bottom: 0.5rem;
                 color: var(--grey-8);
               }
             `}</style>
             <div className="lesson-content" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>

        {/* If it's a very short lesson, add a placeholder visual if no image exists */}
        {!block.image_url && content.length < 200 && (
           <div className="flex justify-center opacity-50 py-8">
              <div className="w-16 h-1 bg-[var(--color-primary-default)] rounded-full" />
           </div>
        )}
      </div>
    );
  };

  const renderMCQ = (config: ExerciseConfig) => {
    const options = config.options || [];
    
    if (options.length === 0) {
      return (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' }}>
          No options provided for this question.
        </div>
      );
    }

    return (
      <RadioGroup 
        value={(value as string) || ""} 
        onValueChange={readOnly ? undefined : onChange} 
        className="space-y-3"
        disabled={readOnly}
      >
        {options.map((option, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
             <RadioGroupItem 
               value={option} 
               id={`opt-${block.id}-${index}`} 
               className="peer sr-only" 
             />
             <Label 
               htmlFor={`opt-${block.id}-${index}`} 
               className="
                 flex items-center w-full p-5 min-h-[64px]
                 bg-white border-2 border-transparent 
                 cursor-pointer transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]
                 text-[17px] text-[var(--color-text-primary)] font-medium
                 hover:bg-[var(--color-bg-muted)] hover:scale-[1.01]
                 peer-data-[state=checked]:border-[var(--color-primary-default)] peer-data-[state=checked]:bg-[var(--color-bg-input)] peer-data-[state=checked]:shadow-md
                 active:scale-[0.99]
               "
               style={{ borderRadius: 'var(--radius-lg)' }}
             >
               <div className="w-5 h-5 rounded-full border-2 border-[var(--grey-2)] mr-4 flex items-center justify-center peer-data-[state=checked]:border-[var(--color-primary-default)] transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-default)] opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
               </div>
               {cleanOptionLabel(option)}
             </Label>
          </motion.div>
        ))}
      </RadioGroup>
    );
  };

  const renderMultiSelect = (config: ExerciseConfig) => {
    const options = config.options || [];
    const currentValues = Array.isArray(value) ? value : [];

    if (options.length === 0) {
      return (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' }}>
          No options provided for this question.
        </div>
      );
    }

    const toggleValue = (option: string) => {
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v: string) => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    };

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const isChecked = currentValues.includes(option);
          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center space-x-3 p-5 transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-2",
                isChecked 
                  ? "bg-[var(--color-bg-input)] border-[var(--color-primary-default)] shadow-md" 
                  : "bg-white border-transparent hover:bg-[var(--color-bg-muted)]"
              )}
              style={{ borderRadius: 'var(--radius-lg)' }}
              onClick={() => !readOnly && toggleValue(option)}
            >
              <Checkbox 
                checked={isChecked} 
                onCheckedChange={() => !readOnly && toggleValue(option)}
                id={`multi-${block.id}-${index}`}
                disabled={readOnly}
                className="w-5 h-5 rounded-[6px] border-2 border-[var(--grey-2)] data-[state=checked]:bg-[var(--color-primary-default)] data-[state=checked]:border-[var(--color-primary-default)]"
              />
              <Label htmlFor={`multi-${block.id}-${index}`} className="flex-1 cursor-pointer font-medium text-[17px] text-[var(--color-text-primary)]">
                {cleanOptionLabel(option)}
              </Label>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderChecklist = (config: ExerciseConfig) => {
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
      <div className="space-y-3">
        {items.map((item, index) => {
          const isChecked = currentValues.includes(item);
          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center space-x-4 p-4 transition-all cursor-pointer",
                isChecked ? "bg-[var(--color-status-success-light)]" : "bg-transparent hover:bg-[var(--color-bg-muted)]"
              )}
              style={{ borderRadius: 'var(--radius-md)' }}
              onClick={() => !readOnly && toggleValue(item)}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isChecked ? "text-white" : ""
              )}
              style={isChecked ? { borderColor: 'var(--color-status-success)', backgroundColor: 'var(--color-status-success)' } : { borderColor: 'var(--color-border-default)' }}
              >
                 {isChecked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <Label 
                htmlFor={`check-${block.id}-${index}`} 
                className={cn(
                  "flex-1 cursor-pointer text-[17px] font-medium transition-all",
                  isChecked ? "line-through" : "text-[var(--color-text-primary)]"
                )}
                style={isChecked ? { color: 'var(--color-text-muted)', textDecorationColor: 'var(--color-text-muted)' } : undefined}
              >
                {cleanOptionLabel(item)}
              </Label>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderTextResponse = (config: ExerciseConfig) => {
    return (
      <div className="space-y-3">
        <Textarea 
          placeholder={config.prompt || "Share your thoughts here..."}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          disabled={readOnly}
          className="
             text-[17px] p-6 resize-none rounded-[20px] 
             border-0 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]
             focus:ring-2 focus:ring-[var(--color-primary-default)] focus:shadow-lg
             placeholder:text-[var(--grey-4)] leading-relaxed
             transition-all
          "
        />
        {config.maxEntries && (
          <p className="text-[13px] text-[var(--grey-5)] text-right font-medium">
            {(value || '').length} / {config.maxEntries}
          </p>
        )}
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
      <div className="space-y-10">
         {questions.map((question, qIdx) => (
           <motion.div 
             key={qIdx} 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="space-y-4 bg-white p-6 rounded-[20px] shadow-sm"
            >
             <h3 className="font-medium text-[var(--color-text-primary)] text-[17px] leading-relaxed">{question}</h3>
             <RadioGroup
                value={currentAnswers[qIdx]?.toString() || ""}
                onValueChange={(val) => {
                   onChange({ ...currentAnswers, [qIdx]: parseInt(val) });
                }}
                disabled={readOnly}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
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
                      className="
                        flex items-center justify-center w-full p-3 min-h-[48px]
                        text-[15px] font-medium text-[var(--color-text-primary)]
                        bg-[var(--color-bg-input)] border border-transparent
                        cursor-pointer transition-all
                        hover:bg-[var(--color-bg-muted)]
                        peer-data-[state=checked]:bg-[var(--color-primary-default)] peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-md
                      "
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
             </RadioGroup>
           </motion.div>
         ))}
      </div>
    );
  };

  const renderTableChecklist = (config: ExerciseConfig) => {
    const columns = config.columns || [];
    const rows = config.rows || ['Status']; // Default to single row if none provided
    const currentValues = value || {}; // Record<"row::col", boolean>

    const toggleCell = (row: string, col: string) => {
       if (readOnly) return;
       const key = `${row}::${col}`;
       onChange({
         ...currentValues,
         [key]: !currentValues[key]
       });
    };

    return (
      <div className="border overflow-hidden bg-white shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--color-bg-input)]">
              <TableRow>
                <TableHead className="w-[180px] font-medium text-[var(--color-text-primary)] min-w-[150px]">Activity</TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="text-center font-medium text-[var(--color-text-primary)] min-w-[80px]">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rIdx) => (
                <TableRow key={row} className="hover:bg-transparent">
                  <TableCell className="font-medium text-[var(--color-text-primary)]">
                    {row}
                  </TableCell>
                  {columns.map((col, cIdx) => {
                    const key = `${row}::${col}`;
                    const isChecked = !!currentValues[key];
                    
                    return (
                      <TableCell key={col} className="text-center p-0">
                         <div 
                           className="flex items-center justify-center w-full h-full py-4 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
                           onClick={() => toggleCell(row, col)}
                         >
                           <Checkbox 
                             checked={isChecked}
                             onCheckedChange={() => toggleCell(row, col)}
                             disabled={readOnly}
                             className="w-6 h-6 rounded-[6px] border-2 border-[var(--grey-2)] data-[state=checked]:bg-[var(--color-primary-default)] data-[state=checked]:border-[var(--color-primary-default)]"
                           />
                         </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderInputTable = (config: ExerciseConfig) => {
    const columns = config.columns || ['Entry'];
    const currentRows = Array.isArray(value) ? value : [{}]; // Array of row objects

    const updateCell = (rowIndex: number, col: string, val: string) => {
      const newRows = [...currentRows];
      if (!newRows[rowIndex]) newRows[rowIndex] = {};
      newRows[rowIndex] = { ...newRows[rowIndex], [col]: val };
      onChange(newRows);
    };

    const addRow = () => {
      onChange([...currentRows, {}]);
    };

    const renderCellContent = (col: string, row: any, rIdx: number) => {
      const lowerCol = col.toLowerCase();
      const value = row[col] || '';

      // Check for specific column types based on header
      if (lowerCol.includes('(yes/no)') || lowerCol.includes('can use device')) {
        return (
          <div className="flex items-center justify-center h-[60px]">
            <div className="flex items-center space-x-2">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  value === 'Yes' 
                    ? "bg-[var(--color-primary-default)] text-white border-[var(--color-primary-default)]" 
                    : "bg-white text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)]"
                )}
                onClick={() => updateCell(rIdx, col, 'Yes')}
              >
                Yes
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  value === 'No' 
                    ? "bg-[var(--color-primary-default)] text-white border-[var(--color-primary-default)]" 
                    : "bg-white text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)]"
                )}
                onClick={() => updateCell(rIdx, col, 'No')}
              >
                No
              </button>
            </div>
          </div>
        );
      }

      if (lowerCol.includes('(yes, no, na)') || lowerCol.includes('did it affect my sleep')) {
        return (
          <Select value={value} onValueChange={(val) => updateCell(rIdx, col, val)}>
            <SelectTrigger className="w-full h-[60px] focus:bg-white" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-default)' }}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
            </SelectContent>
          </Select>
        );
      }

      if (lowerCol.includes('date')) {
        return (
          <Input
             type="date"
             value={value}
             onChange={(e) => updateCell(rIdx, col, e.target.value)}
             className="h-[60px] text-[15px]"
             style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-input)' }}
          />
        );
      }

      if (lowerCol.includes('time')) {
        return (
           <Input
             type="time"
             value={value}
             onChange={(e) => updateCell(rIdx, col, e.target.value)}
             className="h-[60px] text-[15px]"
             style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-input)' }}
          />
        );
      }

      return (
        <Textarea
          value={value}
          onChange={(e) => updateCell(rIdx, col, e.target.value)}
          placeholder="..."
          disabled={readOnly}
          rows={2}
          className="min-h-[60px] resize-none focus:bg-white transition-colors text-[15px] pt-4"
          style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-input)' }}
        />
      );
    };

    return (
      <div className="space-y-4">
        <div className="border overflow-hidden bg-white shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--color-bg-input)]">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="font-medium text-[var(--color-text-primary)] min-w-[150px] whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRows.map((row: any, rIdx: number) => (
                  <TableRow key={rIdx} className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableCell key={col} className="p-2 align-top">
                        {renderCellContent(col, row, rIdx)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {!readOnly && (
          <Button 
            variant="outline" 
            onClick={addRow}
            className="w-full border-dashed border-2 h-12 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)]"
          >
            + Add Entry
          </Button>
        )}
      </div>
    );
  };

  const renderRatingScale = (config: ExerciseConfig) => {
    // Default to 1-5
    const max = config.scale?.length || 5;
    const range = Array.from({ length: max }, (_, i) => i + 1);
    
    // Labels
    const minLabel = config.scale?.[0]?.label || 'Not at all';
    const maxLabel = config.scale?.[config.scale.length - 1]?.label || 'Very much';

    return (
      <div className="space-y-4 py-4">
         <div className="flex flex-wrap gap-3 justify-center">
           {range.map(num => (
             <button
               key={num}
               onClick={() => !readOnly && onChange(num)}
               className={cn(
                 "w-12 h-14 flex items-center justify-center font-medium text-xl transition-all shadow-sm",
                 value === num 
                   ? "bg-[var(--color-primary-default)] text-white scale-110 shadow-lg ring-4 ring-[var(--color-primary-default)]/10"
                   : "bg-white text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)] hover:scale-105"
               )}
               style={{ borderRadius: 'var(--radius-lg)' }}
               disabled={readOnly}
             >
               {num}
             </button>
           ))}
         </div>
         <div className="flex justify-between text-[13px] font-medium text-[var(--color-text-muted)] px-4">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
         </div>
      </div>
    );
  };

  // --- DISPATCHER ---

  const renderContent = () => {
    // Specific block type handlers
    if (type === 'lesson' || type === 'conclude') {
      return renderLesson();
    }

    // Interactive types via Exercise Config
    const config = exerciseConfig || {};
    
    if (config.subtype === 'clinical_instrument') {
      return renderClinicalInstrument(config);
    }
    if (config.subtype === 'rating_scale' || config.subtype === 'likert') {
      return renderRatingScale(config);
    }
    if (config.subtype === 'table') {
      return renderTableChecklist(config);
    }
    if (config.subtype === 'input-table' || config.subtype === 'comparison_matrix') {
      return renderInputTable(config);
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

    // Fix: If options exist, render as MCQ even if labeled as journal/ephemeral
    // This handles data inconsistencies where subtype is 'ephemeral-journal' but has options
    if ((config.options && config.options.length > 0) && (type === 'journal' || config.subtype === 'ephemeral-journal')) {
      return renderMCQ(config);
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

  // Determine if we show a separate prompt text
  // If title is generic "Exercise" or "Question", we force prompt visibility if it exists
  // If title looks like the question (length > 20), we assume title IS the question
  const isGenericTitle = ['exercise', 'question', 'reflection', 'journal', 'assessment'].includes((title || '').toLowerCase());
  const showPrompt = exerciseConfig?.prompt && (isGenericTitle || exerciseConfig.prompt !== title);

  // If title is missing/empty, use prompt as title
  const displayTitle = title || exerciseConfig?.prompt || 'Question';
  // If we promoted prompt to title, don't show prompt again
  const finalShowPrompt = showPrompt && displayTitle !== exerciseConfig?.prompt;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Block Header/Title */}
      <div className="mb-6 space-y-3 text-left">
        <div className="flex items-center gap-2">
          {/* Badge: QUESTION */}
          {(type === 'exercise' || type === 'clinical_instrument') && (
            <span className="text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
               Question
            </span>
          )}
          {block.stepGroup && (
             <span className="px-2 py-0.5 rounded-[4px] bg-[var(--color-bg-input)] text-[13px] font-medium text-[var(--color-text-muted)]">
               {block.stepGroup}
             </span>
          )}
        </div>
        
        {/* Title - The main question text */}
        <h2 className="text-[22px] md:text-[26px] font-medium text-[var(--color-text-primary)] leading-snug tracking-tight">
          {displayTitle}
        </h2>

        {/* Subtitle - Always visible when present */}
        {subtitle && (
          <p className="text-[15px] md:text-[17px] text-[var(--grey-6)] font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
        
        {/* Prompt/Description - Only if different from title */}
        {finalShowPrompt && (
          <p className="text-[17px] text-[var(--grey-6)] font-normal leading-relaxed">
            {exerciseConfig.prompt}
          </p>
        )}
      </div>

      {/* Content Area */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
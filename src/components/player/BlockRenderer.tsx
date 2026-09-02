import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, ExerciseConfig, resolveInteraction } from '../../lib/equip-admin-types';
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
  equipId?: string;
  dayNum?: number;
  /** Carry-forward: this block's responses from earlier days (for repeated blocks). */
  priorEntries?: { day: number; response: any }[];
}

// Render a saved response compactly for the read-only running log.
function summarizePriorResponse(response: any): string {
  if (response == null) return '';
  if (typeof response === 'string') return response;
  if (typeof response === 'number' || typeof response === 'boolean') return String(response);
  if (Array.isArray(response)) {
    // Table rows like [{ Question, Response }] → "Question: Response" lines
    return response
      .map((row) => (row && typeof row === 'object'
        ? Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' · ')
        : String(row)))
      .filter(Boolean)
      .join('\n');
  }
  if (typeof response === 'object') {
    return Object.entries(response).map(([k, v]) => `${k}: ${v}`).join(' · ');
  }
  return String(response);
}

export function BlockRenderer({ block, value, onChange, readOnly = false, equipId, dayNum, priorEntries }: BlockRendererProps) {
  const { type, title, subtitle, content, exerciseConfig } = block;

  // --- Upload state (hoisted to top level to comply with Rules of Hooks) ---
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPERS ---
  const cleanOptionLabel = (text: string) => {
    // Strips leading prefixes that aren't part of the answer text:
    //  - "0 - ", "1 - " scoring prefixes, and "1. " / "2) " list markers
    //  - bare index prefixes like "1 0-15 minutes" -> "0-15 minutes"
    // The marker forms require trailing whitespace so decimals (e.g. "1.5 hours") are preserved.
    return text
      .replace(/^\s*\d+\s*[-.)]\s+/, '')
      .replace(/^\s*\d+\s+(?=\S)/, '');
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
               /* Strip any rogue backgrounds from rich-text-editor wrappers (div, section, etc.)
                  so closing notes don't get an unexpected grey box. */
               .lesson-content > *:not(blockquote) {
                 background-color: transparent;
                 font-family: var(--font-family-base);
               }
               .lesson-content > div,
               .lesson-content > section,
               .lesson-content > figure {
                 font-size: 1.125rem;
                 line-height: 1.7;
                 color: var(--grey-8);
                 margin-bottom: 1.5rem;
               }
               /* Intentional blockquote styling */
               .lesson-content blockquote {
                 font-size: 1.125rem;
                 line-height: 1.7;
                 font-style: normal;
                 font-weight: 400;
                 color: var(--grey-8);
                 background: var(--color-bg-muted);
                 border-left: 3px solid var(--color-border-default);
                 border-radius: 8px;
                 padding: 1rem 1.25rem;
                 margin-bottom: 1.5rem;
               }
               .lesson-content blockquote p {
                 margin-bottom: 0;
                 color: var(--grey-8);
               }
               .lesson-content blockquote p + p {
                 margin-top: 0.75rem;
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
            // FIXED 2026-09-01 (a11y). This row was a motion.div with onClick, a
            // styled <div> standing in for the checkbox, and a <Label htmlFor=
            // "check-..."> pointing at an id that did not exist. There was no
            // input element at all, so the control was unreachable by keyboard
            // and announced nothing to a screen reader — a checklist exercise
            // simply could not be completed without a mouse.
            //
            // Now uses the same real <Checkbox> + matching id the multi-select
            // block above already uses, keeping the round tick and strike-through
            // styling. The row's onClick is retained for the click-anywhere
            // affordance; it is idempotent with onCheckedChange because both
            // derive from the same currentValues snapshot within one event.
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
              <Checkbox
                id={`check-${block.id}-${index}`}
                checked={isChecked}
                onCheckedChange={() => !readOnly && toggleValue(item)}
                disabled={readOnly}
                className={cn(
                  "w-6 h-6 rounded-full border-2 shrink-0",
                  "data-[state=checked]:bg-[var(--color-status-success)]",
                  "data-[state=checked]:border-[var(--color-status-success)]",
                  "data-[state=checked]:text-white",
                  "border-[var(--color-border-default)]"
                )}
              />
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
    // Predefined row labels (e.g. the Sleep Diary questions). When present, the
    // FIRST column becomes a read-only "row heading" and only the remaining
    // columns are editable — this is what makes the question labels visible.
    const predefinedRows = Array.isArray(config.rows) ? config.rows.filter(Boolean) : [];
    const hasPredefinedRows = predefinedRows.length > 0;
    const labelCol = columns[0];

    const savedRows: any[] = Array.isArray(value) ? value : [];
    const currentRows = hasPredefinedRows
      ? predefinedRows.map((label, i) => ({ ...(savedRows[i] || {}), [labelCol]: label }))
      : (savedRows.length ? savedRows : [{}]); // Array of row objects

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

      // Read-only row heading: the predefined question label in the first column.
      if (hasPredefinedRows && col === labelCol) {
        return (
          <div className="min-h-[60px] flex items-start pt-3 pr-2">
            <span className="text-[15px] font-medium text-[var(--color-text-primary)] leading-relaxed">
              {predefinedRows[rIdx] ?? value}
            </span>
          </div>
        );
      }

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
          placeholder={`Type your ${col.toLowerCase()}…`}
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
        {!readOnly && !hasPredefinedRows && (
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

  const renderFileUpload = (config: ExerciseConfig) => {
    const accepted = config.acceptedFileTypes || ['image/*', '.pdf', '.doc', '.docx', 'audio/*'];
    const maxSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB default

    const currentFile = value as { fileName?: string; signedUrl?: string; fileSize?: number } | null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > maxSize) {
        setUploadError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
        return;
      }

      setUploadError(null);
      setUploading(true);

      try {
        // Use props passed from ProgramPlayer
        const resolvedEquipId = equipId || 'unknown';
        const resolvedDayNum = dayNum || 0;

        const { apiClient } = await import('../../lib/api-client');
        const result = await apiClient.uploadBlockFile(resolvedEquipId, resolvedDayNum, block.id, file);

        if (result?.success) {
          onChange({
            fileName: result.fileName,
            fileSize: result.fileSize,
            signedUrl: result.signedUrl,
          });
        } else {
          setUploadError(result?.error || 'Upload failed. Please try again.');
        }
      } catch (err: any) {
        console.error('File upload error:', err);
        setUploadError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accepted.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={readOnly || uploading}
        />

        {currentFile?.fileName ? (
          /* File already uploaded */
          <div
            className="flex items-center gap-4 p-5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-status-success-light)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-[var(--color-text-primary)] truncate">
                {currentFile.fileName}
              </p>
              {currentFile.fileSize && (
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  {formatSize(currentFile.fileSize)}
                </p>
              )}
            </div>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                Replace
              </Button>
            )}
          </div>
        ) : (
          /* Upload area */
          <button
            onClick={() => !readOnly && !uploading && fileInputRef.current?.click()}
            disabled={readOnly || uploading}
            className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed transition-all"
            style={{
              borderRadius: 'var(--radius-lg)',
              borderColor: uploading ? 'var(--color-primary-default)' : 'var(--color-border-default)',
              backgroundColor: uploading ? 'color-mix(in srgb, var(--color-primary-default) 4%, white)' : 'white',
              cursor: readOnly ? 'default' : uploading ? 'wait' : 'pointer',
            }}
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-[var(--color-primary-default)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[15px] font-medium text-[var(--color-primary-default)]">Uploading...</span>
              </>
            ) : (
              <>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
                    Tap to upload a file
                  </p>
                  <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
                    Max {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              </>
            )}
          </button>
        )}

        {uploadError && (
          <div
            className="flex items-center gap-2 p-3 text-[13px] font-medium"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-status-danger-light)',
              color: 'var(--color-status-danger)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {uploadError}
          </div>
        )}
      </div>
    );
  };

  // --- DISPATCHER ---

  const renderContent = () => {
    // Use the unified interaction taxonomy for dispatch
    const interaction = resolveInteraction(block);
    const config = exerciseConfig || {};

    switch (interaction) {
      case 'read':
      case 'complete':
      case 'watch':
        return renderLesson();

      case 'clinical':
        return renderClinicalInstrument(config);

      case 'rate':
        return renderRatingScale(config);

      case 'track-table':
        return renderTableChecklist(config);

      case 'input-table':
        return renderInputTable(config);

      case 'select-one':
        return renderMCQ(config);

      case 'select-many':
        return renderMultiSelect(config);

      case 'check':
        return renderChecklist(config);

      case 'write':
        return renderTextResponse(config);

      case 'upload':
        return renderFileUpload(config);

      default:
        // Final fallback: render as lesson
        return renderLesson();
    }
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
        {/* NOTE: stepGroup (e.g. "onboarding_core", "baseline_sleep") is internal
            authoring metadata used for grouping in ProgramPlayer — never shown to users.
            The "Question" badge that used to render here duplicated the title below and
            was removed. */}

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

      {/* Carry-forward: read-only running log of this block's earlier-day entries */}
      {priorEntries && priorEntries.length > 0 &&
       (block.repeat?.type === 'simple_repeat' || block.repeat?.type === 'column_addition') && (
        <div className="mb-5 rounded-[12px] border" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-input)' }}>
          <div className="px-4 pt-3 pb-2 text-[13px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Previous entries
          </div>
          <div className="px-4 pb-3 space-y-3">
            {priorEntries.map((e) => (
              <div key={e.day} className="text-[14px]">
                <div className="font-medium text-[var(--color-text-primary)]">Day {e.day}</div>
                <div className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--grey-6)' }}>
                  {summarizePriorResponse(e.response)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
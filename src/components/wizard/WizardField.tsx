import React from 'react';
import { WizardFieldConfig, WizardMode } from './types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { Plus, Trash2, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface WizardFieldProps {
  field: WizardFieldConfig;
  value: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
  error?: string;
  wizardMode?: WizardMode; // NEW: Context for defaults
}

export function WizardField({ field, value, onChange, onAutoAdvance, error, wizardMode }: WizardFieldProps) {
  const { id, type, label, helpText, description, placeholder, options, validation, uiHints, media, duration } = field;

  // Helper to handle undefined values
  const safeValue = value ?? '';
  
  // Resolve Display Style
  // 1. Explicit displayStyle config
  // 2. Legacy uiHints
  // 3. Defaults: Assessment -> Cards, Onboarding -> Inline
  const effectiveStyle = field.displayStyle || (
      uiHints?.includes('cards') ? 'cards' :
      uiHints?.includes('inline') ? 'inline' :
      (wizardMode === 'assessment' ? 'cards' : 'inline')
  );

  const isCards = effectiveStyle === 'cards';
  const isInline = effectiveStyle === 'inline';

  const renderField = () => {
    switch (type) {
      case 'scale':
         const min = validation?.min || 0;
         const max = validation?.max || 10;
         // Generate numbers range
         const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
         
         return (
            <div className="space-y-[var(--spacing-6)]">
              <div className="flex flex-wrap justify-center gap-[var(--spacing-3)]">
                {numbers.map((num, index) => {
                  const isSelected = safeValue === num;
                  
                  return (
                    <motion.button
                      key={num}
                      onClick={() => {
                        onChange(num);
                        if (field.autoAdvance && onAutoAdvance) {
                          setTimeout(onAutoAdvance, 300);
                        }
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: 'spring' }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-full font-medium transition-all flex items-center justify-center",
                        isSelected
                          ? "bg-[var(--color-primary-default)] text-white shadow-lg scale-110"
                          : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:bg-[var(--color-accent-default)]"
                      )}
                    >
                      {num}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Optional Labels if passed via options or logic - relying on implicit or options for now */}
              {options && options.length >= 2 && (
                 <div className="flex justify-between text-sm text-[var(--color-text-muted)] px-2">
                    <span>{options[0].label}</span>
                    <span>{options[options.length-1].label}</span>
                 </div>
              )}
            </div>
         );

      case 'text':
      case 'number':
      case 'time':
        return (
          <Input
            id={id}
            type={type === 'text' ? 'text' : type}
            placeholder={placeholder}
            value={safeValue}
            onChange={(e) => {
               const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
               onChange(isNaN(val as number) && type === 'number' ? '' : val);
            }}
            className={cn(
              "bg-[var(--color-bg-input)] border-[var(--color-border-default)] rounded-[var(--radius-md)]",
              "focus:ring-2 focus:ring-[var(--color-primary-default)] focus:border-[var(--color-primary-default)]",
              "h-11 px-[var(--spacing-4)]",
              error && "border-[var(--color-status-danger)]"
            )}
          />
        );
      
      case 'long_text':
        return (
          <Textarea
            id={id}
            placeholder={placeholder}
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "bg-[var(--color-bg-input)] border-[var(--color-border-default)] rounded-[var(--radius-md)]",
              "focus:ring-2 focus:ring-[var(--color-primary-default)] focus:border-[var(--color-primary-default)]",
              "min-h-[120px] p-[var(--spacing-4)]",
              error && "border-[var(--color-status-danger)]"
            )}
          />
        );

      case 'boolean':
      case 'single_select':
        if (isCards) {
           return (
             <div className="flex flex-col gap-[var(--spacing-3)] max-w-[640px] mx-auto w-full">
               {options?.map((opt) => {
                 const isSelected = safeValue?.toString() === opt.value?.toString();
                 return (
                   <div 
                     key={opt.id}
                     onClick={() => {
                        onChange(opt.value);
                        if (field.autoAdvance && onAutoAdvance) {
                            setTimeout(onAutoAdvance, 350); // Slight delay for visual feedback
                        }
                     }}
                     className={cn(
                       "cursor-pointer rounded-[16px] transition-all p-[20px] flex items-center",
                       "min-h-[64px]", // Taller touch target
                       isSelected 
                         ? "border-2 border-[#1A1A1A] bg-[#FFFFFF]" 
                         : "border border-[#E4E4E4] bg-[#F5F5F5] hover:bg-[#FFFFFF] hover:border-[#D9D9D9]"
                     )}
                   >
                     {/* Radio Circle Indicator */}
                     <div className={cn(
                        "w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 transition-colors",
                        isSelected ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#D9D9D9] bg-transparent"
                     )}>
                        {isSelected && <div className="w-full h-full rounded-full bg-[#1A1A1A]" />}
                     </div>

                     <div className="flex-1">
                        <div className={cn("text-[var(--text-base)] font-medium", isSelected ? "text-[#1A1A1A]" : "text-[#333333]")}>{opt.label}</div>
                        {opt.description && <div className="text-[var(--text-sm)] text-[#757575] mt-1">{opt.description}</div>}
                     </div>
                   </div>
                 );
               })}
             </div>
           );
        }
        
        return (
          <RadioGroup 
            value={safeValue?.toString()} 
            onValueChange={(val) => {
                onChange(val);
                if (field.autoAdvance && onAutoAdvance) {
                    setTimeout(onAutoAdvance, 350);
                }
            }}
            className={cn("space-y-[var(--spacing-3)]", isInline && "flex space-y-0 space-x-4")}
          >
            {options?.map((opt) => (
              <div key={opt.id} className="relative">
                <RadioGroupItem value={opt.value?.toString()} id={`${id}-${opt.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`${id}-${opt.id}`}
                  className={cn(
                    "flex items-center p-[var(--spacing-4)] rounded-[var(--radius-md)]",
                    "border border-[var(--color-border-default)] bg-[var(--color-bg-card)]",
                    "cursor-pointer transition-all min-h-[44px]",
                    "hover:bg-[var(--color-accent-default)]",
                    "peer-data-[state=checked]:border-[var(--color-primary-default)]",
                    "peer-data-[state=checked]:bg-[var(--color-primary-default)]/5",
                    "peer-data-[state=checked]:text-[var(--color-primary-default)]"
                  )}
                >
                  <span>{opt.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className={cn(
            "space-y-[var(--spacing-3)]", 
            isCards && "grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-3)] space-y-0"
          )}>
            {options?.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              return (
                <div key={opt.id} className="relative">
                  <Checkbox
                    id={`${id}-${opt.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange([...selectedValues, opt.value]);
                      } else {
                        onChange(selectedValues.filter((v: any) => v !== opt.value));
                      }
                    }}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`${id}-${opt.id}`}
                    className={cn(
                      "flex items-center p-[var(--spacing-4)] rounded-[var(--radius-md)]",
                      "border border-[var(--color-border-default)] bg-[var(--color-bg-card)]",
                      "cursor-pointer transition-all min-h-[44px]",
                      "hover:bg-[var(--color-accent-default)]",
                      isChecked && "border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5 text-[var(--color-primary-default)]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isChecked && <div className="ml-auto w-2 h-2 rounded-[var(--radius-pill)] bg-[var(--color-primary-default)]" />}
                  </Label>
                </div>
              );
            })}
          </div>
        );
        
      case 'text_list':
         const list = Array.isArray(value) ? value : [];
         const maxItems = validation?.maxItems || 10;
         
         const handleAdd = () => {
           if (list.length < maxItems) onChange([...list, '']);
         };
         
         const handleRemove = (idx: number) => {
           onChange(list.filter((_: any, i: number) => i !== idx));
         };
         
         const handleUpdate = (idx: number, val: string) => {
           const newList = [...list];
           newList[idx] = val;
           onChange(newList);
         };

         return (
           <div className="space-y-[var(--spacing-3)]">
             {list.map((item: string, idx: number) => (
               <div key={idx} className="flex gap-[var(--spacing-2)]">
                 <Input 
                   value={item} 
                   onChange={(e) => handleUpdate(idx, e.target.value)} 
                   placeholder={placeholder || `Item ${idx + 1}`}
                   className="bg-[var(--color-bg-input)] border-[var(--color-border-default)] rounded-[var(--radius-md)] h-11 px-[var(--spacing-4)]"
                 />
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => handleRemove(idx)}
                   className="min-h-[44px] min-w-[44px] text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)]"
                 >
                   <Trash2 size={16} />
                 </Button>
               </div>
             ))}
             {list.length < maxItems && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={handleAdd} 
                 className="w-full border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)] min-h-[44px]"
               >
                 <Plus size={14} className="mr-2" /> Add Item
               </Button>
             )}
           </div>
         );

      case 'row_list':
        const rows = Array.isArray(value) ? value : [];
        const maxRows = validation?.maxItems || 10;
        const schema = field.rowSchema || [];

        const handleAddRow = () => {
          if (rows.length < maxRows) onChange([...rows, {}]);
        };

        const handleRemoveRow = (idx: number) => {
          onChange(rows.filter((_: any, i: number) => i !== idx));
        };

        const handleUpdateRow = (idx: number, fieldId: string, val: any) => {
          const newRows = [...rows];
          newRows[idx] = { ...newRows[idx], [fieldId]: val };
          onChange(newRows);
        };

        return (
          <div className="space-y-[var(--spacing-4)]">
            {rows.map((row: any, idx: number) => (
              <div 
                key={idx} 
                className="p-[var(--spacing-4)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] relative group"
              >
                 <div className="absolute top-[var(--spacing-2)] right-[var(--spacing-2)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveRow(idx)} 
                      className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)]"
                    >
                      <Trash2 size={16} />
                    </Button>
                 </div>
                 <div className="space-y-[var(--spacing-4)]">
                   {schema.map((subField) => (
                     <WizardField
                       key={subField.id}
                       field={subField}
                       value={row[subField.id]}
                       onChange={(val) => handleUpdateRow(idx, subField.id, val)}
                       error={error} 
                     />
                   ))}
                 </div>
              </div>
            ))}
            {rows.length < maxRows && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddRow} 
                className="w-full border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)] min-h-[44px]"
              >
                <Plus size={14} className="mr-2" /> Add Entry
              </Button>
            )}
          </div>
        );

      case 'matrix':
        const matrixRows = field.rows || [];
        const matrixCols = field.columns || [];
        const matrixValue = value || {}; // { rowId: colValue }

        const handleMatrixChange = (rowId: string, colValue: any) => {
           onChange({ ...matrixValue, [rowId]: colValue });
        };

        return (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="p-[var(--spacing-2)] text-left w-1/3"></th>
                  {matrixCols.map(col => (
                    <th key={col.id} className="p-[var(--spacing-2)] text-center text-[var(--color-text-muted)]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map(row => (
                  <tr key={row.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-accent-default)]/5 transition-colors">
                    <td className="p-[var(--spacing-4)] text-[var(--color-text-primary)]">{row.label}</td>
                    {matrixCols.map(col => {
                      const isSelected = matrixValue[row.id] === col.value;
                      return (
                        <td key={`${row.id}-${col.id}`} className="p-[var(--spacing-2)] text-center">
                          <div className="flex justify-center">
                            <RadioGroupItem
                              value={col.value}
                              id={`${row.id}-${col.id}`}
                              checked={isSelected}
                              onClick={() => handleMatrixChange(row.id, col.value)}
                              className="cursor-pointer"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'info':
        return (
           <div className="prose prose-sm max-w-none text-[var(--color-text-muted)]">
              {description}
           </div>
        );

      default:
        return <div className="text-[var(--color-status-danger)]">Unsupported field type: {type}</div>;
    }
  };

  return (
    <div className="space-y-[var(--spacing-2)] py-[var(--spacing-2)]">
      {/* Field Media */}
      {media && (
        <div className="mb-[var(--spacing-4)] flex justify-center">
            {media.type === 'image' && media.url && (
                <img src={media.url} alt={media.alt || label || 'Image'} className="max-h-64 rounded-[var(--radius-lg)] object-cover w-full md:w-auto" />
            )}
            {media.type === 'video' && media.url && (
                 <video 
                   src={media.url} 
                   controls 
                   className="max-h-64 w-full md:w-auto rounded-[var(--radius-lg)]"
                   poster={media.alt ? undefined : undefined} // Could add poster support if needed
                 />
            )}
            {media.type === 'icon' && media.name && (
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-default)]/10 flex items-center justify-center text-xl">
                    ✨
                </div>
            )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={id} className="text-[var(--color-text-primary)] flex items-center gap-[var(--spacing-2)]">
            {label}
            {validation?.required && <span className="text-[var(--color-status-danger)] ml-1">*</span>}
            {helpText && (
              <div className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-help" title={helpText}>
                <Info size={14} />
              </div>
            )}
          </Label>
        )}
        
        {duration && (
            <div className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-2 py-1 rounded-full flex items-center gap-1">
                <span>⏱️</span> {duration} min
            </div>
        )}
      </div>
      
      {description && type !== 'info' && (
        <p className="text-[var(--color-text-muted)] mb-[var(--spacing-2)]">{description}</p>
      )}
      
      {renderField()}
      
      {error && (
        <p className="text-[var(--color-status-danger)]">{error}</p>
      )}
    </div>
  );
}
/**
 * The block's flow controls — step group, auto-advance, required, duration — and
 * its carry-forward. Moved out of `BlockEditor.tsx` 2026-09-09 (§21 layout port,
 * phase 2), JSX unchanged.
 *
 * These are the four chips the mockup pins to the bottom of the editor. They are
 * separated from the field sections because none of them is decided by the block
 * TYPE: every block has a step, a duration, and a repeat.
 *
 * The `dayType` prop this arrived with was dead: no call site ever passed it, so
 * the preset lookup behind the Step control always returned undefined. Phase 3
 * replaced it with the day's own `policyOf(day).stepGroupRules` — the live
 * model's version of the same question, and one a caller can actually answer.
 */
import { FastForward, Clock, Layers } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Activity } from '../model/block-model';
import type { DayPolicy } from '../model/day-policy';

export interface BlockFlowFooterProps {
  block: Activity;
  onChange: (updates: Partial<Activity>) => void;
  /**
   * What the DAY this block sits on allows. Replaces the old `dayType` prop,
   * which no call site ever passed, so `getPresetForDayType` always returned
   * undefined and the Step control always rendered. A day has no type any more;
   * it carries its own policy, and `stepGroupRules` is the half of it this
   * control needs. Absent still means "allowed", so the behaviour is unchanged
   * wherever nothing is passed.
   */
  dayPolicy?: DayPolicy;
  /** `strip` is the mockup's pinned footer; `section` is the old inline block. */
  variant?: 'section' | 'strip';
}

export function BlockFlowFooter({ block, onChange, dayPolicy, variant = 'section' }: BlockFlowFooterProps) {
  const strip = variant === 'strip';
  return (
    /* WIZARD FLOW & INTERACTION SECTION */
    <div
      className={strip ? 'px-3 py-2' : 'pt-2 mt-2'}
      style={strip ? undefined : { borderTop: '1px solid var(--color-border-default)' }}
    >
       {(() => {
         const stepsAllowed = dayPolicy?.stepGroupRules?.allowed ?? true;
         const stepsRequired = dayPolicy?.stepGroupRules?.required ?? false;

         return (
           <>
             {!strip && (
               <div className="flex items-center gap-1.5 mb-2">
                 <Layers size={11} style={{ color: 'var(--color-text-muted)' }} />
                 <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wizard Flow</span>
               </div>
             )}

             {/* CONTROL ROW: Single inline row */}
             <div className="flex items-center gap-2 flex-wrap">
               {/* Step Group ID */}
               {stepsAllowed && (
                 <div className="flex items-center gap-1">
                   <Input 
                     value={block.stepGroup || ''}
                     onChange={(e) => onChange({ stepGroup: e.target.value })}
                     placeholder="Step ID"
                     className="h-7 w-24 text-[11px] font-mono"
                     style={{ borderRadius: 'var(--radius-md)' }}
                   />
                   <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                     {stepsRequired ? 'Required on this day' : 'Optional'}
                   </span>
                 </div>
               )}

               {/* Auto toggle chip */}
               <button
                 type="button"
                 onClick={() => onChange({ autoAdvance: !block.autoAdvance })}
                 className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
                 style={{
                   fontWeight: 500, fontFamily: 'var(--font-family-base)',
                   backgroundColor: block.autoAdvance ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                   color: block.autoAdvance ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                   border: block.autoAdvance ? 'none' : '1px solid var(--color-border-default)',
                 }}
               >
                 <FastForward size={10} /> Auto
               </button>

               {/* Required toggle chip */}
               <button
                 type="button"
                 onClick={() => onChange({ required: !block.required })}
                 className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
                 style={{
                   fontWeight: 500, fontFamily: 'var(--font-family-base)',
                   backgroundColor: block.required ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                   color: block.required ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                   border: block.required ? 'none' : '1px solid var(--color-border-default)',
                 }}
               >
                 Required
               </button>

               {/* Duration inline */}
               <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                 <Clock size={10} style={{ color: 'var(--color-text-muted)' }} />
                 <input 
                   type="number" 
                   className="w-8 h-5 text-[11px] text-center bg-transparent border-none outline-none"
                   style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                   value={block.duration}
                   onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
                 />
                 <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>m</span>
               </div>
             </div>
           </>
         );
       })()}

       {/* ── Repeat / carry-forward ───────────────────────────────── */}
       <div className="mt-3 pt-3 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid var(--color-border-light)' }}>
         <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
           Carry forward
         </span>
         <button
           type="button"
           onClick={() => onChange({ repeat: block.repeat ? undefined : { type: 'simple_repeat', onDays: [] } })}
           className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
           style={{
             fontWeight: 500, fontFamily: 'var(--font-family-base)',
             backgroundColor: block.repeat ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
             color: block.repeat ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
             border: block.repeat ? 'none' : '1px solid var(--color-border-default)',
           }}
         >
           Repeat
         </button>

         {block.repeat && (
           <>
             <Select value={block.repeat.type} onValueChange={(t: any) => onChange({ repeat: { ...block.repeat!, type: t } })}>
               <SelectTrigger className="h-7 w-[150px]" style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="simple_repeat">Simple repeat</SelectItem>
                 <SelectItem value="column_addition">Add columns</SelectItem>
                 <SelectItem value="on_demand">On demand</SelectItem>
               </SelectContent>
             </Select>

             {block.repeat.type === 'on_demand' ? (
               <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                 <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>From day</span>
                 <input
                   type="number"
                   className="w-10 h-5 text-[11px] text-center bg-transparent border-none outline-none"
                   style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                   value={block.repeat.onDemandFromDay ?? ''}
                   onChange={(e) => onChange({ repeat: { ...block.repeat!, onDemandFromDay: parseInt(e.target.value) || undefined } })}
                 />
               </div>
             ) : (
               <>
                 <button
                   type="button"
                   onClick={() => onChange({ repeat: { ...block.repeat!, everyDay: !block.repeat!.everyDay } })}
                   className="h-7 px-2.5 flex items-center rounded-md text-[11px]"
                   style={{
                     fontWeight: 500, fontFamily: 'var(--font-family-base)',
                     backgroundColor: block.repeat.everyDay ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                     color: block.repeat.everyDay ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                     border: block.repeat.everyDay ? 'none' : '1px solid var(--color-border-default)',
                   }}
                 >
                   Every day
                 </button>
                 {!block.repeat.everyDay && (
                   <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                     <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>On days</span>
                     <input
                       type="text"
                       placeholder="e.g. 10, 25"
                       className="w-20 h-5 text-[11px] bg-transparent border-none outline-none"
                       style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                       value={(block.repeat.onDays ?? []).join(', ')}
                       onChange={(e) => onChange({ repeat: { ...block.repeat!, onDays: e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) } })}
                     />
                   </div>
                 )}
               </>
             )}
           </>
         )}
       </div>
    </div>
  );
}

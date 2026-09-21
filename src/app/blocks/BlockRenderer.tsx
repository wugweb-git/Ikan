import { useState, useRef, useEffect } from 'react';
import { Check, X, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Activity, ActivityConfig, renderActivityOf, warnFallback, configOf } from '../../shared/blocks/block-model';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { cn } from '../../components/ui/utils';

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
  const { type, title, subtitle, content } = block;
  // Via the accessor, not a destructured field: during the rename a block may
  // carry `activityConfig`, `exerciseConfig`, or both. A destructuring binding
  // reads one name only, which is how this was missed by a bulk rename that
  // matched `.exerciseConfig` and `exerciseConfig:` but not `{ exerciseConfig }`.
  const exerciseConfig = configOf(block);

  // --- Upload state (hoisted to top level to comply with Rules of Hooks) ---
  const [uploading, setUploading] = useState(false);

  // --- Timer + paced-breathing state (Rules of Hooks: top level, always run) ---
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const [breathRound, setBreathRound] = useState(0);

  // One interval, cleared on unmount. Without this a block scrolled past keeps
  // ticking, which is how a "2 minute" timer records eleven.
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (!breathRunning) { setBreathPhase('idle'); setBreathRound(0); return; }
    const cfg = configOf(block) || {};
    const [i, hRaw, o] = (cfg.pattern ?? '4-7-8').split('-').map((n) => Number(n) || 0);
    const h = Math.min(hRaw, 10); // free-form seconds, hold capped — §14
    const cycles = cfg.cycles ?? 6;
    const seq: Array<['in' | 'hold' | 'out', number]> = [['in', i], ['hold', h], ['out', o]];
    let step = 0, round = 1, id: number;
    setBreathRound(1);
    const run = () => {
      const [ph, secs] = seq[step];
      setBreathPhase(ph);
      id = window.setTimeout(() => {
        step += 1;
        if (step >= seq.length) { step = 0; round += 1; setBreathRound(round); }
        if (round > cycles) { setBreathRunning(false); return; }
        run();
      }, Math.max(1, secs) * 1000);
    };
    run();
    return () => window.clearTimeout(id);
  }, [breathRunning, block]);
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

  const renderMCQ = (config: ActivityConfig) => {
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

  const renderMultiSelect = (config: ActivityConfig) => {
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

  const renderChecklist = (config: ActivityConfig) => {
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

  const renderTextResponse = (config: ActivityConfig) => {
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

  // `number` was a declared subtype with no interaction, so its one live block
  // resolved through the default branch to `write` and drew a textarea.
  /*
    ── The four interactions declared 2026-09-08, built here (step 7) ──────

    Until now these had no case at all, so a block carrying one fell to
    `default: renderLesson()` and drew reading content — the `view` defect,
    which is the reason they shipped declared-but-not-offered. This closes that:
    `INTERACTIONS_WITHOUT_RENDERER` empties and the four activities behind them
    (`listen`, `date-time`, `table-review`, `ranking`) become authorable.
  */

  /**
   * `listen` — an audio track.
   *
   * `view` embeds video and `read` sets prose; neither plays audio, so a
   * listening block has never been authorable. Transcript is optional and shown
   * beneath, because audio with no text alternative is unusable to anyone who
   * cannot hear it.
   */
  const renderListen = (config: ActivityConfig) => (
    <div className="space-y-6 py-2 md:py-6">
      {block.image_url ? (
        <audio src={block.image_url} controls className="w-full" style={{ minHeight: 44 }} />
      ) : (
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>
          No audio attached to this block.
        </div>
      )}
      {config.transcript && (
        <details>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Transcript</summary>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, marginTop: 8 }}>{config.transcript}</p>
        </details>
      )}
    </div>
  );

  /**
   * `view` — a video, first.
   *
   * This returned `renderLesson()`, so a video block drew the PROSE layout with
   * the media above it — which is why the Block Type Viewer had to describe it
   * as "no renderer of its own". A watching block leads with the video and
   * treats content as a caption, which is the opposite emphasis.
   */
  const renderView = () => (
    <div className="space-y-6 py-2 md:py-6">
      {renderMedia()}
      {block.content && (
        <div
          className="prose max-w-none"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )}
    </div>
  );

  /**
   * `pick-date` — a date, and optionally a time.
   *
   * Its own control rather than a text box: a typed date is unparseable half
   * the time and unsortable always, and the whole point of capturing one is to
   * put entries in order.
   */
  const renderPickDate = (config: ActivityConfig) => (
    <div className="space-y-3">
      <input
        type={config.time ? 'datetime-local' : 'date'}
        value={typeof value === 'string' ? value : ''}
        min={config.minDate}
        max={config.maxDate}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="text-[17px] p-5 h-auto rounded-[20px] border-0 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] w-full"
        style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
      />
      {config.prompt && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{config.prompt}</p>
      )}
    </div>
  );

  /**
   * `rank` — put a list in order.
   *
   * Move-up / move-down rather than drag: a drag surface is unusable by
   * keyboard and unreliable on touch, and the stored answer is the ORDER, which
   * buttons express exactly.
   */
  const renderRank = (config: ActivityConfig) => {
    const items: string[] = config.listItems ?? config.options ?? [];
    const order: string[] = Array.isArray(value) && value.length ? value : items;
    const move = (from: number, to: number) => {
      if (readOnly || to < 0 || to >= order.length) return;
      const next = [...order];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      onChange(next);
    };
    if (!items.length) {
      return <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Nothing to rank — this block declares no items.</div>;
    }
    return (
      <div className="space-y-2">
        {order.map((item, i) => (
          <div key={item} className="flex items-center gap-3 p-3 rounded-xl"
               style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)', minWidth: 20 }}>{i + 1}</span>
            <span className="flex-1" style={{ fontSize: 'var(--text-sm)' }}>{item}</span>
            <button type="button" onClick={() => move(i, i - 1)} disabled={readOnly || i === 0}
                    aria-label={`Move ${item} up`} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={readOnly || i === order.length - 1}
                    aria-label={`Move ${item} down`} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i === order.length - 1 ? 0.3 : 1 }}>↓</button>
          </div>
        ))}
      </div>
    );
  };

  /**
   * `review-table` — read back what earlier days recorded.
   *
   * Captures nothing itself; that is what separates it from `input-table` and
   * why it is one of the two passive response-producing-looking interactions.
   * It reads `priorEntries`, the same carry-forward channel a repeated block
   * uses — so a sleep diary can finally show the week rather than one night.
   */
  const renderReviewTable = (config: ActivityConfig) => {
    const entries = priorEntries ?? [];
    if (!entries.length) {
      return (
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          Nothing recorded yet — entries appear here as you fill this in on later days.
        </div>
      );
    }
    const cols = config.columns ?? [];
    return (
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border-default)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-input)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Day</th>
              {cols.map((c) => <th key={c} style={{ textAlign: 'left', padding: '8px 12px' }}>{c}</th>)}
              {!cols.length && <th style={{ textAlign: 'left', padding: '8px 12px' }}>Entry</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.day} style={{ borderTop: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>Day {e.day}</td>
                {cols.length
                  ? cols.map((c) => (
                      <td key={c} style={{ padding: '8px 12px' }}>
                        {typeof e.response === 'object' && e.response ? String((e.response as Record<string, unknown>)[c] ?? '') : ''}
                      </td>
                    ))
                  : <td style={{ padding: '8px 12px' }}>{typeof e.response === 'string' ? e.response : JSON.stringify(e.response)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNumberResponse = (config: ActivityConfig) => {
    return (
      <div className="space-y-3">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={config.prompt || 'Enter a number'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          disabled={readOnly}
          className="
             text-[17px] p-6 h-auto rounded-[20px]
             border-0 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]
             focus:ring-2 focus:ring-[var(--color-primary-default)] focus:shadow-lg
             placeholder:text-[var(--grey-4)]
             transition-all
          "
        />
      </div>
    );
  };

  const renderClinicalInstrument = (config: ActivityConfig) => {
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

  const renderTableChecklist = (config: ActivityConfig) => {
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

  const renderInputTable = (config: ActivityConfig) => {
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

  const renderRatingScale = (config: ActivityConfig) => {
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

  const renderFileUpload = (config: ActivityConfig) => {
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

        const { apiClient } = await import('../../shared/api-client');
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

  /* ══ §5.2 build 1–12: the activities that had no case and fell to
     `default: renderLesson()`, drawing reading content instead of a control.
     Same tokens, same 44px floor, same readOnly discipline as the built ones. ══ */

  /** `boolean` — choose when it answers a question, confirm when it reports what you did. */
  const renderBoolean = (config: ActivityConfig) => {
    const labels = config.items && config.items.length >= 2 ? config.items : ['Yes', 'No'];
    const pick = (v: boolean) => { if (!readOnly) onChange(v); };
    const btn = (on: boolean) => ({
      flex: 1, minHeight: 96, borderRadius: 'var(--radius-lg)',
      border: `2px solid ${on ? 'var(--color-primary-default)' : 'transparent'}`,
      backgroundColor: on ? 'var(--color-bg-input)' : 'var(--color-bg-card)',
      boxShadow: on ? 'var(--shadow-md)' : '0 2px 12px rgba(0,0,0,0.03)',
      fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-family-base)', cursor: readOnly ? 'default' : 'pointer',
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
      justifyContent: 'center', gap: 8, transition: 'all .15s',
    });
    return (
      <div className="flex gap-3" role="radiogroup" aria-label={config.prompt || title}>
        <button type="button" style={btn(value === true)} role="radio" aria-checked={value === true}
                disabled={readOnly} onClick={() => pick(true)}>
          <Check size={28} aria-hidden />{labels[0]}
        </button>
        <button type="button" style={btn(value === false)} role="radio" aria-checked={value === false}
                disabled={readOnly} onClick={() => pick(false)}>
          <X size={28} aria-hidden />{labels[1]}
        </button>
      </div>
    );
  };

  /**
   * `slider` — a continuum the app does not own.
   *
   * Not `rating-scale` with a different skin: that stores an `option_id` from a
   * scale the app owns, this stores a `number`. The band map is what makes the
   * number readable, and what the interpretation phase reads.
   */
  const renderSlider = (config: ActivityConfig) => {
    const min = config.min ?? config.slider_min ?? config.constraints?.min ?? 0;
    const max = config.max ?? config.slider_max ?? config.constraints?.max ?? 10;
    const step = config.step ?? 1;
    const bands = config.slider_labels ?? [];
    const answered = typeof value === 'number';
    const v = answered ? (value as number) : min;
    const band = bands.length ? bands[Math.min(bands.length - 1, Math.round(((v - min) / Math.max(1, max - min)) * (bands.length - 1)))] : '';
    return (
      <div className="space-y-2 py-3">
        <input
          type="range" min={min} max={max} step={step} value={v} disabled={readOnly}
          aria-label={config.prompt || title}
          aria-valuetext={band ? `${v}, ${band}` : String(v)}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', height: 44, accentColor: 'var(--color-primary-default)' }}
        />
        <div className="flex justify-between tabular-nums" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          <span>{min}</span><span>{max}</span>
        </div>
        <p className="text-center" style={{ fontSize: 19, fontWeight: 500, minHeight: 26, marginTop: 12 }}>
          {answered ? (band || v) : <span style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>Move the slider to answer</span>}
        </p>
      </div>
    );
  };

  /** `timer` — start, wait, stop. The product is a measured duration, not a typed one. */
  const renderTimer = (config: ActivityConfig) => {
    const target = config.target ?? 120;
    const countsDown = (config.mode ?? 'down') === 'down';
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const elapsed = typeof value === 'number' ? value : 0;
    const shown = countsDown ? Math.max(0, target - elapsed) : elapsed;
    const tick = () => {
      if (readOnly || timerRef.current) return;
      timerRef.current = window.setInterval(() => {
        onChangeRef.current((prev: number) => {
          const next = (typeof prev === 'number' ? prev : 0) + 1;
          if (countsDown && next >= target) { stop(); return target; }
          return next;
        });
      }, 1000);
      setTimerOn(true);
    };
    const stop = () => {
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
      setTimerOn(false);
    };
    return (
      <div className="flex flex-col items-center gap-6 py-5">
        <div className="flex items-center justify-center"
             style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <span className="tabular-nums" style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmt(shown)}</span>
        </div>
        <button type="button" disabled={readOnly} onClick={() => (timerOn ? stop() : tick())}
                style={{ height: 52, padding: '0 34px', borderRadius: 26, border: 'none',
                         backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                         fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                         cursor: readOnly ? 'default' : 'pointer' }}>
          {timerOn ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}
        </button>
      </div>
    );
  };

  /**
   * `paced-breathing` — follow the pacer for a bracketed span.
   *
   * Free-form seconds, ruled 2026-09-10, with the guardrail free-form needs:
   * `hold` is capped at HOLD_CAP_SECONDS so a pattern nobody should breathe
   * cannot be authored by accident.
   */
  const renderPacedBreathing = (config: ActivityConfig) => {
    const HOLD_CAP_SECONDS = 10;
    const [inS, holdRaw, outS] = (config.pattern ?? '4-7-8').split('-').map((n) => Number(n) || 0);
    const holdS = Math.min(holdRaw, HOLD_CAP_SECONDS);
    const cycles = config.cycles ?? 6;
    const phase = breathPhase;
    const scale = phase === 'out' ? 0.82 : phase === 'idle' ? 1 : 1.28;
    const secs = phase === 'in' ? inS : phase === 'hold' ? holdS : phase === 'out' ? outS : 0;
    const label = phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : phase === 'out' ? 'Breathe out' : 'Ready';
    return (
      <div className="flex flex-col items-center gap-6 py-5">
        <div aria-live="polite" className="flex items-center justify-center"
             style={{ width: 190, height: 190, borderRadius: 95,
                      backgroundColor: 'var(--ikan-brand-teal-bg)', border: '2px solid var(--ikan-brand-teal)',
                      color: 'var(--ikan-teal-on-wash)', fontSize: 17, fontWeight: 500,
                      transform: `scale(${scale})`,
                      transition: `transform ${secs || 1}s ease-in-out` }}>
          {label}
        </div>
        <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {breathRound > 0 ? `Round ${breathRound} of ${cycles}` : `${cycles} rounds · ${inS}-${holdS}-${outS}`}
          {holdRaw > HOLD_CAP_SECONDS && ` · hold capped at ${HOLD_CAP_SECONDS}s`}
        </p>
        <button type="button" disabled={readOnly} onClick={() => setBreathRunning((r) => !r)}
                style={{ height: 52, padding: '0 34px', borderRadius: 26, border: 'none',
                         backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                         fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                         cursor: readOnly ? 'default' : 'pointer' }}>
          {breathRunning ? 'Stop' : 'Begin'}
        </button>
      </div>
    );
  };

  /** `consent` — the statement is stored as shown, alongside the answer and a timestamp. */
  const renderConsent = (config: ActivityConfig) => {
    const agreed = !!(value && (value as { agreed?: boolean }).agreed);
    const toggle = () => {
      if (readOnly) return;
      onChange(agreed ? null : { agreed: true, at: new Date().toISOString(), statement: config.statement ?? '' });
    };
    return (
      <div className="space-y-4">
        <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 20,
                      boxShadow: 'var(--shadow-sm)', fontSize: 15, lineHeight: 1.7, color: 'var(--grey-8)' }}>
          {config.statement}
        </div>
        <div role="checkbox" aria-checked={agreed} tabIndex={0} onClick={toggle}
             onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}
             className="flex items-start gap-4"
             style={{ padding: 16, minHeight: 44, backgroundColor: 'var(--color-bg-input)',
                      borderRadius: 'var(--radius-md)', cursor: readOnly ? 'default' : 'pointer' }}>
          <Checkbox checked={agreed} disabled={readOnly} onCheckedChange={toggle}
                    className="w-6 h-6 rounded-[6px] border-2 border-[var(--grey-2)] data-[state=checked]:bg-[var(--color-primary-default)] data-[state=checked]:border-[var(--color-primary-default)]" />
          <span style={{ fontSize: 15, lineHeight: 1.5 }}>{config.prompt || 'I understand and agree'}</span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          The statement above is stored with your answer, exactly as shown.
        </p>
      </div>
    );
  };

  /** `location` — a place, at the precision the block declares. Coarse by default. */
  const renderLocation = (config: ActivityConfig) => {
    const place = typeof value === 'string' ? value : '';
    const coarse = (config.precision ?? 'coarse') === 'coarse';
    return (
      <div className="space-y-3">
        <Input
          type="text" value={place} disabled={readOnly}
          placeholder={config.prompt || 'Search a place…'}
          aria-label={config.prompt || 'Place'}
          onChange={(e) => onChange(e.target.value)}
          className="text-[17px] p-6 h-auto rounded-[20px] border-0 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] w-full"
          style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
        />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {coarse ? 'Stored as an area, never an exact coordinate.' : 'Stored as an exact coordinate.'}
        </p>
      </div>
    );
  };

  /** `record` — audio captured in session. Provenance is what separates it from `upload`. */
  const renderRecord = (config: ActivityConfig) => {
    const maxS = config.max_duration ?? 120;
    const done = typeof value === 'string' && value.length > 0;
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <button type="button" disabled={readOnly}
                aria-label={done ? 'Recording saved' : 'Start recording'}
                onClick={() => !readOnly && onChange(done ? '' : `recording:${Date.now()}`)}
                style={{ width: 88, height: 88, borderRadius: 44,
                         border: '4px solid var(--color-border-default)',
                         backgroundColor: done ? 'var(--color-status-success)' : 'var(--ikan-brand-coral)',
                         cursor: readOnly ? 'default' : 'pointer',
                         display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {done ? <Check size={30} color="#fff" /> : <Mic size={30} color="#fff" />}
        </button>
        <span style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>
          {done ? 'Recording saved · tap to discard' : `Tap to record · max ${Math.floor(maxS / 60)}:${String(maxS % 60).padStart(2, '0')}`}
        </span>
      </div>
    );
  };

  // --- DISPATCHER ---

  const renderContent = () => {
    /*
      THE ACTIVITY DRAWS (§26, 2026-09-09).

      This switched on one of seventeen "interactions" — `select-one`,
      `input-table`, `track-table` — which were widget names wearing the word
      interaction. Under §26 an interaction is cognitive (`choose`, `share`,
      `confirm`) and draws nothing at all; six activities carry two of them, so
      it could not key a switch even in principle. The activity is what has a
      renderer, so the activity is what this asks for.

      Every case below is the same function the matching interaction called, and
      alias resolution happens before we get here, so a stored `select-one`
      lands on `single-select` and draws exactly what it always drew.
    */
    const activity = renderActivityOf(block);
    const config = exerciseConfig || {};

    switch (activity) {
      // observe
      case 'read':
      case 'complete':
      case 'view':
        return renderView();

      case 'listen':
        return renderListen(config);

      case 'table-review':
        return renderReviewTable(config);

      // locate
      case 'date':
      case 'time':
      case 'date-time':
        return renderPickDate(config);

      // rate · order
      case 'ranking':
        return renderRank(config);

      case 'clinical-instrument':
        return renderClinicalInstrument(config);

      case 'rating-scale':
        return renderRatingScale(config);

      // confirm
      case 'check-grid':
        return renderTableChecklist(config);

      case 'structured-list':
        return renderChecklist(config);

      // share
      case 'input-table':
        return renderInputTable(config);

      case 'text':
      case 'short-text':
      case 'ephemeral-journal':
        return renderTextResponse(config);

      case 'number':
        return renderNumberResponse(config);

      // choose
      case 'mcq':
      case 'single-select':
        return renderMCQ(config);

      case 'multi-select':
        return renderMultiSelect(config);

      // submit
      case 'upload':
        return renderFileUpload(config);

      // §5.2 — built 2026-09-10
      case 'boolean':
        return renderBoolean(config);

      case 'slider':
        return renderSlider(config);

      case 'timer':
        return renderTimer(config);

      case 'paced-breathing':
        return renderPacedBreathing(config);

      case 'consent':
        return renderConsent(config);

      case 'location':
        return renderLocation(config);

      case 'record':
        return renderRecord(config);

      default:
        /*
          Reaching here means the block carries an activity with no renderer —
          one of the eleven §26 declares ahead of the build (`slider`, `boolean`,
          `consent`, `timer`, `paced-breathing`, `location`, `record`…), or none
          at all. `ACTIVITIES_WITHOUT_RENDERER` keeps them out of the editor, so
          this is a stored value, not an authored one.
        */
        warnFallback(
          'BlockRenderer',
          `no renderer for activity "${activity ?? '(none)'}" — rendering as a lesson`,
          String(activity),
        );
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
          <p className="text-[15px] md:text-[17px] text-[var(--color-text-muted)] font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
        
        {/* Prompt/Description - Only if different from title */}
        {finalShowPrompt && (
          <p className="text-[17px] text-[var(--color-text-muted)] font-normal leading-relaxed">
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
                <div className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
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
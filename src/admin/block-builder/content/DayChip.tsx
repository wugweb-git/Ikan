/**
 * A day, as a draggable chip in the calendar strip. Moved verbatim from
 * `DayComposer.tsx` 2026-09-09 (§21 layout port, phase 1) — body unchanged, only
 * the imports are new.
 *
 * `onDuplicate` and `onDelete` were props here and were never used — the chip is
 * 34px square with no room for a menu. Removed in phase 4, once the behaviour
 * they described had somewhere to live: **Duplicate day** and **Delete day** are
 * now items on the day kebab in `DayHeader`, beside Repeat this day. The props
 * were dead; the actions are not.
 */
import { memo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DayContent } from '../model/block-model';
import { stageColour } from '../model/block-fields';
import { ItemTypes } from './dnd';

// --- DRAGGABLE DAY COMPONENT ---
interface DraggableDayProps {
  day: DayContent;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  moveDay: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableDay = memo(function DraggableDay({ day, index, isSelected, onSelect, moveDay }: DraggableDayProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.DAY,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveDay(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.DAY,
    item: () => ({ id: day.day, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const isOnboarding = day.day === 0;
  // Colour comes from `block-fields.ts`, which prefers the stage's catalog
  // `color` and falls back to a code map. This was a ten-branch ternary of raw
  // hex — the only hardcoded colours in a file that otherwise uses tokens — and
  // it covered 9 of 11 stage types, so `learning`, the type 93 of 98 days use,
  // fell through to the default.
  // A day has no type to colour by since §19 step 3. Day 0 keeps its onboarding
  // tint because it is identified by its NUMBER, not by a type string.
  const typeColor = isOnboarding ? stageColour('onboarding') : stageColour(undefined);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className="shrink-0"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div
        onClick={onSelect}
        className="flex items-center justify-center cursor-pointer transition-all"
        style={{
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          backgroundColor: isSelected ? typeColor : 'var(--color-bg-card)',
          color: isSelected ? '#fff' : typeColor,
          border: isSelected ? 'none' : `1.5px solid ${typeColor}40`,
          boxShadow: isSelected ? `0 2px 8px ${typeColor}30` : 'none',
        }}
      >
        {day.day}
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.day === next.day && prev.index === next.index && prev.isSelected === next.isSelected;
});

export { DraggableDay as DayChip };

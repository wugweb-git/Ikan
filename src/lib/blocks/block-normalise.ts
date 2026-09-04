/**
 * Raw stored block -> `Activity`, **preserving every field it does not normalise.**
 *
 * This used to enumerate eleven fields and return a fresh object, which silently
 * dropped everything else on EVERY load. What was being lost:
 *
 *   interaction   the field the whole block model is migrating TO. An authored
 *                 `interaction` — which `resolveInteraction` prefers over
 *                 type+subtype — did not survive a single load/save cycle, so
 *                 the strangler seam could never take hold.
 *   repeat        carry-forward. The editor writes it and this discarded it,
 *                 which is why `ActivityRepeat` is fully built, has a working
 *                 editor control, and is used by ZERO of 407 stored blocks.
 *   subtitle      authored copy
 *   data_id       block-to-data linkage
 *   retyped_from  and any other provenance a migration writes
 *
 * So: spread first, normalise second. A field added to the model in future is
 * carried by default rather than needing this function to be remembered.
 */
export function normaliseBlock(block: any) {
  const {
    block_type, exercise_config, estimated_time_minutes, is_required,
    step_group_id, auto_advance, ...rest
  } = block ?? {};
  return {
    ...rest,
    id: block.id,
    title: block.title || 'Untitled Block',
    type: block.type || block_type || 'lesson',
    content: block.content || '',
    duration: block.duration || estimated_time_minutes || 5,
    required: block.required !== undefined ? block.required
            : (is_required !== undefined ? is_required : true),
    exerciseConfig: block.exerciseConfig || exercise_config || {},
    stepGroup: block.stepGroup || step_group_id,
    autoAdvance: block.autoAdvance || auto_advance || false,
    image_url: block.image_url,
    order: block.order,
  };
}

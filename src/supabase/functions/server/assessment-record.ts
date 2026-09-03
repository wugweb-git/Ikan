/**
 * What kind of thing an `assessment_result:` row is.
 *
 * The prefix holds two populations. Real assessment results, and **program
 * check-ins** written by `ProgramCheckIn` under a synthetic assessment id
 * (`checkin_{equipId}_day_{n}`) with no slug, no bands, and a `responses` shape
 * of `{day, programId, confidenceLevel, perceivedChange, continuationIntent}`.
 * 25 of 102 rows are check-ins.
 *
 * Every consumer had to subtract them, and each did it independently — six
 * copies of a `startsWith('checkin_')` test across the client and the edge
 * function, two of which also checked `responses.type` and four of which did
 * not. A record type nobody declares is one every reader has to guess at.
 *
 * Records now carry `record_type` explicitly. This predicate prefers it and
 * falls back to the old heuristics so pre-existing rows still resolve.
 *
 * ⚠ Duplicated from `src/lib/assessment-record.ts`. The edge function is
 * deployed by flat-copying only its own directory (BUILD.md), so it cannot
 * import across it. Change both together.
 */
export type AssessmentRecordType = 'assessment_result' | 'program_checkin';

export function recordTypeOf(record: any): AssessmentRecordType {
  const declared = record?.record_type ?? record?.recordType;
  if (declared === 'program_checkin' || declared === 'assessment_result') return declared;

  // Legacy detection, for rows written before record_type existed.
  const id = String(record?.assessment_id ?? record?.assessmentId ?? '');
  if (id.startsWith('checkin_') || id.startsWith('checkin-')) return 'program_checkin';
  if (record?.responses?.type === 'program_checkin') return 'program_checkin';
  return 'assessment_result';
}

/** True for a program check-in — never a scored assessment result. */
export function isProgramCheckIn(record: any): boolean {
  return recordTypeOf(record) === 'program_checkin';
}

/** True for a real assessment result. Use this to filter, not a prefix test. */
export function isAssessmentResult(record: any): boolean {
  return recordTypeOf(record) === 'assessment_result';
}

/**
 * useMetadata – Single source of truth for ALL metadata types.
 *
 * All data is fetched from the KV-backed `/categories` endpoint.
 * The AdminCategoryManager stores items under `category:` KV prefix with a `type` field.
 *
 * Usage:
 *   const { categories, contentTypes, filterTypes, difficultyLevels, ... } = useMetadata();
 *
 * Returns { label, value } arrays suitable for Select dropdowns and filter chips.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import type { MetadataType } from '../lib/metadata-catalog';

export interface MetadataOption {
  label: string;
  value: string;
  icon?: string;
  color?: string;
  description?: string;
  /** Rank within an ordered vocabulary (severity_level, response_tier). */
  order?: number;
  /**
   * `severity_level` rows only: the response_tier this severity maps to.
   * This is the authoritative severity -> tier map; scoring-engine's
   * DEFAULT_TIER_MAP is only a fallback for before the catalog loads, so
   * dropping this field here silently reverts the map to code.
   */
  tier?: string;
  /**
   * `block_type` rows only: this row is a CONTAINER — a stage that holds blocks
   * (learning, practice, workshop…) — not a block you can place inside one.
   *
   * It exists because the block_type and day_config_type vocabularies are being
   * merged into one list (blocks.md §18 Phase 1). Until that merge completes,
   * consumers that offer a block type to an author must exclude these, or the
   * picker starts offering `learning` as a kind of block.
   */
  can_hold?: boolean;
}

interface MetadataBucket {
  categories: MetadataOption[];
  contentTypes: MetadataOption[];
  filterTypes: MetadataOption[];
  interactionTypes: MetadataOption[];
  blockTypes: MetadataOption[];
  difficultyLevels: MetadataOption[];
  consultantTypes: MetadataOption[];
  languages: MetadataOption[];
  therapeuticApproaches: MetadataOption[];
  demographicSpecialties: MetadataOption[];
  expertiseCategories: MetadataOption[];
  sessionFormats: MetadataOption[];
  assessmentTypes: MetadataOption[];
  mediaTypes: MetadataOption[];
  emaCategories: MetadataOption[];
  scoringMethods: MetadataOption[];
  severityLevels: MetadataOption[];
  /** Response tiers (low/moderate/high) — derived from severity via tier_map. */
  responseTiers: MetadataOption[];
  accountTypes: MetadataOption[];
  dayConfigTypes: MetadataOption[];
  exerciseSubtypes: MetadataOption[];
  checkinBlockTypes: MetadataOption[];
}

interface MetadataState extends MetadataBucket {
  loading: boolean;
  error: string | null;
}

const EMPTY_BUCKET: MetadataBucket = {
  categories: [],
  contentTypes: [],
  filterTypes: [],
  interactionTypes: [],
  blockTypes: [],
  difficultyLevels: [],
  consultantTypes: [],
  languages: [],
  therapeuticApproaches: [],
  demographicSpecialties: [],
  expertiseCategories: [],
  sessionFormats: [],
  assessmentTypes: [],
  mediaTypes: [],
  emaCategories: [],
  scoringMethods: [],
  severityLevels: [],
  responseTiers: [],
  accountTypes: [],
  dayConfigTypes: [],
  exerciseSubtypes: [],
  checkinBlockTypes: [],
};

// Map from KV `type` field → bucket key
const TYPE_TO_BUCKET: Record<string, keyof MetadataBucket> = {
  category: 'categories',
  content_type: 'contentTypes',
  filter_type: 'filterTypes',
  interaction_type: 'interactionTypes',
  block_type: 'blockTypes',
  difficulty_level: 'difficultyLevels',
  consultant_type: 'consultantTypes',
  language: 'languages',
  therapeutic_approach: 'therapeuticApproaches',
  demographic_specialty: 'demographicSpecialties',
  expertise_category: 'expertiseCategories',
  session_format: 'sessionFormats',
  assessment_type: 'assessmentTypes',
  media_type: 'mediaTypes',
  ema_category: 'emaCategories',
  scoring_method: 'scoringMethods',
  severity_level: 'severityLevels',
  response_tier: 'responseTiers',
  account_type: 'accountTypes',
  day_config_type: 'dayConfigTypes',
  // Renamed from `exercise_subtype` 2026-09-04, in three deploys: accept both
  // names -> flip the 12 rows -> drop the old name. Rolling the FRONTEND back
  // past the first of those breaks this bucket, because the rows now carry a
  // name that build does not know.
  activity: 'exerciseSubtypes',
  checkin_block_type: 'checkinBlockTypes',
};

// Module-level cache so every hook consumer shares one fetch
let _cache: MetadataBucket | null = null;
let _fetchPromise: Promise<void> | null = null;

/**
 * KV `category:` row → MetadataOption.
 *
 * Exported for the drift assertion in the scoring verification harness: a
 * field the catalog defines but this function forgets to copy is invisible at
 * runtime and silently reverts behaviour to a code fallback. That is exactly
 * how `tier` was dropped once, quietly turning the severity -> tier map back
 * into DEFAULT_TIER_MAP after it had been moved into data.
 */
export function mapItem(item: any): MetadataOption {
  return {
    label: item.name || item.label || '',
    value: item.slug || item.value || (item.name || '').toLowerCase().replace(/\s+/g, '-'),
    icon: item.icon,
    color: item.color,
    description: item.description,
    order: typeof item.order === 'number' ? item.order : undefined,
    tier: typeof item.tier === 'string' ? item.tier : undefined,
    can_hold: item.can_hold === true ? true : undefined,
  };
}

function dedup(items: MetadataOption[]): MetadataOption[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.value)) return false;
    seen.add(item.value);
    return true;
  });
}

async function fetchAllMetadata(): Promise<MetadataBucket> {
  try {
    const data = await apiClient.getPublicCategories();
    const allItems = Array.isArray(data) ? data : data.categories || [];

    // Build empty bucket
    const bucket: MetadataBucket = {
      categories: [],
      contentTypes: [],
      filterTypes: [],
      interactionTypes: [],
      blockTypes: [],
      difficultyLevels: [],
      consultantTypes: [],
      languages: [],
      therapeuticApproaches: [],
      demographicSpecialties: [],
      expertiseCategories: [],
      sessionFormats: [],
      assessmentTypes: [],
      mediaTypes: [],
      emaCategories: [],
      scoringMethods: [],
      severityLevels: [],
      responseTiers: [],
      accountTypes: [],
      dayConfigTypes: [],
      exerciseSubtypes: [],
      checkinBlockTypes: [],
    };

    for (const item of allItems) {
      if (!item) continue;
      const mapped = mapItem(item);
      if (!mapped.label || !mapped.value) continue;

      const bucketKey = TYPE_TO_BUCKET[item.type];
      if (bucketKey) {
        bucket[bucketKey].push(mapped);
      } else {
        // Unknown type → default to categories
        bucket.categories.push(mapped);
      }
    }

    // Dedup each bucket
    for (const key of Object.keys(bucket) as (keyof MetadataBucket)[]) {
      bucket[key] = dedup(bucket[key]);
    }

    return bucket;
  } catch (error) {
    console.error('useMetadata: Failed to fetch metadata from API:', error);
    // Signalled rather than swallowed. Returning EMPTY_BUCKET silently made
    // every editor fall back to its own hardcoded vocabulary with no
    // indication to the admin that the catalog had not loaded — so a metadata
    // outage looked identical to a catalog that genuinely had no terms.
    _lastFetchError = error instanceof Error ? error.message : String(error);
    return { ...EMPTY_BUCKET };
  }
}

/** Set by fetchAllMetadata when a fetch fails; cleared on the next success. */
let _lastFetchError: string | null = null;

function bucketToState(b: MetadataBucket, loading: boolean, error: string | null): MetadataState {
  return { ...b, loading, error };
}

/**
 * Hook that provides ALL metadata types from KV.
 * Caches at module level so multiple consumers don't re-fetch.
 * Call `refresh()` to force a re-fetch (e.g., after admin creates a new category).
 */
export function useMetadata() {
  const [state, setState] = useState<MetadataState>(
    bucketToState(_cache || EMPTY_BUCKET, !_cache, null)
  );

  const mountedRef = useRef(true);

  const load = useCallback(async (force = false) => {
    if (_cache && !force) {
      if (mountedRef.current) {
        setState(bucketToState(_cache, false, null));
      }
      return;
    }

    // Deduplicate in-flight requests
    if (!_fetchPromise || force) {
      _lastFetchError = null;
      _fetchPromise = fetchAllMetadata().then((result) => {
        // Only cache a genuine success. Caching the empty bucket from a failed
        // fetch pinned every consumer to empty dropdowns until someone called
        // refresh(), long after the transient error had passed.
        if (!_lastFetchError) _cache = result;
        _fetchPromise = null;
      });
    }

    setState((prev) => ({ ...prev, loading: true }));
    await _fetchPromise;

    if (mountedRef.current) {
      setState(bucketToState(_cache || EMPTY_BUCKET, false, _lastFetchError));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  /** Force re-fetch (call after CRUD operations on categories) */
  const refresh = useCallback(() => {
    _cache = null;
    load(true);
  }, [load]);

  return { ...state, refresh };
}

/** Invalidate the module-level cache (e.g. after admin CRUD) */
export function invalidateMetadataCache() {
  _cache = null;
  _fetchPromise = null;
}
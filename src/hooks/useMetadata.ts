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
  account_type: 'accountTypes',
  day_config_type: 'dayConfigTypes',
  exercise_subtype: 'exerciseSubtypes',
  checkin_block_type: 'checkinBlockTypes',
};

// Module-level cache so every hook consumer shares one fetch
let _cache: MetadataBucket | null = null;
let _fetchPromise: Promise<void> | null = null;

function mapItem(item: any): MetadataOption {
  return {
    label: item.name || item.label || '',
    value: item.slug || item.value || (item.name || '').toLowerCase().replace(/\s+/g, '-'),
    icon: item.icon,
    color: item.color,
    description: item.description,
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
    return { ...EMPTY_BUCKET };
  }
}

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
      _fetchPromise = fetchAllMetadata().then((result) => {
        _cache = result;
        _fetchPromise = null;
      });
    }

    setState((prev) => ({ ...prev, loading: true }));
    await _fetchPromise;

    if (mountedRef.current && _cache) {
      setState(bucketToState(_cache, false, null));
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
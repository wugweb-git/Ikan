/**
 * The builder's shared vocabulary. No JSX, no imports — so anything can hold a
 * screen name without pulling a component in behind it.
 */
export type BuilderScreen = 'setup' | 'content';

export interface RecordMeta {
  /** Absent until the record has been saved once. Publish and delete need it. */
  id?: string;
  name: string;
  published: boolean;
}

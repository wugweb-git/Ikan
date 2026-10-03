/** Circled tick used by both bento grids' checklists. */
export function CheckIcon() {
  return (
    <div className="relative shrink-0 size-[20px]" style={{ color: 'var(--muted-foreground)' }}>
      <svg className="block size-full" fill="none" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M8.9579 17.2908C13.5601 17.2908 17.2908 13.5601 17.2908 8.9579C17.2908 4.35575 13.5601 0.62497 8.9579 0.62497C4.35575 0.62497 0.62497 4.35575 0.62497 8.9579C0.62497 13.5601 4.35575 17.2908 8.9579 17.2908Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        <path d="M5.62497 8.9583L7.29156 10.6249L12.2916 5.62497" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

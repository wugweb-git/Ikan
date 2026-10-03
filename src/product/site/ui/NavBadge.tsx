// Small status pill shown next to navigation items (e.g. Equip "beta",
// Consultation "coming soon"). Used across top nav, bottom nav, footer, sitemap.
export function NavBadge({ label, size = 'sm' }: { label?: string; size?: 'sm' | 'xs' }) {
  if (!label) return null;
  const isBeta = label.toLowerCase() === 'beta';
  const px = size === 'xs' ? '1px 3px' : '2px 5px';
  const fs = size === 'xs' ? '7px' : '9px';
  return (
    <span
      className="uppercase"
      style={{
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: '0.03em',
        lineHeight: 1,
        padding: px,
        borderRadius: '4px',
        marginLeft: '5px',
        color: 'var(--background)',
        backgroundColor: isBeta ? 'var(--foreground, #6941C6)' : 'var(--muted-foreground, #888)',
        verticalAlign: 'middle',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}


interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ToggleSwitch({ 
  enabled, 
  onChange, 
  disabled = false,
  size = 'md' 
}: ToggleSwitchProps) {
  const sizes = {
    sm: { width: '36px', height: '20px', thumbSize: '16px', thumbOffset: '16px' },
    md: { width: '44px', height: '24px', thumbSize: '20px', thumbOffset: '22px' },
    lg: { width: '52px', height: '28px', thumbSize: '24px', thumbOffset: '26px' }
  };
  
  const { width, height, thumbSize, thumbOffset } = sizes[size];
  
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex items-center cursor-pointer"
      style={{
        width,
        height,
        borderRadius: `calc(${height} / 2)`,
        backgroundColor: enabled 
          ? (disabled ? 'var(--color-border-default)' : 'var(--color-primary-default)')
          : 'var(--color-bg-muted)',
        transition: 'background-color 0.2s ease',
        border: 'none',
        padding: '0',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      aria-label={enabled ? 'Enabled' : 'Disabled'}
      aria-checked={enabled}
      role="switch"
    >
      <span
        style={{
          position: 'absolute',
          left: enabled ? thumbOffset : '2px',
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          backgroundColor: 'white',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
        }}
      />
    </button>
  );
}
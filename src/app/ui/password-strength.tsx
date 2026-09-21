import { getPasswordStrength } from '../../shared/validation';

interface PasswordStrengthProps {
  password: string;
  showLabel?: boolean;
}

export function PasswordStrength({ password, showLabel = true }: PasswordStrengthProps) {
  const { score, label, color } = getPasswordStrength(password);
  
  if (!password) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: index <= score ? color : 'var(--color-bg-muted)',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>
      
      {/* Label */}
      {showLabel && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: color
          }}
        >
          Strength: {label}
        </p>
      )}
    </div>
  );
}
interface AdminLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function AdminLoading({ message = 'Loading...', fullScreen = false }: AdminLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div 
        className="animate-spin rounded-full border-4 mb-4"
        style={{
          width: 'var(--spacing-12)',
          height: 'var(--spacing-12)',
          borderColor: 'var(--color-accent-default)',
          borderTopColor: 'var(--color-primary-default)'
        }}
      />
      <p style={{ 
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-muted)'
      }}>
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {content}
    </div>
  );
}

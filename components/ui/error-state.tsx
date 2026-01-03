export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
        }}
      >
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '8px',
          }}
        >
          {title || 'Error'}
        </h3>
        <p style={{ color: '#991b1b', marginBottom: onRetry ? '16px' : '0' }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}


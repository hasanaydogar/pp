export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
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
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}


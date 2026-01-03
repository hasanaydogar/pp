import { getCurrentUser } from '@/lib/auth/actions';
import { signOut } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function TestPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '20px',
      padding: '20px'
    }}>
      <h1>Test Page - Authentication Success! ✅</h1>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2>Kullanıcı Bilgileri:</h2>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          <div>
            <strong>Provider ID:</strong> {user.provider_id}
          </div>
          <div>
            <strong>Provider:</strong> {user.provider_type}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          {user.name && (
            <div>
              <strong>Name:</strong> {user.name}
            </div>
          )}
          {user.avatar_url && (
            <div>
              <strong>Avatar:</strong>{' '}
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>✅ OAuth2 flow çalışıyor!</p>
        <p>✅ Token'lar alındı ve saklandı!</p>
        <p>✅ Kullanıcı bilgileri başarıyla alındı!</p>
      </div>
    </div>
  );
}


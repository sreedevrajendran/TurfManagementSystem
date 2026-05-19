export default function GlobalLoading() {
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', background: '#0a0a0f',
      position: 'fixed', top: 0, left: 0, zIndex: 9999
    }}>
      <div style={{
        width: '60px', height: '60px', border: '3px solid rgba(0, 230, 118, 0.15)',
        borderTop: '3px solid #00e676', borderRadius: '50%',
        animation: 'spin 0.8s ease-in-out infinite'
      }} />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <p style={{ marginTop: '24px', color: '#00e676', fontWeight: 700, letterSpacing: '4px', fontSize: '13px' }}>
        LOADING...
      </p>
    </div>
  );
}

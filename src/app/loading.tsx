export default function GlobalLoading() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '100px' }}>
        <div style={{
          fontSize: '3rem',
          animation: 'bounce 0.8s infinite alternate cubic-bezier(0.5, 0.05, 1, 0.5)'
        }}>⚽</div>
        <div style={{
          fontSize: '3rem',
          animation: 'bounce 0.8s infinite alternate-reverse cubic-bezier(0.5, 0.05, 1, 0.5)'
        }}>🏏</div>
      </div>
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-50px); }
        }
      `}</style>
    </div>
  );
}

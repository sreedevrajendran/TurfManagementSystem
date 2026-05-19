export default function GlobalLoading() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', zIndex: 9999,
      background: 'rgba(255,255,255,0.05)'
    }}>
      <div style={{
        height: '100%',
        background: '#00e676',
        animation: 'loadingBar 1.5s infinite ease-in-out',
        width: '30%',
        boxShadow: '0 0 10px #00e676'
      }} />
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 50%; }
          100% { transform: translateX(400%); width: 10%; }
        }
      `}</style>
    </div>
  );
}

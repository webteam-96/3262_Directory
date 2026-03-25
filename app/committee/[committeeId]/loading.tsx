export default function Loading() {
  return (
    <div className="boxed_wrapper">
      <section
        className="page-title centred"
        style={{ position: 'relative', padding: '30px 0', backgroundColor: '#9EDFFD' }}
      >
        <div className="auto-container">
          <div className="content-box">
            <div className="title">
              <div style={{ height: 62, width: 320, background: 'rgba(0,0,0,0.10)', borderRadius: 6 }} />
            </div>
            <div style={{ height: 40, width: 120, background: 'rgba(0,0,0,0.10)', borderRadius: 6, marginTop: 12 }} />
          </div>
        </div>
      </section>

      <section className="about-style-three">
        <div className="auto-container">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 210,
                background: '#e8e8e8',
                borderRadius: 4,
                marginBottom: 18,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

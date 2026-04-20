import React from 'react';

export default function Sidebar({ sidebarData, cursorData }) {
  const { dataPoints, distanceRange, totalLoss, pulseWidth, wavelength, duration, ior } = sidebarData;
  const now = new Date();
  
  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div className="sidebar-content">
        <div style={{ marginBottom: '16px' }}>
          <div className="info-section-title">Kondisi Pengukuran</div>
          
          <div className="info-row">
            <div className="info-label">Panjang Gelombang</div>
            <div className="info-value">{wavelength || '1310 nm SM'}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Lebar Pulsa</div>
            <div className="info-value">{pulseWidth || '50 ns'}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Rentang Jarak</div>
            <div className="info-value">{(distanceRange || 0).toFixed(1)} km</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">IOR</div>
            <div className="info-value">{ior || '1.46770'}</div>
          </div>

          <div className="info-row">
             <div className="info-label">Redaman</div>
             <div className="info-value">1.100 dB</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Waktu Rata - Rata</div>
            <div className="info-value">{duration || '15 s'}</div>
          </div>

          <div className="info-row">
            <div className="info-label">Ukuran Data</div>
            <div className="info-value">{dataPoints}</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div className="info-section-title">Tautan Pengukuran</div>
          
          <div className="info-row">
            <div className="info-label">Tanggal Pengukuran</div>
            <div className="info-value" style={{ fontSize: '11px' }}>{now.toLocaleDateString()} {now.toLocaleTimeString()}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Jarak Total</div>
            <div className="info-value">{(distanceRange || 0).toFixed(5)} km</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Total Redaman</div>
            <div className="info-value">{totalLoss ? totalLoss.toFixed(3) : '---'} dB</div>
          </div>

          <div className="info-row">
            <div className="info-label">Total Redaman Kembali</div>
            <div className="info-value">--- dB</div>
          </div>
        </div>

        {/* Since we removed the Marker tab from bottom, we put Cursor calc here like the screenshot's 'Menandai' sidebar block */}
        {cursorData && (
          <div>
            <div className="info-section-title">Menandai A-B</div>
            
            <div className="info-row">
              <div className="info-label" style={{ color: '#e53935' }}>Kursor A</div>
              <div className="info-value">{cursorData.A.x.toFixed(4)} km / {cursorData.A.y.toFixed(3)} dB</div>
            </div>

            <div className="info-row">
              <div className="info-label" style={{ color: '#1e88e5' }}>Kursor B</div>
              <div className="info-value">{cursorData.B.x.toFixed(4)} km / {cursorData.B.y.toFixed(3)} dB</div>
            </div>
            
            <div className="info-row" style={{ marginTop: '8px' }}>
              <div className="info-label" style={{ fontWeight: 'bold' }}>Jarak (A-B)</div>
              <div className="info-value" style={{ fontWeight: 'bold' }}>{Math.abs(cursorData.B.x - cursorData.A.x).toFixed(4)} km</div>
            </div>

            <div className="info-row">
              <div className="info-label" style={{ fontWeight: 'bold' }}>Redaman 2-Point</div>
              <div className="info-value" style={{ fontWeight: 'bold' }}>{Math.abs(cursorData.B.y - cursorData.A.y).toFixed(3)} dB</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

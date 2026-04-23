import React from 'react';

export default function EventQuizTable({ events, userAnswers, onAnswerChange, showResults, isAnalyzing }) {
  
  if (isAnalyzing) {
    return (
      <div className="table-container" style={{ width: '100%', height: '100%' }}>
        <table style={{ width: '100%', height: '100%' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', padding: '24px', color: '#1976d2', fontWeight: 'bold' }}>
                Simulator sedang memindai anomali pada tarikan grafik...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="table-container" style={{ width: '100%', height: '100%' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Jarak Jangkauan (km)</th>
              <th>Tebakan Anomali Anda</th>
              <th>Status Kelulusan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                Silahkan Generate Trace untuk memulai kuis
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f6f7' }}>
            <th style={{ width: '80px', padding: '6px 8px', borderLeft: '1px solid #cfd8dc' }}>Kejadian</th>
            <th style={{ width: '150px', padding: '6px 8px', borderLeft: '1px solid #cfd8dc' }}>Lokasi / Jarak (km)</th>
            <th style={{ padding: '6px 8px', borderLeft: '1px solid #cfd8dc' }}>Jenis Anomali (Tebakan)</th>
            <th style={{ width: '120px', padding: '6px 8px', borderLeft: '1px solid #cfd8dc' }}>Status</th>
            <th style={{ padding: '6px 8px', borderLeft: '1px solid #cfd8dc', borderRight: '1px solid #cfd8dc' }}>Jawaban Sebenarnya</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => {
            const isCorrect = showResults && userAnswers[ev.id] === ev.type;
            const isWrong = showResults && userAnswers[ev.id] && userAnswers[ev.id] !== ev.type;
            
            return (
              <tr key={ev.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                <td style={{ textAlign: 'right' }}>{ev.distance.toFixed(5)}</td>
                <td>
                  <select 
                    className={`select-event ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    value={userAnswers[ev.id] || ''}
                    onChange={(e) => onAnswerChange(ev.id, e.target.value)}
                    disabled={showResults}
                    style={{ 
                      width: '100%', 
                      padding: '4px', 
                      borderColor: isCorrect ? '#4caf50' : isWrong ? '#f44336' : '#cfd8dc',
                      background: isCorrect ? '#e8f5e9' : isWrong ? '#ffebee' : '#fff'
                    }}
                  >
                    <option value="" disabled>-- Pilih jenis anomali --</option>
                    <option value="normal">Tidak Ada Anomali (Normal)</option>
                    <option value="splice">Splice / Sambungan (Non-Reflektif)</option>
                    <option value="connector">Connector / Konektor (Reflektif)</option>
                    <option value="end">Ujung Kabel (End of Fiber)</option>
                  </select>
                </td>
                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {showResults && (
                    <span style={{ color: isCorrect ? '#2e7d32' : '#c62828' }}>
                      {isCorrect ? 'Benar ✅' : 'Salah ❌'}
                    </span>
                  )}
                </td>
                <td>
                  {showResults && (
                    <span style={{ color: isCorrect ? '#2e7d32' : '#c62828', fontWeight: isCorrect ? 'normal' : 'bold' }}>
                      {ev.type === 'normal' ? 'Tidak Ada Anomali (Normal)' :
                       ev.type === 'splice' ? 'Sambungan (Non-Reflektif)' : 
                       ev.type === 'connector' ? 'Konektor (Reflektif)' : 'Ujung Kabel (End of Fiber)'} 
                      {ev.loss && ev.type !== 'normal' ? ` (Redaman: ${ev.loss.toFixed(3)} dB)` : ''}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Form Tambahan: Penilaian Total Jarak & Redaman */}
      <div style={{ marginTop: '24px', padding: '16px', borderTop: '2px dashed #cfd8dc', background: '#fafafa' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#263238' }}>
          3. Tentukan Total Jarak kabel keseluruhan Real dan Redaman /km (Bila Muncul pada OTDR) dan Total Loss/Redaman pada jaringan yang di ukur ?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '160px', fontWeight: 'bold', color: '#37474f' }}>A. (Jarak Kabel)</span>
            <input 
              type="text" 
              placeholder="......................................................................"
              value={userAnswers['jarakKabel'] || ''}
              onChange={(e) => onAnswerChange('jarakKabel', e.target.value)}
              disabled={showResults}
              style={{ flex: 1, padding: '6px', border: 'none', borderBottom: '1px dotted #999', background: 'transparent', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '160px', fontWeight: 'bold', color: '#37474f' }}>B. (Redaman /Km)</span>
            <input 
              type="text" 
              placeholder="......................................................................"
              value={userAnswers['redamanKm'] || ''}
              onChange={(e) => onAnswerChange('redamanKm', e.target.value)}
              disabled={showResults}
              style={{ flex: 1, padding: '6px', border: 'none', borderBottom: '1px dotted #999', background: 'transparent', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '160px', fontWeight: 'bold', color: '#37474f' }}>C. (Total Loss)</span>
            <input 
              type="text" 
              placeholder="......................................................................"
              value={userAnswers['totalLoss'] || ''}
              onChange={(e) => onAnswerChange('totalLoss', e.target.value)}
              disabled={showResults}
              style={{ flex: 1, padding: '6px', border: 'none', borderBottom: '1px dotted #999', background: 'transparent', outline: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

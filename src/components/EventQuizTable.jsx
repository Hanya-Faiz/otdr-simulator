import React from 'react';

export default function EventQuizTable({ events, userAnswers, onAnswerChange, showResults, isAnalyzing, sidebarData }) {
  
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

  // Calculated True Values for Extra Form
  const endEvent = events.find(e => e.type === 'end') || events[events.length - 1];
  const trueJarakKabel = endEvent ? endEvent.distance.toFixed(4) : '';
  const trueRedamanKm = '0.200'; // Base simulation attenuation
  const trueTotalLoss = sidebarData && sidebarData.totalLoss ? sidebarData.totalLoss.toFixed(3) : '';

  const checkExtraAnswer = (field, trueValue) => {
    if (!showResults) return null;
    const ans = userAnswers[field] || '';
    if (!ans) return false;
    
    // Parse both as floats for tolerant comparison (e.g. 0.2 == 0.200)
    const parsedAns = parseFloat(ans.replace(',', '.'));
    const parsedTrue = parseFloat(trueValue);
    
    if (!isNaN(parsedAns) && !isNaN(parsedTrue)) {
      return Math.abs(parsedAns - parsedTrue) < 0.05; // 0.05 tolerance margin
    }
    return ans.trim() === trueValue;
  };

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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="number" 
                step="0.0001"
                placeholder="Masukkan jarak kabel (km)"
                value={userAnswers['jarakKabel'] || ''}
                onChange={(e) => onAnswerChange('jarakKabel', e.target.value)}
                disabled={showResults}
                style={{ width: '200px', padding: '6px 10px', border: '1px solid #b0bec5', borderRadius: '4px', outline: 'none' }}
              />
              {showResults && (
                 <span style={{ color: checkExtraAnswer('jarakKabel', trueJarakKabel) ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                   {checkExtraAnswer('jarakKabel', trueJarakKabel) ? '✅ Benar' : `❌ Salah (Jawaban: ${trueJarakKabel} km)`}
                 </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '160px', fontWeight: 'bold', color: '#37474f' }}>B. (Redaman /Km)</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="number" 
                step="0.001"
                placeholder="Masukkan redaman / km (dB)"
                value={userAnswers['redamanKm'] || ''}
                onChange={(e) => onAnswerChange('redamanKm', e.target.value)}
                disabled={showResults}
                style={{ width: '200px', padding: '6px 10px', border: '1px solid #b0bec5', borderRadius: '4px', outline: 'none' }}
              />
              {showResults && (
                 <span style={{ color: checkExtraAnswer('redamanKm', trueRedamanKm) ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                   {checkExtraAnswer('redamanKm', trueRedamanKm) ? '✅ Benar' : `❌ Salah (Jawaban: ${trueRedamanKm} dB/km)`}
                 </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '160px', fontWeight: 'bold', color: '#37474f' }}>C. (Total Loss)</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="number" 
                step="0.001"
                placeholder="Masukkan total loss (dB)"
                value={userAnswers['totalLoss'] || ''}
                onChange={(e) => onAnswerChange('totalLoss', e.target.value)}
                disabled={showResults}
                style={{ width: '200px', padding: '6px 10px', border: '1px solid #b0bec5', borderRadius: '4px', outline: 'none' }}
              />
              {showResults && (
                 <span style={{ color: checkExtraAnswer('totalLoss', trueTotalLoss) ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                   {checkExtraAnswer('totalLoss', trueTotalLoss) ? '✅ Benar' : `❌ Salah (Jawaban: ${trueTotalLoss} dB)`}
                 </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

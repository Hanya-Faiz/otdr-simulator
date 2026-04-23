import React, { useState, useEffect } from 'react';
import { Activity, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIAnalysisForm({ events, isAnalyzing }) {
  const [analysisText, setAnalysisText] = useState([]);
  const [troubleshootingText, setTroubleshootingText] = useState([]);

  useEffect(() => {
    if (isAnalyzing) return;

    if (!events || events.length === 0) {
      setAnalysisText(["Silakan generate trace terlebih dahulu untuk memulai analisis AI."]);
      setTroubleshootingText(["-"]);
      return;
    }

    const problemAnalysis = [];
    const troubleshootingSteps = [];

    let hasCriticalIssue = false;
    let endOfFiberDist = null;

    events.forEach(ev => {
      if (ev.type === 'normal') {
        // Do nothing for normal events in the problem analysis unless it's the only one
      } else if (ev.type === 'splice' && ev.loss > 0.1) {
        problemAnalysis.push(`Terdeteksi sambungan (splice) atau lekukan (bending) dengan redaman tinggi (${ev.loss.toFixed(3)} dB) pada jarak ${ev.distance.toFixed(4)} km.`);
        troubleshootingSteps.push(`Periksa fisik kabel di sekitar titik ${ev.distance.toFixed(4)} km. Lakukan penyambungan ulang (splicing) jika ditemukan patahan/kualitas sambungan buruk, atau luruskan kabel jika terdapat lekukan tajam (macrobending).`);
        hasCriticalIssue = true;
      } else if (ev.type === 'connector' && ev.loss > 0.5) {
        problemAnalysis.push(`Terdeteksi konektor (reflektif) dengan redaman tidak normal (${ev.loss.toFixed(3)} dB) pada jarak ${ev.distance.toFixed(4)} km.`);
        troubleshootingSteps.push(`Bersihkan ujung konektor optik di titik ${ev.distance.toFixed(4)} km menggunakan alat pembersih khusus (one-click cleaner / alkohol swab). Ganti konektor jika fisik terlihat cacat/tergores.`);
        hasCriticalIssue = true;
      } else if (ev.type === 'end') {
        endOfFiberDist = ev.distance.toFixed(4);
      }
    });

    if (problemAnalysis.length === 0) {
      problemAnalysis.push(`Jejak OTDR menunjukkan kondisi kabel fiber optik dalam batas toleransi normal hingga titik akhir pengukuran.`);
      if (endOfFiberDist) {
        problemAnalysis.push(`Kabel fiber optik berakhir di jarak ${endOfFiberDist} km.`);
      }
      troubleshootingSteps.push(`Tidak ada tindakan perbaikan kritis yang diperlukan. Lakukan perawatan rutin (preventive maintenance) sesuai jadwal.`);
    } else {
      if (endOfFiberDist) {
        problemAnalysis.push(`Kabel fiber optik berakhir/terputus total di jarak ${endOfFiberDist} km.`);
      }
    }

    setAnalysisText(problemAnalysis);
    setTroubleshootingText(troubleshootingSteps);

  }, [events, isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1976d2', padding: '40px' }}>
        <Activity className="spinner-icon" size={48} style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>AI sedang menganalisis jejak OTDR...</div>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ width: '100%', height: '100%', overflow: 'auto', background: '#fff' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #cfd8dc', background: '#f5f6f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#263238', margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Activity size={16} color="#1976d2" /> Laporan Analisis AI
        </h2>
        <div style={{ fontSize: '11px', color: '#546e7a' }}>
          Digenerasi secara otomatis berdasarkan pembacaan jejak simulator
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: 'calc(100% - 85px)' }}>
        {/* Section A: Analisa Masalah */}
        <div style={{ flex: 1, borderRight: '1px solid #cfd8dc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#f9f9f9', padding: '10px 16px', borderBottom: '1px solid #cfd8dc', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertTriangle size={14} color="#d97706" />
             <h3 style={{ color: '#263238', margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
               A. Analisa Masalah
             </h3>
          </div>
          <div style={{ padding: '16px', flex: 1, background: '#fff' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#37474f', lineHeight: '1.6', fontSize: '12px' }}>
              {analysisText.map((text, index) => (
                <li key={index} style={{ marginBottom: index === analysisText.length - 1 ? 0 : '8px' }}>{text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section B: Langkah Perbaikan */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#f9f9f9', padding: '10px 16px', borderBottom: '1px solid #cfd8dc', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Wrench size={14} color="#059669" />
             <h3 style={{ color: '#263238', margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
               B. Langkah Perbaikan Masalah
             </h3>
          </div>
          <div style={{ padding: '16px', flex: 1, background: '#fff' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#37474f', lineHeight: '1.6', fontSize: '12px' }}>
              {troubleshootingText.map((text, index) => (
                <li key={index} style={{ marginBottom: index === troubleshootingText.length - 1 ? 0 : '8px' }}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '8px 16px', borderTop: '1px solid #cfd8dc', display: 'flex', justifyContent: 'space-between', color: '#90a4ae', fontSize: '10px', background: '#f5f6f7' }}>
         <span>System: OTDR Simulator Engine v2.0</span>
         <span>Generated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

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
    <div className="ai-analysis-container" style={{ padding: '24px 32px', background: '#f9fafb', height: '100%', overflowY: 'auto', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ color: '#111827', margin: '0 0 4px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Activity size={20} color="#2563eb" /> Laporan Analisis AI
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>Dihasilkan secara otomatis dari data jejak simulasi.</p>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', background: '#e0e7ff', padding: '4px 12px', borderRadius: '16px', fontWeight: '500', color: '#4338ca' }}>
          Status: Selesai
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section A: Analisa Masalah */}
        <div className="form-section" style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertTriangle size={16} color="#d97706" />
             <h3 style={{ color: '#334155', margin: 0, fontSize: '14px', fontWeight: '600' }}>
               A. Analisa Masalah
             </h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '13px' }}>
              {analysisText.map((text, index) => (
                <li key={index} style={{ marginBottom: index === analysisText.length - 1 ? 0 : '8px' }}>{text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section B: Langkah Perbaikan */}
        <div className="form-section" style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Wrench size={16} color="#059669" />
             <h3 style={{ color: '#334155', margin: 0, fontSize: '14px', fontWeight: '600' }}>
               B. Langkah Perbaikan Masalah
             </h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '13px' }}>
              {troubleshootingText.map((text, index) => (
                <li key={index} style={{ marginBottom: index === troubleshootingText.length - 1 ? 0 : '8px' }}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '11px', fontWeight: '500' }}>
         <span>System: OTDR Simulator Engine v2.0</span>
         <span>Generated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

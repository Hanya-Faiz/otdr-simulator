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
    <div className="ai-analysis-container" style={{ padding: '24px', background: '#ffffff', height: '100%', overflowY: 'auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ color: '#2c3e50', margin: '0 0 8px 0', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Activity size={24} color="#1976d2" /> Laporan Analisis Cerdas AI
        </h2>
        <p style={{ color: '#7f8c8d', margin: 0, fontSize: '13px' }}>Digenerasi secara otomatis berdasarkan pembacaan jejak simulator</p>
      </div>

      <div className="form-section" style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #1976d2', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#1976d2', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <AlertTriangle size={18} /> A. Analisa Masalah :
        </h3>
        <ul style={{ paddingLeft: '24px', margin: '12px 0 0 0', color: '#34495e', lineHeight: '1.6', fontSize: '14px' }}>
          {analysisText.map((text, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{text}</li>
          ))}
        </ul>
      </div>

      <div className="form-section" style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px', borderLeft: '4px solid #27ae60', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#27ae60', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <Wrench size={18} /> B. Langkah Perbaikan Masalah :
        </h3>
        <ul style={{ paddingLeft: '24px', margin: '12px 0 0 0', color: '#34495e', lineHeight: '1.6', fontSize: '14px' }}>
          {troubleshootingText.map((text, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{text}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '30px', borderTop: '1px dashed #bdc3c7', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#95a5a6', fontSize: '12px' }}>
         <span>Digenerasi oleh: OTDR Simulator Pro Engine</span>
         <span>Tanggal: {new Date().toLocaleDateString('id-ID')}</span>
      </div>
    </div>
  );
}

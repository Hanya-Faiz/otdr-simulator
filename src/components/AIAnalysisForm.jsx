import React, { useState, useEffect } from 'react';
import { Activity, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIAnalysisForm({ events, isAnalyzing, sidebarData }) {
  const [analysisText, setAnalysisText] = useState([]);
  const [troubleshootingText, setTroubleshootingText] = useState([]);

  useEffect(() => {
    if (isAnalyzing) return;

    if (!events || events.length === 0) {
      setAnalysisText(["Silakan generate trace terlebih dahulu untuk memulai proses analisis otomatis."]);
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
      } else if (ev.type === 'splice') {
        if (ev.loss > 0.1) {
          problemAnalysis.push(`Terdeteksi anomali pada jarak ${ev.distance.toFixed(4)} km berupa sambungan (splice) atau lekukan tajam (bending) dengan redaman ${ev.loss.toFixed(3)} dB. Nilai ini melanggar standar redaman splice PT Telkom yang diizinkan (maksimal 0.100 dB).`);
          troubleshootingSteps.push(`Pada titik ${ev.distance.toFixed(4)} km: Periksa fisik kabel. Jika terdapat lekukan tajam (macrobending), luruskan jalur kabel. Jika merupakan titik sambungan, wajib lakukan pemotongan dan penyambungan ulang (splicing) menggunakan splicer yang terkalibrasi agar redaman turun dan lolos standar Telkom (≤ 0.100 dB).`);
          hasCriticalIssue = true;
        } else {
          problemAnalysis.push(`Terdapat titik sambungan (splice) pada jarak ${ev.distance.toFixed(4)} km dengan redaman ${ev.loss.toFixed(3)} dB. Kualitas sambungan tergolong sangat baik dan lolos standar PT Telkom (berada di bawah batas maksimal 0.100 dB).`);
        }
      } else if (ev.type === 'connector') {
        if (ev.loss > 0.5) {
          problemAnalysis.push(`Terdeteksi konektor reflektif dengan redaman tinggi/anomali mencapai ${ev.loss.toFixed(3)} dB pada jarak ${ev.distance.toFixed(4)} km. Nilai ini melebihi ambang batas toleransi standar redaman konektor PT Telkom (maksimal 0.500 dB).`);
          troubleshootingSteps.push(`Pada titik ${ev.distance.toFixed(4)} km: Segera cabut dan bersihkan ujung konektor optik menggunakan alat pembersih khusus (one-click cleaner / alkohol swab). Jika setelah dibersihkan redaman masih tidak lolos standar Telkom, konektor cacat/tergores dan wajib diganti dengan patchcord/pigtail baru.`);
          hasCriticalIssue = true;
        } else {
          problemAnalysis.push(`Terdapat konektor reflektif pada jarak ${ev.distance.toFixed(4)} km dengan redaman ${ev.loss.toFixed(3)} dB. Kondisi fisik konektor masih bersih, normal, dan memenuhi kriteria lolos standar PT Telkom (≤ 0.500 dB).`);
        }
      } else if (ev.type === 'end') {
        endOfFiberDist = ev.distance.toFixed(4);
      }
    });

    if (problemAnalysis.length === 0) {
      problemAnalysis.push(`Jejak OTDR menunjukkan kondisi keseluruhan kabel fiber optik dalam batas toleransi standar operasional hingga titik pengukuran terakhir.`);
      if (endOfFiberDist) {
        problemAnalysis.push(`Kabel fiber optik berakhir di jarak ${endOfFiberDist} km.`);
      }
      troubleshootingSteps.push(`Tidak ditemukan anomali redaman tinggi. Lakukan perawatan rutin (preventive maintenance) sesuai jadwal standar.`);
    } else {
      if (endOfFiberDist) {
        problemAnalysis.push(`Kabel fiber optik berakhir atau terputus total di jarak ${endOfFiberDist} km.`);
      }
      if (!hasCriticalIssue) {
        troubleshootingSteps.push(`Tidak ada tindakan perbaikan kritis yang mendesak. Parameter redaman masih memenuhi kelayakan standar.`);
      }
    }

    setAnalysisText(problemAnalysis);
    setTroubleshootingText(troubleshootingSteps);

  }, [events, isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1976d2', padding: '40px' }}>
        <Activity className="spinner-icon" size={48} style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Sistem sedang menganalisis jejak OTDR...</div>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ width: '100%', height: '100%', overflow: 'auto', background: '#fff' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #cfd8dc', background: '#f5f6f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#263238', margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Activity size={16} color="#1976d2" /> Laporan Analisis Kejadian
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

      {/* Section C: Link Budget Telkom */}
      {sidebarData && (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #cfd8dc' }}>
          <div style={{ background: '#f9f9f9', padding: '10px 16px', borderBottom: '1px solid #cfd8dc', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Activity size={14} color="#673ab7" />
             <h3 style={{ color: '#263238', margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
               C. Perhitungan Link Budget & Rx Power (Standar PT Telkom)
             </h3>
          </div>
          <div style={{ padding: '16px', background: '#fff', fontSize: '12px', color: '#37474f' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '250px' }}>
                 <strong>Parameter Pengukuran (Asumsi FTTH):</strong>
                 <ul style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.6' }}>
                   <li>Daya Pancar OLT (Tx Power) Asumsi: <strong style={{ color: '#1976d2' }}>+3.00 dBm</strong></li>
                   <li>Total Redaman Jalur (Total Loss): <strong style={{ color: '#d32f2f' }}>{sidebarData.totalLoss.toFixed(3)} dB</strong></li>
                   <li>Estimasi Daya Terima (Rx Power): <strong>{ (3.00 - sidebarData.totalLoss).toFixed(3) } dBm</strong></li>
                 </ul>
               </div>
               <div style={{ flex: 1, minWidth: '250px' }}>
                 <strong>Analisis Standar PT Telkom:</strong>
                 <div style={{ marginTop: '8px', padding: '10px', borderRadius: '4px', background: (3.00 - sidebarData.totalLoss) >= -27 && (3.00 - sidebarData.totalLoss) <= -13 ? '#e8f5e9' : '#ffebee', border: `1px solid ${(3.00 - sidebarData.totalLoss) >= -27 && (3.00 - sidebarData.totalLoss) <= -13 ? '#c8e6c9' : '#ffcdd2'}` }}>
                    {(3.00 - sidebarData.totalLoss) >= -27 && (3.00 - sidebarData.totalLoss) <= -13 ? (
                      <span><strong style={{ color: '#2e7d32' }}>✅ Lolos Standar:</strong> Nilai Rx Power { (3.00 - sidebarData.totalLoss).toFixed(3) } dBm berada dalam batas wajar (-13 dBm s.d -27 dBm). Koneksi internet pelanggan (ONT) akan stabil tanpa kendala redaman.</span>
                    ) : (3.00 - sidebarData.totalLoss) < -27 ? (
                      <span><strong style={{ color: '#c62828' }}>❌ Redaman Terlalu Tinggi (Gagal):</strong> Nilai Rx Power { (3.00 - sidebarData.totalLoss).toFixed(3) } dBm berada di bawah batas minimum PT Telkom (-27 dBm). Pelanggan berisiko mengalami Loss (Indikator Merah) atau koneksi putus-putus. Segera lakukan perbaikan (splicing ulang) pada titik redaman terbesar!</span>
                    ) : (
                      <span><strong style={{ color: '#f57c00' }}>⚠️ Daya Terlalu Besar:</strong> Nilai Rx Power { (3.00 - sidebarData.totalLoss).toFixed(3) } dBm melebihi batas toleransi perangkat (-13 dBm). Gunakan atenuator untuk menurunkan daya agar receiver optik pada ONT tidak rusak.</span>
                    )}
                 </div>
               </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#78909c', fontStyle: 'italic' }}>
              * Catatan: Standar kelayakan link FTTH Telkom mengharuskan Total Loss berada di kisaran 15 dB - 28 dB dari OLT ke ONT, dengan daya terima (Rx Power) di perangkat akhir antara -13 dBm hingga -27 dBm. Rumus dasar: Rx Power = Tx Power - Total Loss.
            </div>
          </div>
        </div>
      )}
      
      <div style={{ padding: '8px 16px', borderTop: '1px solid #cfd8dc', display: 'flex', justifyContent: 'space-between', color: '#90a4ae', fontSize: '10px', background: '#f5f6f7' }}>
         <span>System: OTDR Simulator Engine v2.0</span>
         <span>Generated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

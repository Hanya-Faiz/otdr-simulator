import React, { useState, useEffect, useRef } from 'react';
import { Play, Save, Download, Settings as SettingsIcon, HelpCircle, FolderOpen, Upload, LogOut, FileText, ChevronRight, Minimize2, ZoomIn, ZoomOut, Maximize, Activity, List, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Search, Plus, X } from 'lucide-react';
import { generateOTDRTrace, detectEventsFromTrace } from './utils/otdrSimulation';
import { parseSor } from 'sor-reader';
import OTDRChart from './components/OTDRChart';
import Sidebar from './components/Sidebar';
import EventQuizTable from './components/EventQuizTable';
import EventDiagram from './components/EventDiagram';

function App() {
  const [traceData, setTraceData] = useState([]);
  const [events, setEvents] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(null);
  
  const [difficulty, setDifficulty] = useState('Normal');
  const [activeBottomTab, setActiveBottomTab] = useState('quiz'); 
  const [activeMainTab, setActiveMainTab] = useState('analisis');
  const [cursorA, setCursorA] = useState({ x: 5.0, y: 0 });
  const [cursorB, setCursorB] = useState({ x: 15.0, y: 0 });
  const [isFiberSettingsOpen, setIsFiberSettingsOpen] = useState(false);
  const [fiberSettings, setFiberSettings] = useState({
    mode: 'number', // 'number' or 'identity'
    startNumber: 1,
    intervalNumber: 1,
    endImageA: '',
    endImageB: '',
    showDirection: true
  });
  
  const [sidebarData, setSidebarData] = useState({
    distanceRange: 30.0,
    dataPoints: 12501,
    totalLoss: 0,
    pulseWidth: '50 ns',
    wavelength: '1310 nm SM',
    duration: '15 s',
    ior: '1.46770'
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const fileInputRef = useRef(null);

  const resetQuizState = () => {
    setUserAnswers({});
    setShowResults(false);
    setScore(null);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500); // 1.5 seconds AI scanning illusion
  };

  const handleGenerateTrace = () => {
    const distChoices = [0.3, 0.5, 1, 2.5, 5, 10, 15, 20, 30];
    const randDist = distChoices[Math.floor(Math.random() * distChoices.length)];
    const ptsChoices = [8000, 12501, 25000, 64000];
    const randPts = ptsChoices[Math.floor(Math.random() * ptsChoices.length)];
    const pwChoices = ['10 ns', '50 ns', '100 ns', '500 ns', '1000 ns'];
    const randPw = pwChoices[Math.floor(Math.random() * pwChoices.length)];
    const wavChoices = ['1310 nm SM', '1550 nm SM', '1625 nm SM'];
    const randWav = wavChoices[Math.floor(Math.random() * wavChoices.length)];
    const durChoices = ['15 s', '30 s', '1 min', '3 min'];
    const randDur = durChoices[Math.floor(Math.random() * durChoices.length)];
    const ior = (1.46500 + Math.random() * 0.00500).toFixed(5);
    
    const { trace, events: genEvents } = generateOTDRTrace(difficulty, randDist, randPts);
    setTraceData(trace);
    setEvents(genEvents);
    setSidebarData({
      distanceRange: randDist,
      dataPoints: randPts,
      totalLoss: genEvents.reduce((acc, ev) => acc + (ev.loss || 0), 0) + (randDist * 0.2),
      pulseWidth: randPw,
      wavelength: randWav,
      duration: randDur,
      ior: ior
    });
    
    // Initialize cursors inside the new bounds
    if (trace.length > 0) {
      const initA = Math.min(5.0, randDist * 0.2);
      const initB = Math.min(15.0, randDist * 0.8);
      setCursorA({ x: initA, y: getPowerAtDistance(trace, initA) });
      setCursorB({ x: initB, y: getPowerAtDistance(trace, initB) });
    }
    resetQuizState();
  };

  const getPowerAtDistance = (trace, expectedX) => {
    if (!trace || trace.length === 0) return 0;
    const point = trace.reduce((prev, curr) => Math.abs(curr.x - expectedX) < Math.abs(prev.x - expectedX) ? curr : prev);
    return point.y;
  };

  // Generate initial trace on load
  useEffect(() => {
    handleGenerateTrace();
  }, []);

  const handleLoadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const result = parseSor(uint8Array, file.name);
      
      // Map trace points
      const newTraceData = result.trace.map(p => ({ x: p.distance, y: p.power }));
      setTraceData(newTraceData);
      
      // Map events
      const parsedEvents = [];
      const numEvents = result.KeyEvents["num events"];
      
      for (let i = 1; i <= numEvents; i++) {
         const evRaw = result.KeyEvents[i.toString()];
         if (!evRaw) continue;
         
         const rawType = (evRaw.type || '').toLowerCase();
         let typeCode = 'splice';
         if (rawType.includes('reflection') || rawType.includes('connector')) {
            typeCode = 'connector';
         } else if (rawType.includes('end') || rawType.includes('eof')) {
            typeCode = 'end';
         }
         
         const dist = parseFloat(evRaw.distance || 0);
         // Often reflection loss parsing gives negative or specific format, we extract a basic float
         const sLoss = parseFloat(evRaw["splice loss"]) || 0;
         const rLoss = parseFloat(evRaw["refl loss"]) || 0;
         const lossVal = typeCode === 'connector' ? rLoss : sLoss;
         
         parsedEvents.push({
           id: i,
           distance: dist,
           type: typeCode,
           loss: lossVal,
           rawType: evRaw.type
         });
      }
      
      // If the .SOR file doesn't contain an event table (frequent in raw measurements),
      // we fallback to our custom AI trace detector!
      if (parsedEvents.length === 0) {
         const autoEvents = detectEventsFromTrace(newTraceData);
         setEvents(autoEvents);
      } else {
         setEvents(parsedEvents);
      }
      
      // Map sidebar
      const lastPointX = newTraceData.length > 0 ? newTraceData[newTraceData.length-1].x : 30;
      setSidebarData({
        distanceRange: result.FxdParams?.range || lastPointX,
        dataPoints: result.FxdParams?.["num data points"] || newTraceData.length,
        totalLoss: result.KeyEvents?.Summary?.["total loss"] || 0
      });
      
      resetQuizState();
    } catch (err) {
      alert("Error parsing SOR file: " + err.message);
      console.error(err);
    }
    
    // Reset file input
    e.target.value = null;
  };

  const handleAnswerChange = (eventId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [eventId]: value
    }));
  };

  const handleCheckAnswers = () => {
    if (events.length === 0) return;
    
    let correct = 0;
    events.forEach(ev => {
      if (userAnswers[ev.id] === ev.type) {
        correct++;
      }
    });
    
    setScore({
      correct,
      total: events.length,
      percentage: Math.round((correct / events.length) * 100)
    });
    setShowResults(true);
  };

  return (
    <div className="app-container">
      {/* Title Bar */}
      <div className="window-title-bar">YOKOGAWA AQ7933 SIMULATOR</div>

      {/* Menu Bar */}
      <div className="top-menu-bar">
        <div className="menu-left">
          <button className={`menu-tab ${activeMainTab === 'analisis' ? 'active' : ''}`} onClick={() => setActiveMainTab('analisis')}><Activity size={14} /> Analisis</button>
          <button className={`menu-tab ${activeMainTab === 'multifiber' ? 'active' : ''}`} onClick={() => setActiveMainTab('multifiber')}><List size={14} /> Proyek Multi Fiber</button>
        </div>
        <div className="menu-right">
          <button className="menu-icon-btn"><FolderOpen size={14} fill="white" color="#4f6376" /> Utility <ChevronRight size={14} /></button>
          <button className="menu-icon-btn">APP OTDRApps <ChevronRight size={14} /></button>
          <button className="menu-icon-btn" onClick={() => setIsSettingsOpen(true)}><SettingsIcon size={14} /> Pengaturan</button>
          <button className="menu-icon-btn" onClick={() => setIsHelpOpen(true)}><HelpCircle size={14} /> Bantuan</button>
        </div>
      </div>

      {/* ===================== ANALISIS TAB ===================== */}
      {activeMainTab === 'analisis' && (<>
      {/* Toolbar */}
      <div className="toolbar-bar">
        <div className="toolbar-btn-group">
          <input 
             type="file" 
             accept=".sor" 
             ref={fileInputRef} 
             style={{ display: 'none' }} 
             onChange={onFileChange} 
          />
          <button className="action-btn" onClick={handleLoadClick}><FolderOpen size={18} /> Baca</button>
          <button className="action-btn"><Save size={18} color="#cfd8dc" /> Simpan</button>
          <button className="action-btn"><LogOut size={18} color="#cfd8dc" /> Ekspor</button>
        </div>

        <div className="toolbar-options" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '16px', color: '#90a4ae' }}>Pemrosesan multi-jejak ▼</span>
          <span>Menampilkan Ukuran Skala <span style={{ border: '1px solid #ccc', padding: '0 4px', borderRadius: '8px', fontSize: '10px' }}>OFF</span></span>
          <span style={{ marginLeft: '16px' }}>Menampilkan Sub Kursor <span style={{ border: '1px solid #ccc', padding: '0 4px', borderRadius: '8px', fontSize: '10px' }}>OFF</span></span>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <select 
               value={difficulty}
               onChange={(e) => setDifficulty(e.target.value)}
               title="Difficulty Level"
               style={{ padding: '2px 4px', border: '1px solid #b0bec5', borderRadius: '2px', fontSize: '11px', outline: 'none', background: '#ffffff', color: '#263238' }}
             >
               <option value="Easy">Easy</option>
               <option value="Normal">Normal</option>
               <option value="Hard">Hard</option>
               <option value="Advanced">Advanced</option>
             </select>
             <button className="action-btn primary" onClick={handleGenerateTrace} style={{ display: 'flex', flexDirection: 'row', gap: '4px', border: '1px solid #1976d2', padding: '3px 8px', borderRadius: '2px' }}>
                <Play size={12} fill="#1976d2" /> GENERATE
             </button>
          </div>
        </div>

        <button className="action-btn" style={{ flexDirection: 'row', gap: '4px', color: '#546e7a' }}><FileText size={16} /> Laporan <ChevronRight size={16} /></button>
      </div>

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Left mini strip */}
        <div className="left-tool-strip">
           <span style={{ color: '#546e7a', fontWeight: 'bold' }}>&gt;</span>
           <Activity size={16} className="tool-icon active" />
           <FolderOpen size={16} className="tool-icon" />
           <Upload size={16} className="tool-icon" />
           <ArrowDown size={16} className="tool-icon" />
           <ArrowUp size={16} className="tool-icon" />
           <div style={{ borderBottom: '1px solid #cfd8dc', width: '16px', margin: '4px 0' }}></div>
           <SettingsIcon size={16} className="tool-icon" />
        </div>

        {/* Chart Area */}
        <div className="chart-column">
           <div className="chart-header-modes">
              <span>Mode: </span>
              <label><input type="radio" name="mode" defaultChecked /> Analisa Kejadian</label>
              <label><input type="radio" name="mode" /> Menandai</label>
              <label style={{ marginLeft: '16px' }}><input type="checkbox" defaultChecked /> Jejak Multi</label>
              <label><input type="checkbox" defaultChecked /> Penanda tampilan</label>
              
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 Label: <input type="text" style={{ border: 'none', borderBottom: '1px solid #b0bec5', background: 'transparent', width: '100px', outline: 'none' }} />
              </div>
           </div>

           <div className="chart-wrapper">
              <div style={{ position: 'absolute', top: '28px', right: '48px', zIndex: 10, background: '#fff', border: '1px solid #cfd8dc', padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', height: '24px' }}>
                 Overview <Maximize size={12} />
              </div>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#546e7a' }}>dB/div</div>
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: '#546e7a' }}>km/div &nbsp;&nbsp;&nbsp; SMP: --</div>

              {(traceData.length === 0) && (
                <div className="empty-state-text">Silakan Letakan Data di sini</div>
              )}

              {traceData.length > 0 && (
                <OTDRChart 
                  traceData={traceData} 
                  cursorA={cursorA.x} 
                  cursorB={cursorB.x}
                  showCursors={true}
                  onCursorChange={(type, val) => {
                    const yVal = getPowerAtDistance(traceData, val);
                    if (type === 'A') setCursorA({ x: val, y: yVal });
                    if (type === 'B') setCursorB({ x: val, y: yVal });
                  }}
                />
              )}
           </div>
        </div>

        {/* Control Panel (D-PAD & Markers) */}
        <div className="control-panel">
           <div className="panel-block" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className="btn-wide" style={{ border: 'none', borderBottom: '1px solid #ddd' }}>Pencarian Otomatis</button>
              <button className="btn-wide" style={{ border: 'none', borderBottom: '1px solid #ddd' }}>Pengaturan Analisa</button>
              <button className="btn-wide" style={{ border: 'none' }}>Pemrosesan Batch</button>
           </div>
           
           <div className="panel-block">
              <div className="panel-block-title">Kursor</div>
              <div className="dpad-container">
                 <button className="dpad-btn dpad-up"><ArrowUp size={14} /></button>
                 <button className="dpad-btn dpad-left"><ArrowLeft size={14} /></button>
                 
                 <div style={{ position: 'absolute', top: '30px', left: '30px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={14} color="#1976d2" />
                 </div>

                 <button className="dpad-btn dpad-right"><ArrowRight size={14} /></button>
                 <button className="dpad-btn dpad-down"><ArrowDown size={14} /></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                 <button className="grid-button" style={{ padding: '2px', border: 'none', background: 'transparent' }}><ZoomIn size={14} /></button>
                 <button className="grid-button" style={{ padding: '2px', border: 'none', background: 'transparent' }}><ZoomOut size={14} /></button>
              </div>
              <button className="btn-wide" style={{ marginTop: '8px' }}>Kursor off</button>
           </div>

           <div className="panel-block">
              <div className="panel-block-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Menandai <label style={{ fontSize: '10px' }}><input type="checkbox" /> REF</label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                 <button className="grid-button">M1</button><button className="grid-button">Y1</button>
                 <button className="grid-button">M2</button><button className="grid-button">Y2</button>
                 <button className="grid-button">M3</button><button className="grid-button">Y3</button>
              </div>
              <button className="btn-wide" style={{ marginTop: '8px' }}>Hapus Penanda</button>
              <label style={{ fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><input type="checkbox" /> Tautan Kursor</label>
           </div>
        </div>

        {/* Info Sidebar */}
        <div className="info-sidebar">
          <Sidebar sidebarData={sidebarData} cursorData={{A: cursorA, B: cursorB}} />
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
         <div className="bottom-tabs">
            <div className={`bottom-tab ${activeBottomTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveBottomTab('quiz')}>Daftar Kejadian</div>
            <div className={`bottom-tab ${activeBottomTab === 'gambar' ? 'active' : ''}`} onClick={() => setActiveBottomTab('gambar')}>Gambar Kejadian</div>
            
            {events.length > 0 && !showResults && activeBottomTab === 'quiz' && (
              <button 
                style={{ marginLeft: 'auto', marginRight: '16px', background: '#1976d2', color: 'white', border: 'none', padding: '0 16px', cursor: 'pointer', fontSize: '12px' }}
                onClick={handleCheckAnswers}
              >
                Cek Jawaban Kuis
              </button>
            )}
            {showResults && score && activeBottomTab === 'quiz' && (
               <div style={{ marginLeft: 'auto', marginRight: '16px', display: 'flex', alignItems: 'center', color: score.percentage === 100 ? '#2e7d32' : '#f57c00', fontWeight: 'bold', fontSize: '12px' }}>
                  SKOR: {score.correct} / {score.total} ({score.percentage}%)
               </div>
            )}
         </div>
         <div className="bottom-content">
            {activeBottomTab === 'quiz' ? (
               <EventQuizTable 
                 events={events}
                 userAnswers={userAnswers}
                 onAnswerChange={handleAnswerChange}
                 showResults={showResults}
                 isAnalyzing={isAnalyzing}
               />
            ) : (
               <EventDiagram events={events} distanceRange={sidebarData.distanceRange} />
            )}
         </div>
      </div>
      </>)}

      {/* ===================== MULTI FIBER TAB ===================== */}
      {activeMainTab === 'multifiber' && (<>
      {/* Multi Fiber Toolbar */}
      <div className="toolbar-bar">
        <div className="toolbar-btn-group">
          <button className="action-btn"><Plus size={18} /> Baru</button>
          <button className="action-btn" onClick={handleLoadClick}><FolderOpen size={18} /> Baca</button>
          <button className="action-btn"><Save size={18} color="#cfd8dc" /> Simpan</button>
          <button className="action-btn" onClick={() => setIsFiberSettingsOpen(true)}><SettingsIcon size={18} /> Pengaturan</button>
        </div>
        <div className="toolbar-options" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Nama Model : <input type="text" style={{ border: 'none', borderBottom: '1px solid #b0bec5', background: 'transparent', width: '150px', outline: 'none', fontSize: '12px' }} /></span>
          <span>Nama Proyek : <input type="text" style={{ border: 'none', borderBottom: '1px solid #b0bec5', background: 'transparent', width: '200px', outline: 'none', fontSize: '12px' }} /></span>
        </div>
      </div>

      {/* Multi Fiber Main Content */}
      <div className="main-workspace">
        {/* Left Kelompok panel */}
        <div className="mf-kelompok-panel">
          <div className="mf-kelompok-header">Kelompok</div>
          <div className="mf-kelompok-body">
            <SettingsIcon size={16} style={{ color: '#90a4ae', cursor: 'pointer', margin: '8px auto', display: 'block' }} />
          </div>
        </div>

        {/* Main table area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
            <table className="mf-table">
              <thead>
                <tr>
                  <th>No. Fiber</th>
                  <th>Nama Kelompok</th>
                  <th>Status Pengukuran</th>
                  <th>Rentang Jarak</th>
                  <th>Lebar Pulsa</th>
                  <th>Redaman</th>
                  <th>Metode Rata - rata</th>
                  <th>Contoh Interval</th>
                  <th>Satuan Rata - rata</th>
                  <th>Durasi/Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '80px 0', color: '#b0bec5', fontSize: '14px' }}>Belum ada data fiber — klik Baru untuk menambahkan</td></tr>
              </tbody>
            </table>
          </div>

          {/* Bottom settings row */}
          <div className="mf-bottom-settings">
            <div className="mf-bottom-row-top">
              <span className="mf-setting-label">Panjang Gelombang</span>
              <span className="mf-setting-label" style={{ marginLeft: '80px' }}>Nama Penyimpanan</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="mf-setting-label">Lewatkan</span>
                <label><input type="radio" name="lewatkan" defaultChecked /> ON</label>
                <label><input type="radio" name="lewatkan" /> OFF</label>
                <button className="mf-status-btn">Status Alat</button>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#90a4ae', textAlign: 'right', padding: '2px 8px' }}>Status Pengukuran</div>
            
            <div className="mf-bottom-dropdowns">
              <div className="mf-dd-group">
                <span className="mf-dd-label">No. Fiber</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Nama Kelompok</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Rentang Jarak</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Lebar Pulsa</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Redaman</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Metode Rata - rata</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Contoh Interval</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
              <div className="mf-dd-group">
                <span className="mf-dd-label">Satuan Rata - rata</span>
                <select className="mf-dd-select"><option>—</option></select>
              </div>
            </div>
            <div style={{ padding: '4px 8px', fontSize: '11px', color: '#546e7a' }}>Durasi Rata - Rata</div>
          </div>
        </div>
      </div>
      </>)}

      {/* ===================== MODALS ===================== */}

      {/* Pengaturan Fiber Modal (Settings) */}
      {(isSettingsOpen || isFiberSettingsOpen) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '440px' }}>
            <div className="modal-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><SettingsIcon size={14} /> Pengaturan Fiber</span>
              <button onClick={() => { setIsSettingsOpen(false); setIsFiberSettingsOpen(false); }} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              {/* Section: Pengaturan Fiber */}
              <div className="fiber-settings-section">
                <div className="fiber-settings-title">Pengaturan Fiber</div>
                <div style={{ padding: '12px', border: '1px solid #cfd8dc', borderRadius: '2px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: '#1976d2' }}>
                    <input type="radio" name="fiberMode" checked={fiberSettings.mode === 'number'} onChange={() => setFiberSettings(prev => ({...prev, mode: 'number'}))} />
                    Gunakan Nomor Fiber
                  </label>
                  <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#546e7a', fontSize: '12px' }}>Mulai Nomor Fiber</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="number" min="1" max="9999" value={fiberSettings.startNumber} onChange={(e) => setFiberSettings(prev => ({...prev, startNumber: parseInt(e.target.value) || 1}))} disabled={fiberSettings.mode !== 'number'} style={{ width: '80px', padding: '3px 6px', border: '1px solid #b0bec5', fontSize: '12px', textAlign: 'right' }} />
                        <span style={{ color: '#90a4ae', fontSize: '11px' }}>1 - 9999</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#546e7a', fontSize: '12px' }}>Interval Nomor Fiber</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="number" min="1" max="100" value={fiberSettings.intervalNumber} onChange={(e) => setFiberSettings(prev => ({...prev, intervalNumber: parseInt(e.target.value) || 1}))} disabled={fiberSettings.mode !== 'number'} style={{ width: '80px', padding: '3px 6px', border: '1px solid #b0bec5', fontSize: '12px', textAlign: 'right' }} />
                        <span style={{ color: '#90a4ae', fontSize: '11px' }}>1 - 100</span>
                      </div>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#263238' }}>
                    <input type="radio" name="fiberMode" checked={fiberSettings.mode === 'identity'} onChange={() => setFiberSettings(prev => ({...prev, mode: 'identity'}))} />
                    Gunakan Identitas Fiber
                  </label>
                </div>
              </div>

              {/* Section: Gambar Ujung Fiber */}
              <div className="fiber-settings-section">
                <div className="fiber-settings-title">Gambar Ujung Fiber</div>
                <div style={{ padding: '12px', border: '1px solid #cfd8dc', borderRadius: '2px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '40px', fontSize: '12px', color: '#546e7a' }}>A -&gt;B</span>
                    <input type="text" value={fiberSettings.endImageA} onChange={(e) => setFiberSettings(prev => ({...prev, endImageA: e.target.value}))} style={{ flex: 1, padding: '4px 6px', border: '1px solid #b0bec5', fontSize: '12px' }} />
                    <button style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #b0bec5', background: '#f5f6f7', cursor: 'pointer' }}>Membersihkan</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '40px', fontSize: '12px', color: '#546e7a' }}>B -&gt;A</span>
                    <input type="text" value={fiberSettings.endImageB} onChange={(e) => setFiberSettings(prev => ({...prev, endImageB: e.target.value}))} style={{ flex: 1, padding: '4px 6px', border: '1px solid #b0bec5', fontSize: '12px' }} />
                    <button style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #b0bec5', background: '#f5f6f7', cursor: 'pointer' }}>Membersihkan</button>
                  </div>
                </div>
              </div>

              {/* Checkbox: Tunjukan Arah */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <input type="checkbox" checked={fiberSettings.showDirection} onChange={(e) => setFiberSettings(prev => ({...prev, showDirection: e.target.checked}))} />
                Tunjukan Arah
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => { setIsSettingsOpen(false); setIsFiberSettingsOpen(false); }} style={{ padding: '6px 24px', border: '1px solid #b0bec5', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Konfirmasi</button>
                <button onClick={() => { setIsSettingsOpen(false); setIsFiberSettingsOpen(false); }} style={{ padding: '6px 24px', border: '1px solid #b0bec5', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Membatalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#f4f6f8', borderRadius: '4px', minWidth: '800px', maxWidth: '900px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', color: '#263238', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {/* Modal Title Bar */}
            <div style={{ background: '#455a64', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px' }}>YOKOGAWA AQ7933 — Help & Reference</span>
              <button onClick={() => setIsHelpOpen(false)} style={{ background: 'transparent', color: '#cfd8dc', border: '1px solid #78909c', borderRadius: '3px', padding: '2px 10px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
              
              {/* Trace Signatures - Added as requested by user */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#1976d2', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #b0bec5', paddingBottom: '6px', marginBottom: '16px' }}>Trace Signatures Reference</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {/* Connector (Reflective) Block */}
                  <div style={{ background: '#ffebee', borderLeft: '3px solid #f44336', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#c62828', fontWeight: 'bold', marginBottom: '8px' }}>Connector (Reflective)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #ffcdd2', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 10 15 L 45 15 L 48 2 L 52 15 L 90 15" stroke="#d32f2f" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Lonjakan tajam menyerupai jarum akibat pantulan cahaya (Fresnel) dari celah konektor udara.
                    </div>
                  </div>

                  {/* Splice (Non-Reflective) Block */}
                  <div style={{ background: '#fff3e0', borderLeft: '3px solid #ff9800', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#e65100', fontWeight: 'bold', marginBottom: '8px' }}>Splice (Non-Reflective)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #ffe0b2', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 10 5 L 45 5 L 55 15 L 90 15" stroke="#d32f2f" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Penurunan garis seperti anak tangga permanen. Disebabkan oleh peleburan (Penyambungan) atau lekukan.
                    </div>
                  </div>

                  {/* End of Fiber Block */}
                  <div style={{ background: '#e8f5e9', borderLeft: '3px solid #4caf50', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: '8px' }}>End of Fiber</div>
                    <div style={{ background: '#ffffff', border: '1px solid #c8e6c9', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 10 5 L 45 5 L 55 20 M 55 5 L 55 5" stroke="#388e3c" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" strokeDasharray="100,50" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Pola grafik menurun drastis tak terhingga keluar dari batas area visual noise, menandakan ujung potongan atau putusnya kabel fiber optik.
                    </div>
                  </div>
                </div>
              </div>

              {/* Kamus Parameter Info */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#1976d2', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #b0bec5', paddingBottom: '6px', marginBottom: '16px' }}>Kamus Parameter Info</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Wavelength */}
                  <div style={{ background: '#e1f5fe', borderLeft: '3px solid #0288d1', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#0288d1', fontWeight: 'bold', marginBottom: '8px' }}>Wavelength (Panjang Gelombang)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #b3e5fc', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 10 10 Q 20 0 30 10 T 50 10 T 70 10 T 90 10" stroke="#0288d1" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Warna laser yang ditembakkan. Biasanya 1310 nm (untuk cek redaman sambungan) atau 1550 nm (jarak jauh & tahan kelokan).
                    </div>
                  </div>

                  {/* Pulse Width */}
                  <div style={{ background: '#e0f2f1', borderLeft: '3px solid #00796b', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#00796b', fontWeight: 'bold', marginBottom: '8px' }}>Pulse Width (Lebar Pulsa)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #b2dfdb', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 10 15 L 10 5 L 20 5 L 20 15 L 40 15 L 40 5 L 70 5 L 70 15 L 90 15" stroke="#00796b" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
                        <text x="15" y="19" fontSize="4" fill="#00796b" textAnchor="middle">10ns</text>
                        <text x="55" y="19" fontSize="4" fill="#00796b" textAnchor="middle">100ns</text>
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Kecepatan 'kedipan' laser. Kedipan singkat = radar sangat super presisi di jarak dekat. Kedipan lama = tembus jarak berpuluh kilometer.
                    </div>
                  </div>

                  {/* IOR */}
                  <div style={{ background: '#efebe9', borderLeft: '3px solid #5d4037', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#5d4037', fontWeight: 'bold', marginBottom: '8px' }}>IOR (Index of Refraction)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #d7ccc8', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <polygon points="40,20 40,10 90,15 90,20" fill="#d7ccc8" opacity="0.4" />
                        <path d="M 10 5 L 40 10 L 90 15" stroke="#5d4037" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Indeks bias kepadatan kaca optik murni. Mesin menggunakan angka sakti ini untuk me-convert pantulan debu cahaya menjadi hasil kilometer akurat.
                    </div>
                  </div>

                  {/* Distance Range */}
                  <div style={{ background: '#e8eaf6', borderLeft: '3px solid #3f51b5', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#3f51b5', fontWeight: 'bold', marginBottom: '8px' }}>Distance Range (Zona Tembak)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #c5cae9', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <line x1="10" y1="10" x2="90" y2="10" stroke="#3f51b5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <line x1="10" y1="6" x2="10" y2="14" stroke="#3f51b5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <line x1="90" y1="6" x2="90" y2="14" stroke="#3f51b5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <line x1="50" y1="8" x2="50" y2="12" stroke="#3f51b5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <text x="10" y="5" fontSize="5" fill="#3f51b5" textAnchor="middle">0</text>
                        <text x="90" y="5" fontSize="5" fill="#3f51b5" textAnchor="middle">10km</text>
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Batas bentangan maksimal radar alat. Secara teori, apabila panjang kabel asli hanya 20 km, maka jangkauan tembak disetel ke batas 30 km.
                    </div>
                  </div>

                  {/* Data Size / Resolution */}
                  <div style={{ background: '#ede7f6', borderLeft: '3px solid #512da8', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#512da8', fontWeight: 'bold', marginBottom: '8px' }}>Data Size / Resolution</div>
                    <div style={{ background: '#ffffff', border: '1px solid #d1c4e9', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <polyline points="20,15 30,10 40,5 50,5 60,7 70,12 80,15" fill="none" stroke="#d1c4e9" strokeWidth="1" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                        <circle cx="20" cy="15" r="1.5" fill="#512da8"/>
                        <circle cx="30" cy="10" r="1.5" fill="#512da8"/>
                        <circle cx="40" cy="5" r="1.5" fill="#512da8"/>
                        <circle cx="50" cy="5" r="1.5" fill="#512da8"/>
                        <circle cx="60" cy="7" r="1.5" fill="#512da8"/>
                        <circle cx="70" cy="12" r="1.5" fill="#512da8"/>
                        <circle cx="80" cy="15" r="1.5" fill="#512da8"/>
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Kepadatan titik piksel (Data Size) menentukan jarak antar titik (Resolution). Makin kecil meter resolusinya, grafik makin detail mengukur retakan berdekatan.
                    </div>
                  </div>

                  {/* Duration */}
                  <div style={{ background: '#e8f5e9', borderLeft: '3px solid #388e3c', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#388e3c', fontWeight: 'bold', marginBottom: '8px' }}>Duration (Waktu Ukur)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #c8e6c9', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="30" height="30" viewBox="0 0 30 30">
                        <circle cx="15" cy="15" r="12" fill="none" stroke="#388e3c" strokeWidth="2" />
                        <polyline points="15,7 15,15 20,20" fill="none" stroke="#388e3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Lama waktu tembakan (misal: 15 detik). Makin lama, mesin bisa menumpuk dan merata-rata pantulan cahaya (Averaging) sehingga grafiknya makin mulus bersih dari "noise".
                    </div>
                  </div>

                  {/* Total Loss */}
                  <div style={{ background: '#fce4ec', borderLeft: '3px solid #c2185b', padding: '12px', borderRadius: '0 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#c2185b', fontWeight: 'bold', marginBottom: '8px' }}>Total Loss (Redaman Total)</div>
                    <div style={{ background: '#ffffff', border: '1px solid #f8bbd0', borderRadius: '4px', height: '60px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <polyline points="10,2 30,2 30,6 60,6 60,12 80,12 80,18 90,18" fill="none" stroke="#c2185b" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <line x1="80" y1="2" x2="80" y2="12" stroke="#c2185b" strokeWidth="1" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                        <path d="M 82 5 L 85 5 M 82 8 L 85 8" stroke="#c2185b" strokeWidth="0.5" />
                        <text x="89" y="8" fontSize="4" fill="#c2185b">dB</text>
                      </svg>
                    </div>
                    <div style={{ color: '#546e7a', fontSize: '11px', lineHeight: '1.5', flex: 1 }}>
                      Total gabungan semua kerugian/kebocoran dari seluruh ujung. Target absolut: makin tipis nilai dB-nya, pantulan sinyal makin jos!
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Start */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#546e7a', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #b0bec5', paddingBottom: '6px', marginBottom: '10px' }}>Quick Start Guide</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Generate Trace', 'Generates a new randomized fiber trace with random length (0.3–30 km) and measurement parameters.'],
                      ['A/B Marker', 'Drag the red (A) or blue (B) vertical lines on the chart to measure delta distance and 2-point loss (LSA).'],
                      ['Event List (Quiz)', 'Identify each detected event as Splice, Connector, or End of Fiber. Submit answers to check your score.'],
                      ['Panduan (Sidebar)', 'Toggle the right panel to PANDUAN tab for trace signature references and parameter glossary.'],
                    ].map(([label, desc], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eceff1' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: '600', color: '#37474f', width: '140px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{label}</td>
                        <td style={{ padding: '8px 0', color: '#546e7a' }}>{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Difficulty Levels */}
              <div>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#546e7a', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #b0bec5', paddingBottom: '6px', marginBottom: '10px' }}>Simulation Difficulty Levels</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #cfd8dc' }}>
                  <thead>
                    <tr style={{ background: '#eceff1' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#455a64', borderBottom: '1px solid #cfd8dc', width: '110px' }}>Level</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#455a64', borderBottom: '1px solid #cfd8dc' }}>Characteristics</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#455a64', borderBottom: '1px solid #cfd8dc', width: '120px' }}>Target User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Easy', 'No noise. All events (Splice, Connector, End) are clearly visible. Step drops and reflective spikes are unambiguous.', 'Beginner'],
                      ['Normal', 'Low residual noise. Trace closely resembles typical field measurement output.', 'Trainee'],
                      ['Hard', 'High noise floor. Low-loss splices may blend with signal noise. Careful slope analysis required.', 'Technician'],
                      ['Advanced', 'Exponential far-end noise, ghost reflections, clustered micro-events. Simulates degraded/aging cable.', 'Expert'],
                    ].map(([level, desc, target], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eceff1', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '9px 12px', fontWeight: '600', color: '#37474f', verticalAlign: 'top' }}>{level}</td>
                        <td style={{ padding: '9px 12px', color: '#546e7a', verticalAlign: 'top' }}>{desc}</td>
                        <td style={{ padding: '9px 12px', color: '#78909c', verticalAlign: 'top', fontSize: '12px' }}>{target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

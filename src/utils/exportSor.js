export const exportToSOR = (traceData, events, sidebarData) => {
  const defaultName = `Trace_Simulated_${new Date().getTime()}`;
  const fileName = window.prompt("Masukkan nama file untuk disimpan (tanpa ekstensi):", defaultName);
  
  // Jika user menekan Cancel (fileName === null) atau string kosong
  if (!fileName) return; 

  let content = "OTDR Trace Data - Simulated\n";
  content += "Source,AI Generator\n";
  content += `Wavelength,${sidebarData.wavelength} nm\n`;
  content += `Pulse Width,${sidebarData.pulseWidth} ns\n`;
  content += `IOR,${sidebarData.ior}\n`;
  content += `Range,${sidebarData.distanceRange} km\n`;
  content += `Data Points,${sidebarData.dataPoints}\n`;
  content += "\n[Data Points]\n";
  content += "Distance (km),Loss (dB)\n";
  
  traceData.forEach(p => {
    content += `${p.x.toFixed(5)},${p.y.toFixed(3)}\n`;
  });
  
  content += "\n[Events]\n";
  content += "No,Distance (km),Type,Loss (dB),Reflectance (dB)\n";
  
  events.forEach(e => {
    content += `${e.id},${e.distance.toFixed(4)},${e.type},${(e.loss || 0).toFixed(3)},${(e.reflectance || 0).toFixed(3)}\n`;
  });
  
  // Note: Using text/plain but saving as .sor
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const finalFilename = fileName.endsWith('.sor') ? fileName : `${fileName}.sor`;
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

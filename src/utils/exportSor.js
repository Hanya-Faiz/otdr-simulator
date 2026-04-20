export const exportToCSV = (traceData, events, sidebarData) => {
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
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Trace_Simulated_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

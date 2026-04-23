import React, { useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);

export default function OTDRChart({ traceData, cursorA, cursorB, showCursors, onCursorChange }) {
  const chartRef = useRef(null);
  // Store the original full data bounds so Reset Zoom is always reliable
  const originalBounds = useRef({ xMin: 0, xMax: 30, yMin: -40, yMax: 40 });

  // Recalculate original bounds whenever trace data changes
  useEffect(() => {
    if (traceData && traceData.length > 0) {
      const xs = traceData.map(p => p.x);
      const ys = traceData.map(p => p.y);
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const yMin = Math.min(...ys) - 2;
      const yMax = Math.max(...ys) + 2;
      originalBounds.current = { xMin, xMax, yMin, yMax };

      // If chart is already mounted, reset its view to the new data
      if (chartRef.current) {
        chartRef.current.options.scales.x.min = xMin;
        chartRef.current.options.scales.x.max = xMax;
        chartRef.current.options.scales.y.min = yMin;
        chartRef.current.options.scales.y.max = yMax;
        chartRef.current.update('none');
      }
    }
  }, [traceData]);

  // Sync annotation (keeping empty for now)
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.options.plugins.annotation = { annotations: {} };
      chartRef.current.update('none');
    }
  }, [cursorA, cursorB, showCursors, onCursorChange]);

  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Trace (No. 1)',
          data: traceData,
          borderColor: '#e53935',
          backgroundColor: '#e53935',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
          showLine: true
        }
      ]
    };
  }, [traceData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      annotation: { annotations: {} },
      zoom: {
        // No 'original' limits — we manage bounds ourselves to avoid bugs
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: null,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.08,
          },
          pinch: { enabled: true },
          mode: 'x',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        callbacks: {
          label: (ctx) => `Loss: ${ctx.parsed.y.toFixed(3)} dB`,
          title: (ctx) => `Distance: ${ctx[0].parsed.x.toFixed(5)} km`,
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Distance (km)', color: '#546e7a', font: { size: 12 } },
        grid: { color: '#e0e0e0', lineWidth: 1 },
        ticks: { color: '#546e7a' },
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'dB', color: '#546e7a', font: { size: 12 } },
        grid: { color: '#e0e0e0', lineWidth: 1 },
        ticks: { color: '#546e7a', stepSize: 5 },
      }
    }
  };

  // Always reliable reset — restores directly from stored data bounds
  const handleResetZoom = () => {
    if (!chartRef.current) return;
    const { xMin, xMax, yMin, yMax } = originalBounds.current;
    chartRef.current.options.scales.x.min = xMin;
    chartRef.current.options.scales.x.max = xMax;
    chartRef.current.options.scales.y.min = yMin;
    chartRef.current.options.scales.y.max = yMax;
    chartRef.current.update('none');
  };

  // Keyboard pan: shift current view by exact 0.0001 km (x) or 0.05 dB (y)
  const handleKeyDown = (e) => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const STEP_KM = 0.0001;
    const STEP_DB = 0.05;

    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    let newXMin = xScale.min;
    let newXMax = xScale.max;
    let newYMin = yScale.min;
    let newYMax = yScale.max;

    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A':
        newXMin -= STEP_KM; newXMax -= STEP_KM; break;
      case 'ArrowRight': case 'd': case 'D':
        newXMin += STEP_KM; newXMax += STEP_KM; break;
      case 'ArrowUp': case 'w': case 'W':
        newYMin += STEP_DB; newYMax += STEP_DB; break;
      case 'ArrowDown': case 's': case 'S':
        newYMin -= STEP_DB; newYMax -= STEP_DB; break;
      default: return;
    }

    e.preventDefault();
    chart.options.scales.x.min = newXMin;
    chart.options.scales.x.max = newXMax;
    chart.options.scales.y.min = newYMin;
    chart.options.scales.y.max = newYMax;
    chart.update('none');
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', outline: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={handleResetZoom}
        title="Reset tampilan grafik ke kondisi awal"
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 100,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          cursor: 'pointer',
          color: '#333',
        }}
      >
        Reset Zoom
      </button>
      <Scatter ref={chartRef} options={options} data={chartData} />
    </div>
  );
}

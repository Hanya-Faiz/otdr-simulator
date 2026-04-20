import React, { useMemo, useRef } from 'react';
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
  
  // Sync Cursors to chart interactively without full re-render
  React.useEffect(() => {
    if (chartRef.current) {
      chartRef.current.options.plugins.annotation = {
        annotations: showCursors ? {
          cursorA: {
            type: 'line',
            scaleID: 'x',
            value: cursorA,
            borderColor: '#e53935',
            borderWidth: 2,
            borderDash: [5, 5],
            label: { display: true, content: 'A', position: 'end', backgroundColor: '#e53935', color: '#fff', font: { size: 10 } },
            enter(ctx) { ctx.chart.canvas.style.cursor = 'ew-resize'; },
            leave(ctx) { ctx.chart.canvas.style.cursor = 'default'; },
            draggable: true,
            onDrag: function(context, event) {
              if (onCursorChange) onCursorChange('A', context.element.options.value);
            }
          },
          cursorB: {
            type: 'line',
            scaleID: 'x',
            value: cursorB,
            borderColor: '#1e88e5',
            borderWidth: 2,
            borderDash: [5, 5],
            label: { display: true, content: 'B', position: 'end', backgroundColor: '#1e88e5', color: '#fff', font: { size: 10 } },
            enter(ctx) { ctx.chart.canvas.style.cursor = 'ew-resize'; },
            leave(ctx) { ctx.chart.canvas.style.cursor = 'default'; },
            draggable: true,
            onDrag: function(context, event) {
              if (onCursorChange) onCursorChange('B', context.element.options.value);
            }
          }
        } : {}
      };
      chartRef.current.update('none');
    }
  }, [cursorA, cursorB, showCursors, onCursorChange]);

  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Trace (No. 1)',
          data: traceData,
          borderColor: '#e53935', // Yokogawa Red
          backgroundColor: '#e53935',
          borderWidth: 1.5, // Thickened slightly as requested
          pointRadius: 0, // line only
          pointHoverRadius: 4,
          tension: 0, // don't smooth it out too much
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
      legend: {
        display: false
      },
      annotation: {
        annotations: {} // controlled by useEffect
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: null,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        callbacks: {
          label: function(context) {
            return `Loss: ${context.parsed.y.toFixed(3)} dB`;
          },
          title: function(context) {
            return `Distance: ${context[0].parsed.x.toFixed(5)} km`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Distance (km)',
          color: '#546e7a',
          font: { size: 12 }
        },
        grid: {
          color: '#e0e0e0',
          lineWidth: 1
        },
        ticks: { color: '#546e7a' },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'dB',
          color: '#546e7a',
          font: { size: 12 }
        },
        grid: {
          color: '#e0e0e0',
          lineWidth: 1
        },
        ticks: { color: '#546e7a', stepSize: 5 },
      }
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <button 
        onClick={handleResetZoom}
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
          color: '#333'
        }}
      >
        Reset Zoom
      </button>
      <Scatter ref={chartRef} options={options} data={chartData} />
    </div>
  );
}

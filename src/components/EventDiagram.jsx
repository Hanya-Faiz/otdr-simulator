import React from 'react';

export default function EventDiagram({ events, distanceRange }) {
  // We place a START block, then an event block for each event, and eventually an END block.
  
  const endDistanceKm = events.length > 0 ? events[events.length - 1].distance : distanceRange;
  
  return (
    <div className="event-diagram-container">
      {/* Top Ruler area */}
      <div className="event-ruler">
        <div className="ruler-labels">
          <span className="ruler-label left">0,00000 km</span>
          <span className="ruler-label right">{endDistanceKm.toFixed(5)} km</span>
        </div>
        <div className="ruler-ticks">
           {[...Array(20)].map((_, i) => (
             <div key={i} className="ruler-tick" />
           ))}
        </div>
      </div>
      
      {/* Schematic area */}
      <div className="event-blocks-wrapper">
         <div className="event-line-bg"></div>
         
         <div className="event-nodes">
            {/* Start Node */}
            <div className="event-node-group">
               <div className="event-node-box start" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" style={{ marginBottom: '4px' }}>
                    <path d="M 12 6 H 32 V 18 H 12 Z M 32 8 H 36 V 16 H 32 M 8 8 H 12 V 16 H 8" fill="#607d8b" />
                    <rect x="14" y="8" width="16" height="8" fill="#eceff1" />
                  </svg>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#37474f' }}>START</span>
               </div>
               <div className="event-node-distance">0,00m</div>
            </div>
            
            {/* Spacer / Connection to first event */}
            {events.length > 0 && (
               <div className="event-linker">
                  <div className="linker-text top">{(events[0].distance * 1000).toFixed(2)}m</div>
                  <div className="linker-line"></div>
                  <div className="linker-text bottom"></div>
               </div>
            )}
            
            {/* Real Events */}
            {events.map((ev, idx) => {
               const isLast = idx === events.length - 1;
               const nextDist = !isLast ? ((events[idx+1].distance - ev.distance) * 1000).toFixed(2) : ((distanceRange - ev.distance) * 1000).toFixed(2);
               
               let nodeStyle = "event-node-box";
               if (ev.type === 'end') nodeStyle += " end";
               else if (ev.type === 'connector') nodeStyle += " connector";
               else nodeStyle += " splice";
               
               return (
                 <React.Fragment key={ev.id}>
                   <div className="event-node-group">
                      <div className={nodeStyle} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                         {ev.type === 'splice' ? (
                           <svg width="30" height="16" viewBox="0 0 30 16" fill="none" style={{ marginBottom: '4px' }}>
                             <rect x="6" y="4" width="18" height="8" rx="2" fill="#607d8b" />
                             <rect x="2" y="6" width="4" height="4" fill="#cfd8dc" />
                             <rect x="24" y="6" width="4" height="4" fill="#cfd8dc" />
                           </svg>
                         ) : ev.type === 'connector' ? (
                           <svg width="30" height="16" viewBox="0 0 30 16" fill="none" style={{ marginBottom: '4px' }}>
                             <path d="M 10 4 H 20 V 12 H 10 Z m 10 2 h 4 v 4 h -4 m -10 0 H 6 V 6 h 4" fill="#607d8b" />
                           </svg>
                         ) : ev.type === 'normal' ? (
                           <span style={{ height: '20px', display: 'flex', alignItems: 'center', color: '#90a4ae', fontWeight: 'bold' }}>~</span>
                         ) : (
                           <svg width="30" height="16" viewBox="0 0 30 16" fill="none" style={{ marginBottom: '4px' }}>
                             <path d="M 10 4 H 20 V 12 H 10 Z M 20 6 H 24 V 10 H 20 M 6 6 H 10 V 10 H 6" fill="#4caf50" />
                           </svg>
                         )}
                         <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#37474f' }}>{idx + 1}</span>
                      </div>
                      <div className="event-node-distance">{(ev.distance * 1000).toFixed(2)}m</div>
                   </div>
                   
                   {/* Linker to next */}
                   <div className="event-linker">
                      <div className="linker-text top">{!isLast && nextDist + "m"}</div>
                      <div className="linker-line"></div>
                      <div className="linker-text bottom"></div>
                   </div>
                 </React.Fragment>
               )
            })}
            
            {/* End Node (only if last event was not already 'end') */}
            {(events.length === 0 || events[events.length - 1].type !== 'end') && (
               <div className="event-node-group">
                  <div className="event-node-box end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                     <svg width="30" height="16" viewBox="0 0 30 16" fill="none" style={{ marginBottom: '4px', transform: 'scaleX(-1)' }}>
                       <path d="M 10 4 H 20 V 12 H 10 Z m 10 2 h 4 v 4 h -4 m -10 0 H 6 V 6 h 4" fill="#607d8b" />
                     </svg>
                     <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#37474f' }}>END</span>
                  </div>
                  <div className="event-node-distance">{(distanceRange * 1000).toFixed(2)}m</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

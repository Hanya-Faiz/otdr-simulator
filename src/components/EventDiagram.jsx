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
               <div className="event-node-box start">
                  START
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
                      <div className={nodeStyle}>
                         {idx + 1}
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
                  <div className="event-node-box end">
                     END
                  </div>
                  <div className="event-node-distance">{(distanceRange * 1000).toFixed(2)}m</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

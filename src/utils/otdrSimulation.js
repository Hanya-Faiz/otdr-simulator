// This unility generates a simulated OTDR trace.

export const generateOTDRTrace = (
  difficulty = 'Normal',
  totalDistance = 30.0,
  dataPoints = 12501,
  startPower = 35.0,
  attenuationPerKm = 0.20 // dB/km typical for 1550nm
) => {
  const points = [];
  const events = [];
  const dzLength = 0.1; // km dead zone
  
  // Difficulty settings
  let inherentNoise = 0.04;
  let noiseFloor = 5.0;
  let eventLossMin = 0.05, eventLossMax = 0.2; // Splices
  
  if (difficulty === 'Easy') {
     inherentNoise = 0.01;
     noiseFloor = 2.0;
     eventLossMin = 0.5; // Very visible
     eventLossMax = 1.0;
  } else if (difficulty === 'Hard') {
     inherentNoise = 0.15;
     noiseFloor = 12.0;
     eventLossMin = 0.02; // Hard to see
     eventLossMax = 0.1;
  } else if (difficulty === 'Advanced') {
     inherentNoise = 0.35;
     noiseFloor = 18.0;
     eventLossMin = 0.01; // Nightmare
     eventLossMax = 0.05;
  }
  
  // Randomly generate 2-4 events (Advanced gets 4-6)
  const numEvents = difficulty === 'Advanced' ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 2; 
  let lastEventDistance = dzLength * 2;
  
  for (let i = 0; i < numEvents; i++) {
    // Determine distance: ensure it's spaced out, leaving some room at the end
    const remainingDistance = totalDistance - 2 - lastEventDistance;
    if (remainingDistance < 2) break;
    
    // add an event randomly in the next interval (Advanced has clumping)
    let dist = lastEventDistance + 0.5 + Math.random() * (remainingDistance / (numEvents - i));
    if (difficulty === 'Advanced' && i > 0 && Math.random() > 0.7) {
       dist = lastEventDistance + 0.2; // Micro bend / close splices
    }
    
    // Type of event: 0 = splice, 1 = connector
    const isConnector = Math.random() > 0.5;
    
    events.push({
      id: i + 1,
      distance: parseFloat(dist.toFixed(4)),
      type: isConnector ? 'connector' : 'splice',
      loss: isConnector ? (0.2 + Math.random() * 0.5) : (eventLossMin + Math.random() * eventLossMax), // dB loss
      reflectance: isConnector ? -40 + Math.random() * 10 : null, // dB reflectance upward spike
    });
    
    lastEventDistance = dist;
  }
  
  // Add end of fiber
  const endFiberDistance = totalDistance - (0.5 + Math.random() * 1.5);
  events.push({
    id: events.length + 1,
    distance: parseFloat(endFiberDistance.toFixed(4)),
    type: 'end',
    loss: 15,
    reflectance: -30 + Math.random() * 10 
  });
  
  let currentPower = startPower;
  let eventIndex = 0;
  
  for (let i = 0; i < dataPoints; i++) {
    const x = (i / dataPoints) * totalDistance;
    let y = currentPower;
    
    // Initial deadzone spike
    if (x < dzLength) {
      if (x < 0.01) {
        y = startPower + 15; // Front panel reflection
      } else {
        // Exponential decay from spike down to base level
        y = startPower + 15 * Math.exp(-x / 0.02);
      }
    } 
    // Normal trace or event
    else {
      // Base attenuation
      currentPower -= attenuationPerKm * (totalDistance / dataPoints);
      y = currentPower;
      
      // Check if passing an event
      let activeEvent = null;
      if (events[eventIndex] && x >= events[eventIndex].distance) {
        activeEvent = events[eventIndex];
        
        // Apply loss to cumulative power
        currentPower -= activeEvent.loss;
        
        eventIndex++;
      }
      
      // Draw event spike if within small window of connector/end distance
      if (eventIndex > 0) {
        const prevEvent = events[eventIndex - 1];
        const distFromEvent = x - prevEvent.distance;
        
        if (distFromEvent >= 0 && distFromEvent < 0.05) {
          if (prevEvent.type === 'connector' || prevEvent.type === 'end') {
            // Reflected spike
            const spikeHeight = Math.abs(prevEvent.reflectance || -35) / 2; // rough mapping for visual
            y = y + spikeHeight * Math.exp(-distFromEvent / 0.005);
          }
        }
      }
      
      // Add background noise, increases as power drops
      // Typical OTDR dynamic range limits noise floor
      const signalToNoise = y - noiseFloor;
      let noiseLevel = 0;
      
      if (signalToNoise < 10) {
        noiseLevel = (10 - signalToNoise) * 0.1 * (Math.random() - 0.5);
      } 
      if (y < noiseFloor) {
        noiseLevel = 1.0 * (Math.random() - 0.5);
        y = noiseFloor + noiseLevel; 
        // Power drops completely after end
        if (eventIndex > 0 && events[eventIndex - 1].type === 'end') {
             y = noiseFloor + 1.5*noiseLevel;
        }
      } else {
         y += noiseLevel;
      }
       
      // Advanced difficulty exponential distance noise
      if (difficulty === 'Advanced' && x > totalDistance / 2) {
         y += (Math.random() - 0.5) * (x / totalDistance) * 0.2;
      }
       
      // After end of fiber, drop off quickly to noise floor
      if (eventIndex > 0 && events[eventIndex - 1].type === 'end') {
         if (y > noiseFloor + 2) {
            currentPower -= 2; // steep drop
         }
      }
    }
    
    // Add tiny inherent trace noise
    y += (Math.random() - 0.5) * inherentNoise;
    
    points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(3)) });
  }
  
  return { trace: points, events };
};

export const detectEventsFromTrace = (trace) => {
  const events = [];
  let eventId = 1;

  if (trace.length < 100) return events;

  // 1. Moving Average Box Filter to smooth out high-frequency noise
  const windowSize = 7;
  const smoothedTrace = [];
  
  for (let i = 0; i < trace.length; i++) {
    let sum = 0;
    let count = 0;
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(trace.length - 1, i + Math.floor(windowSize / 2));
    
    for (let j = start; j <= end; j++) {
      sum += trace[j].y;
      count++;
    }
    smoothedTrace.push({ x: trace[i].x, y: sum / count });
  }

  // 2. Dynamic Thresholds Detection
  const stride = 15; // wide window to see true drop vs spike
  
  for (let i = stride; i < smoothedTrace.length - stride; i++) {
    if (smoothedTrace[i].x < 0.1) continue; // Skip initial dead zone
    
    const pPast = smoothedTrace[i - stride];
    const pNow = smoothedTrace[i];
    const pFuture = smoothedTrace[i + stride];
    
    // Using simple derivatives on the smoothed curve
    const diffUp = pNow.y - pPast.y;
    const diffDown = pPast.y - pFuture.y;

    // Check connector (spike up then down)
    // Dynamic threshold: reflection must be > 0.3 dB on smoothed line (real spikes are huge)
    if (diffUp > 0.3 && pNow.y - pFuture.y > 0.3) {
      const last = events[events.length - 1];
      if (!last || (pNow.x - last.distance) > 0.1) {
        events.push({
           id: eventId++,
           distance: pNow.x,
           type: 'connector',
           loss: diffUp, 
           rawType: 'AI-Detected (Filtered)'
        });
        i += stride * 2; 
        continue;
      }
    }
    
    // Check end of fiber (massive unrecoverable drop)
    if (diffDown > 5.0) {
      const last = events[events.length - 1];
      if (!last || (pNow.x - last.distance) > 0.2) {
        events.push({
           id: eventId++,
           distance: pNow.x,
           type: 'end',
           loss: diffDown,
           rawType: 'AI-Detected (Filtered)'
        });
        break; 
      }
    }
    
    // Check splice (moderate sudden drop, NO spike)
    if (diffDown > 0.15 && diffDown <= 5.0 && diffUp < 0.15) {
      const last = events[events.length - 1];
      if (!last || (pNow.x - last.distance) > 0.1) {
        // Confirm it's a permanent drop by checking average of future 10 points
        let futSum = 0;
        let pAvgFuture = i + stride + 10 < smoothedTrace.length ? i + stride + 10 : smoothedTrace.length - 1;
        for(let k=i+stride; k<pAvgFuture; k++) { futSum += smoothedTrace[k].y; }
        let avgFut = futSum / (pAvgFuture - (i+stride));
        
        if (pPast.y - avgFut > 0.15) {
            events.push({
               id: eventId++,
               distance: pNow.x, 
               type: 'splice',
               loss: pPast.y - avgFut, // true loss
               rawType: 'AI-Detected (Filtered)'
            });
            i += stride * 2;
        }
      }
    }
  }
  return events;
};

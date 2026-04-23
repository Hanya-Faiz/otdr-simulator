// This unility generates a simulated OTDR trace.

export const generateOTDRTrace = (
  difficulty = 'Normal',
  totalDistance = 30.0,
  dataPoints = 12501,
  startPower = 35.0,
  wavelengthString = '1550 nm SM'
) => {
  let attenuationPerKm = 0.22; // Standar Telkom 1550nm/1625nm
  if (wavelengthString && wavelengthString.includes('1310')) {
    attenuationPerKm = 0.35; // Standar Telkom 1310nm
  }

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
  
  // Margin at the end to ensure events don't fall off the trace
  const marginEnd = Math.min(2.0, totalDistance * 0.2); 

  for (let i = 0; i < numEvents; i++) {
    // Determine distance: ensure it's spaced out, leaving room at the end
    const remainingDistance = totalDistance - marginEnd - lastEventDistance;
    if (remainingDistance < totalDistance * 0.05) break; // Not enough room
    
    // add an event randomly in the next interval
    const interval = remainingDistance / (numEvents - i);
    let dist = lastEventDistance + (interval * 0.2) + Math.random() * (interval * 0.6);
    
    if (difficulty === 'Advanced' && i > 0 && Math.random() > 0.7) {
       dist = lastEventDistance + Math.min(0.2, interval * 0.1); // Micro bend / close splices
    }
    
    // Type of event: connector, splice, or normal (noise)
    const rType = Math.random();
    let eventType = 'splice';
    let eLoss = eventLossMin + Math.random() * eventLossMax;
    let ref = null;

    let normalProb = 0.25;
    if (difficulty === 'Hard') normalProb = 0.45;
    if (difficulty === 'Advanced') normalProb = 0.60;

    if (rType > 0.7) {
      eventType = 'connector';
      eLoss = 0.2 + Math.random() * 0.5;
      ref = -40 + Math.random() * 10;
    } else if (rType < normalProb) {
      // Fake event / No Anomaly
      eventType = 'normal';
      eLoss = Math.random() * 0.02; // extremely tiny or zero
    }
    
    events.push({
      id: i + 1,
      distance: parseFloat(dist.toFixed(4)),
      type: eventType,
      loss: eLoss,
      reflectance: ref,
    });
    
    lastEventDistance = dist;
  }
  
  // Add end of fiber
  // Scale the end offset based on total distance
  const endOffsetMax = Math.min(1.5, totalDistance * 0.15);
  const endOffsetMin = Math.min(0.5, totalDistance * 0.05);
  const endFiberDistance = totalDistance - (endOffsetMin + Math.random() * (endOffsetMax - endOffsetMin));
  
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

  // 1. Adaptive Moving Average Box Filter to smooth out high-frequency noise
  const windowSize = Math.max(7, Math.floor(trace.length / 1500));
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
  const stride = Math.max(15, Math.floor(trace.length / 600)); // Scale with resolution
  
  // Predict Noise Floor using the end of the trace
  let endSum = 0;
  const tailCount = Math.min(500, Math.floor(trace.length / 4));
  for(let i = trace.length - tailCount; i < trace.length; i++) {
     endSum += trace[i].y;
  }
  const estimatedNoiseFloor = (endSum / tailCount) + 1.5; // +1.5 dB buffer above absolute floor

  for (let i = stride; i < smoothedTrace.length - stride; i++) {
    if (smoothedTrace[i].x < 0.1) continue; // Skip initial dead zone
    
    // Stop scanning and mark End of Fiber if signal drops permanently into noise floor
    if (smoothedTrace[i].y < estimatedNoiseFloor) {
      const last = events[events.length - 1];
      if (!last || last.type !== 'end') {
         events.push({
            id: eventId++,
            distance: smoothedTrace[i].x,
            type: 'end',
            loss: smoothedTrace[i - stride].y - smoothedTrace[i].y,
            rawType: 'AI-Detected (Filtered)'
         });
      }
      break; 
    }

    const pPast = smoothedTrace[i - stride];
    const pNow = smoothedTrace[i];
    const pFuture = smoothedTrace[i + Math.floor(stride * 1.5)];
    
    // Calculate local noise variance to prevent false positives in high-noise areas
    let noiseVar = 0;
    for (let k = i - Math.floor(stride/2); k <= i + Math.floor(stride/2); k++) {
       noiseVar += Math.abs(smoothedTrace[k].y - trace[k].y);
    }
    const localNoise = noiseVar / stride;
    const noiseThresh = Math.max(0.25, localNoise * 2.5); // Stricter threshold if noisy
    
    // Using simple derivatives on the smoothed curve
    const diffUp = pNow.y - pPast.y;
    const diffDown = pPast.y - pFuture.y;

    // Check connector (spike up then down)
    if (diffUp > noiseThresh * 1.5 && pNow.y - pFuture.y > noiseThresh) {
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
    
    // Check splice (moderate sudden drop, NO spike)
    if (diffDown > noiseThresh && diffDown <= 4.5 && diffUp < noiseThresh * 0.5) {
      const last = events[events.length - 1];
      if (!last || (pNow.x - last.distance) > 0.1) {
        // Confirm it's a permanent drop by checking average of future points (LSA mock)
        let futSum = 0;
        let pAvgFuture = Math.min(smoothedTrace.length - 1, i + stride * 2);
        let validFutureCount = pAvgFuture - (i + stride);
        
        if (validFutureCount > 5) {
            for(let k = i + stride; k < pAvgFuture; k++) { futSum += smoothedTrace[k].y; }
            let avgFut = futSum / validFutureCount;
            const trueLoss = pPast.y - avgFut;
            
            if (trueLoss > noiseThresh * 0.8) {
                events.push({
                   id: eventId++,
                   distance: pNow.x, 
                   type: 'splice',
                   loss: trueLoss,
                   rawType: 'AI-Detected (Filtered)'
                });
                i += stride * 2;
            }
        }
      }
    }
  }
  return events;
};

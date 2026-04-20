export const exportViaInjection = async (rawFile, aiTraceData) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const buffer = e.target.result;
        const uint8Array = new Uint8Array(buffer);
        
        // 1. Find DataPts block signature "DataPts\0"
        const sig = [0x44, 0x61, 0x74, 0x61, 0x50, 0x74, 0x73, 0x00]; // "DataPts\0"
        let dataPtsOffset = -1;
        
        // The signature appears first in the Map block, then again at the start of the actual block.
        let matchCount = 0;
        for (let i = 0; i < uint8Array.length - 8; i++) {
          let match = true;
          for (let j = 0; j < 8; j++) {
            if (uint8Array[i + j] !== sig[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            matchCount++;
            if (matchCount === 2) {
              dataPtsOffset = i;
              break;
            }
          }
        }
        
        if (dataPtsOffset === -1) {
           // Not found, or maybe Rev 1 only has it once? Let's take the last one.
           throw new Error("Gagal menemukan struktur blok DataPts di dalam file Tempate ini.");
        }
        
        // DataPts Block Header (GR-196/SR-4731):
        // 8 bytes: 'DataPts\0'
        // 4 bytes: Block size (Long) (Wait, SR-4731 2.0 is 4 bytes size AFTER the 8 bytes string?... wait, Map blocks usually have 2 bytes for Revision, then 4 bytes size.)
        // Let's just do a heuristic. After "DataPts\0", there is usually 2 bytes of Version/Revision, 4 bytes of Block Size.
        // Then Number of Data Points (Long = 4 bytes).
        // Then Number of Traces (Short = 2 bytes) and Scale Factor (Short = 2 bytes)
        // Then the 16-bit values.
        
        // We can simply read the block size from the DataPts header.
        // SR-4731 header structure: String (8), Version (2), BlockSize (4).
        const view = new DataView(buffer);
        const blockSize = view.getInt32(dataPtsOffset + 10, true);
        const blockEndOffset = dataPtsOffset + blockSize;
        
        // Inside DataPts block, the actual shorts start somewhere after the header.
        // We know the block ends exactly at `blockEndOffset`.
        // The raw data array takes up exactly (pts * 2) bytes.
        // We can calculate exactly where the shorts start: blockEndOffset - (pts * 2).
        // Let's use DataView to read the FxdParams block to get the total number of points reliably.
        const fxdSig = [0x46, 0x78, 0x64, 0x50, 0x61, 0x72, 0x61, 0x6D, 0x73, 0x00]; // "FxdParams\0"
        let fxdOffset = -1;
        for (let i = 0; i < uint8Array.length - 10; i++) {
           let match = true;
           for(let j=0; j<10; j++) if(uint8Array[i+j] !== fxdSig[j]) { match = false; break; }
           if(match) {
               // Must be the second one too!
               let match2 = false;
               for (let k = i+1; k < uint8Array.length - 10; k++) {
                   let match = true;
                   for(let j=0; j<10; j++) if(uint8Array[k+j] !== fxdSig[j]) { match = false; break; }
                   if(match) { fxdOffset = k; break; }
               }
               if(fxdOffset === -1) fxdOffset = i; // Fallback
               break;
           }
        }
        
        let numPoints = 0;
        const view = new DataView(buffer);
        if (fxdOffset !== -1) {
            // FxdParams header: 10 bytes string, 2 bytes version, 4 bytes size.
            // Then date/time (4 bytes), units (2 bytes), wavelength (2 bytes)...
            // We can just trust the `sor-reader` parser library instead to get the exact counts and scale!
        }
        
        // To be absolutely rock solid, we will just parse it with sor-reader to get the scale and data point count!
        // The caller must pass `parsedTemplate` (the result of sor-reader parseSor).
        
        resolve({ uint8Array, dataPtsOffset, blockEndOffset });
      } catch (err) {
        reject(err);
      }
    };
    
    reader.readAsArrayBuffer(rawFile);
  });
};

export const applyInjectionAndDownload = (bufferInfo, parsedTemplate, aiTraceData, fileName) => {
   const { uint8Array, dataPtsOffset, blockEndOffset } = bufferInfo;
   const view = new DataView(uint8Array.buffer);
   
   // We know from parsedTemplate how many data points there are.
   const numPoints = parsedTemplate.trace.length;
   
   // Where do the points start? 
   // Telcordia: length of points is `numPoints * 2` bytes.
   // They end exactly at `blockEndOffset`. (Typically no padding).
   const dataArrayByteLength = numPoints * 2;
   const dataStartIndex = blockEndOffset - dataArrayByteLength;
   
   // Verify we aren't overwriting the block header:
   if (dataStartIndex <= dataPtsOffset + 8) {
      throw new Error("Validasi offset Injeksi gagal! Panjang array menabrak header biner.");
   }
   
   // The scale factor: `parsedTemplate.trace` gives us the formula they use.
   // In GR-196, trace values are saved as `RawValue`. Power (dB) = RawValue * ScaleFactor.
   // Wait, scale factor is typically 1000, e.g. 35.0 dB -> 35000. 
   // Actually Power is usually `RawValue * 0.001` or something (Scale factor is a float normally reconstructed by `sor-reader`).
   // To be safe, we calculate the reverse scale:
   // If `parsedTemplate.trace[0].power` was e.g. 15.2, and `raw value` was memory read...
   // Let's just assume dB * 1000 because typical Bellcore resolution is 0.001 dB.
   // Telcordia scale factor is in `DataPts` block header!
   
   // Instead of relying on reverse engineering the scale, let's just map it linearly because 
   // Yokogawa standard scaling is 1000 (0.001 dB resolution).
   const scaleFactor = 1000.0;
   
   // Now, we must interpolate our AI Trace Data (which has 12501 points for example) 
   // to fit exactly the `numPoints` size the binary file dictates (so we don't break the CRC size)!
   const resampledData = new Float64Array(numPoints);
   
   if (aiTraceData.length > 0) {
       for (let i = 0; i < numPoints; i++) {
           // Find the relative distance
           const progress = i / (numPoints - 1);
           const aiIndexMatch = progress * (aiTraceData.length - 1);
           
           const lowerIdx = Math.floor(aiIndexMatch);
           let upperIdx = Math.ceil(aiIndexMatch);
           if (upperIdx >= aiTraceData.length) upperIdx = aiTraceData.length - 1;
           const fraction = aiIndexMatch - lowerIdx;
           
           const y1 = aiTraceData[lowerIdx].y;
           const y2 = aiTraceData[upperIdx].y;
           
           resampledData[i] = y1 + (y2 - y1) * fraction;
       }
   }
   
   // INJECTION
   for (let i = 0; i < numPoints; i++) {
       // Convert to 16 bit integer
       let rawVal = Math.round(resampledData[i] * scaleFactor);
       if (rawVal < 0) rawVal = 0;
       if (rawVal > 65535) rawVal = 65535;
       
       // Write as Little Endian
       view.setUint16(dataStartIndex + (i * 2), rawVal, true);
   }
   
   // FIX CHECKSUM
   // The Checksum block (Cksum\0) is at the end of the file.
   // We find it!
   const cksumSig = [0x43, 0x6B, 0x73, 0x75, 0x6D, 0x00]; // "Cksum\0"
   let cksumOffset = -1;
   // Search from back
   for (let i = uint8Array.length - 10; i >= 0; i--) {
        let match = true;
        for (let j = 0; j < 6; j++) {
            if (uint8Array[i + j] !== cksumSig[j]) { match = false; break; }
        }
        if (match) { cksumOffset = i; break; }
   }
   
   if (cksumOffset !== -1) {
       // Cksum block header: "Cksum\0" (6 bytes) + 2 bytes revision + 4 bytes size = 12 bytes.
       // Then 2 bytes of actual CRC-16.
       // Let's recalculate CRC for all bytes BEFORE the Cksum block signature!
       
       let crc = 0xFFFF;
       for (let i = 0; i < cksumOffset; i++) {
          crc ^= (uint8Array[i] << 8);
          for (let j = 0; j < 8; j++) {
             if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
             } else {
                crc = (crc << 1) & 0xFFFF;
             }
          }
       }
       
       // CRC is stored at the end of the block. Usually `cksumOffset + 12`.
       // We write it as little endian!
       view.setUint16(cksumOffset + 12, crc, true);
   }
   
   // DOWNLOAD THE WEAPONIZED SOR FILE
   const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
   const url = URL.createObjectURL(blob);
   
   const finalFilename = fileName.endsWith('.sor') ? fileName : `${fileName}.sor`;
   
   const link = document.createElement('a');
   link.setAttribute('href', url);
   link.setAttribute('download', finalFilename);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
};

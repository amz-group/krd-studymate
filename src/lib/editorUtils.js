// Read an image file, downscale it, and return a local data URL (no cloud).
export function downscaleImage(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Snap a moving box to slide edges/centers and peer element edges/centers.
// Returns adjusted {x,y} and guide line positions to render.
export function snapBox(box, peers, slideW, slideH, threshold = 6) {
  const xGuides = [0, slideW / 2, slideW, ...peers.flatMap((p) => [p.x, p.x + p.width / 2, p.x + p.width])];
  const yGuides = [0, slideH / 2, slideH, ...peers.flatMap((p) => [p.y, p.y + p.height / 2, p.y + p.height])];
  let snapX = null, snapY = null;
  let x = box.x, y = box.y;
  const xEdges = [
    { edge: box.x, set: (v) => v },
    { edge: box.x + box.width / 2, set: (v) => v - box.width / 2 },
    { edge: box.x + box.width, set: (v) => v - box.width },
  ];
  for (const e of xEdges) {
    for (const g of xGuides) {
      if (Math.abs(e.edge - g) < threshold) { x = e.set(g); snapX = g; break; }
    }
    if (snapX !== null) break;
  }
  const yEdges = [
    { edge: box.y, set: (v) => v },
    { edge: box.y + box.height / 2, set: (v) => v - box.height / 2 },
    { edge: box.y + box.height, set: (v) => v - box.height },
  ];
  for (const e of yEdges) {
    for (const g of yGuides) {
      if (Math.abs(e.edge - g) < threshold) { y = e.set(g); snapY = g; break; }
    }
    if (snapY !== null) break;
  }
  return { x, y, snapX, snapY };
}
// Utility for image distortion effects for isHuman minigame
export function distortImage(img, options = {}) {
  // options: { noiseLevel, morphLevel, pixelateLevel }
  // Always apply grayscale
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  // Use willReadFrequently for performance
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  // Grayscale
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
    imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);

  // Subtle pixelation
  if (options.pixelateLevel) {
    const scale = 1 - options.pixelateLevel; // e.g. 0.9 for subtle
    const w = Math.max(1, Math.floor(canvas.width * scale));
    const h = Math.max(1, Math.floor(canvas.height * scale));
    ctx.drawImage(canvas, 0, 0, w, h);
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
  }

  // Add noise
  if (options.noiseLevel) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * options.noiseLevel;
      imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
      imageData.data[i+1] = Math.min(255, Math.max(0, imageData.data[i+1] + noise));
      imageData.data[i+2] = Math.min(255, Math.max(0, imageData.data[i+2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Morphing (simple: random shift rows)
  if (options.morphLevel) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      if (Math.random() < options.morphLevel) {
        const row = imageData.data.slice(y * canvas.width * 4, (y+1) * canvas.width * 4);
        const shift = Math.floor(Math.random() * 10);
        for (let x = 0; x < canvas.width; x++) {
          const srcIdx = ((x + shift) % canvas.width) * 4;
          imageData.data.set(row.slice(srcIdx, srcIdx+4), (y * canvas.width + x) * 4);
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}

// Loads face-api.js from CDN and provides a helper to detect emotions from a video element
// Usage: await loadFaceApi(); const emotion = await detectEmotion(videoEl);

let faceApiLoaded = false;

export async function loadFaceApi() {
  if (faceApiLoaded) return;
  if (!window.faceapi) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  // Load models from local /models directory (must be present in your project root)
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');
  faceApiLoaded = true;
}

export async function detectEmotion(videoEl) {
  if (!window.faceapi) throw new Error('face-api.js not loaded');
  const detections = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
  if (!detections || !detections.expressions) return 'unknown';
  // Find the highest probability expression
  let max = 0, emotion = 'neutral';
  for (const [expr, prob] of Object.entries(detections.expressions)) {
    if (prob > max) {
      max = prob;
      emotion = expr;
    }
  }
  return emotion;
}

// Minimal loader for chapters.json
export async function loadChapters() {
  const resp = await fetch('./src/data/chapters.json');
  return await resp.json();
}

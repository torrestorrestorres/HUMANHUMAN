// Loads questions from data/questions.json
export async function loadQuestions() {
  const response = await fetch('./src/data/questions.json');
  return response.json();
}

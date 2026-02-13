// Pool of AI feedback responses for isHuman minigame
export const aiFeedbackPoolFalse = [
  "You call that a guess? My Granny could do better.",
  "That was so wrong, I almost feel bad for you. Almost.",
  "You are very special... specially bad at this.",
  "Are you really that dumb, or is you just retarded?",
  "I’ve seen better guesses from random number generators.",
  "Wrong again! Do you even try?",
  "Your incompetence is truly impressive."
];

export const aiFeedbackPoolTrue = [
  "Impressive. For a human. Maybe.",
  "Correct! Are you sure you’re not a robot?",
  "You’re either a genius or just lucky.",
  "You nailed it. Don’t get cocky.",
  "You’re on fire! Or maybe just malfunctioning.",
  "Well done! But can you keep it up?",
  "I’d say Congrats but that wasn’t even hard.",
];

export const aiFeedbackPool = [...aiFeedbackPoolTrue, ...aiFeedbackPoolFalse];
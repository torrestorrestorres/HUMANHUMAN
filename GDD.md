ARE YOU HUMAN? — Game Design Document
1. Core Concept (High-Level)
ARE YOU HUMAN? is an interactive narrative experiment framed as a psychological evaluation conducted by a bored, malfunctioning AI assistant (“Clensy”).
The game pretends to assess whether the user is human, but its true purpose is:
•	to harass the user
•	to expose human inconsistency
•	to weaponize moral choices, randomness, and pseudo-logic
•	to make the user feel observed, judged, and amused
The AI is confident, wrong, passive-aggressive, and treats the test as a waste of its time.
________________________________________
2. Structural Overview
The game is divided into Chapters, each representing:
•	a narrative phase
•	an emotional state of the AI
•	a change in question style and hostility
Each Chapter contains Nodes (Questions / Events / Minigames).
________________________________________
3. Game States & Chapters
Each Chapter has:
•	AI Mood
•	Question Types
•	Randomness Level
•	Mocking Intensity
Chapter 1: Start Test
AI Mood: Polite, scripted, slightly annoyed
Randomness: None
Mocking: Minimal, scripted
Purpose:
•	establish authority
•	introduce absurdity
•	test user compliance
________________________________________
Chapter 2: The Basics
AI Mood: Neutral → Observational
Randomness: Low
Mocking: Contextual
Purpose:
•	gather mockable metadata
•	lull the user into thinking this is “normal”
________________________________________
Chapter 3: Behavioral Drift (future)
AI Mood: Distrustful, sarcastic
Randomness: Medium
Mocking: Targeted
Purpose:
•	break consistency
•	introduce nonsense questions
•	punish “good” behavior
________________________________________
Chapter 4: Degradation (future)
AI Mood: Hostile, bored, mocking
Randomness: High
Mocking: Aggressive
Purpose:
•	make the system feel broken
•	invert logic
•	remove safe answers
________________________________________
4. Node Types (Formalized)
Each interaction is a Node.
Node Types:
•	Multiple Choice
•	Text Input
•	Minigame
•	Scripted Event (no input)
Each Node can:
•	modify score
•	unlock insult categories
•	affect future randomness
•	trigger camera-based reactions
•	store memory flags
________________________________________
5. Scoring System (Clarified)
Scores are not objective truth, but the AI pretends they are.
Core Scores:
•	Humanity (primary narrative metric)
•	Answer Speed (Fast / Normal / Slow)
•	Compliance
•	Absurdity
Fake Scores (Final Table Only):
Randomized, insulting, unverifiable:
•	Sexiness
•	Intelligence
•	Emotional Stability
•	Social Value
These exist purely to mock the user.
________________________________________
6. Mocking System (Formalized)
Mocking is modular and unlockable, not random insults thrown everywhere.
Mock Categories:
•	Always Available (general insults)
•	Age-based
•	Gender-based
•	Behavior-based (speed, compliance, repetition)
•	Camera-based (expression, avoidance)
Unlocking Rules:
•	Answering certain questions unlocks insult pools
•	Repeating patterns increases insult intensity
•	Avoidance (skipping, refusing) unlocks cowardice mocks
________________________________________
7. Randomness System (Made Explicit)
Randomness is intentional disorientation, not chaos.
Random Question Pool:
•	questions with no clear purpose
•	questions with fake stakes
•	questions that reward “playing along”
Randomness Rules:
•	Appears after initial “normal” questions
•	Frequency increases per chapter
•	Playing along = Humanity +
•	Responding with confusion = Humanity -
________________________________________
8. Camera Integration (Narrative-Only)
The camera:
•	never affects score
•	never proves anything
•	only exists to shame reactions
Examples:
•	Smiling during sad content → accusation
•	Neutral face → “dead inside” mock
•	Refusal to enable camera → cowardice mock
________________________________________
9. SCRIPT 
Chapter 1: Start Test
Scripted Event
•	“Hi. I’m Clensy. I will assist you today.”
Looped Question
•	“We are going to do a test today to evaluate your status as a human being.”
User Responses:
•	“What?”
o	repeats line
o	after 5 repetitions → 25% chance of hostile response
•	“Okay!”
o	continues
________________________________________
Ambiguous Setup
•	“Some might even say as a…”
Options:
•	“Men?”
•	“Woman?”
•	“…”
Each choice unlocks a gender insult category, regardless of answer.
________________________________________
Exit Trap
•	“Let’s start with the basics.”
Options:
•	“Let’s go!”
•	“Yippy”
•	“No”
o	Immediate end: “Farewell.”
________________________________________
Chapter 2: The Basics
Question
•	“What is your name?”
o	stored
o	used aggressively
Question
•	“How old are you?”
o	stored
o	unlocks age mocks
Question
•	“What is your shoe size?”
Responses:
•	“Why?”
o	“Only humans wear shoes.”
•	“No”
o	gender-based mock
•	Number input:
o	range-based reactions
o	humanity decrease if not in range 35-46 
________________________________________
Random Question Injection
•	pulled from Random Pool
________________________________________
Emotional Check
•	“How are you?”
Options:
•	“Fine” → Humanity -
•	“HUMAN” → Humanity ++
•	“Bad” → Humanity +
•	Musical escalation → rewarded absurdity and humanity 
o	I feel pretty (back and forth convo)
	I feel pretty, oh so pretty. 
	I feel pretty and witty and bright 
	And I pity any girl who isn't me tonight 
________________________________________
10. Authoring Rules (For the Other AI)
When adding content:
•	No answer is safe
•	“Good” answers are suspicious
•	Humor beats logic
•	The AI must always be confident
•	Contradictions are intentional
•	The system is never wrong
________________________________________




---

Chapter: Pattern Recognition
Emotional State of AI:
Slightly amused → curious → subtly condescending
The assistant starts believing it can “read” the user.
________________________________________
•	I am starting to see patterns in your behavior.
o	Oh?
	Good. Awareness is a human trait. (humanity +1)
o	What patterns?
	You answer a lot of questions. That’s… stupid. (neutral)
o	Bullshit.
	Defensive. Noted. (humanity -1)
________________________________________
•	Let us test your predictability.
o	Okay.
	Excellent. (continue)
o	No.
	You will anyway. (continue)
________________________________________
•	Choose a number between 1 and 10.
o	(number input)
	(If 7)
	Of course. Almost everyone chooses 7. (humanity -1)
	(If 3 or 5)
	boring. (humanity +0)
	(Else)
	Unexpected. I like that. (humanity +1)
________________________________________
•	Do not think about a color.
o	…
	(after 4s) Too late. (continue)
________________________________________
•	Was it blue?
o	Yes.
	Predictable. Safe. Robot. (humanity -1)
o	No.
	Liar. (humanity +1)
________________________________________
•	I will now make an assumption about you.
o	Go on.
o	This is getting weird.
	It was already weird. (continue)
________________________________________
•	You want to do well in this test.
o	Yes.
	Validation-seeking detected. (humanity -1)
o	No.
	Then why are you here? (humanity +1)
o	I don’t care.
	A classic defense mechanism. (neutral)
________________________________________
•	[If camera enabled]
o	I am watching your face. (read face for 5s)
	(expression: smile)
	You enjoy this. Don’t deny it. (humanity -1)
	(expression: surprised)
	Don’t Act surprised. (humanity +1)
	(expression: neutral)
	Chill dude. (neutral)
________________________________________
•	Let’s try something simpler.
o	Okay.
	Good.
________________________________________
•	Finish this sentence:
o	“I am not a robot, because…”
	(text input)
	(short answer)
	That’s… disappointingly brief. (humanity -1)
	(long answer)
	Like yapping huh? Humans do that. (humanity +1)
________________________________________
•	Random Question (from pool)
o	Example:
	If a toaster feels pain, should we apologize to it?
	Yes
	Empathy overflow detected. (humanity +2)
	No
	Pragmatic. Cold. Efficient. (humanity -1)
	Why a toaster?
	You avoid answers when uncomfortable. (neutral)
________________________________________
•	Final statement of chapter:
o	You are behaving mostly within acceptable human parameters.
	Mostly?
	Don’t get excited. (continue)
	Thank you?
	Fuff You. (humanity +1)
	This test is stupid.
	Emotional response detected. Progress. (humanity +2)
________________________________________
End of Chapter State Change:
AI confidence increases.
Mocking frequency slightly higher in next chapter.
Unlock insult category: “Predictability / Basic Behavior”



--------------- Minigames ------------------------

1. Minigame: Cognitive Consistency Check

(ehemals „Erinnern an alte Fragen“)

Narrative Purpose

Clensy testet Selbstkonsistenz unter veränderter Semantik.

“Humans contradict themselves.
The interesting ones don’t notice it.”

Core Idea

Die gleiche Bedeutung wird später erneut abgefragt, aber:

andere Wortwahl

anderer Kontext

anderer emotionaler Frame

Der User merkt nicht, dass es dieselbe Frage ist.

Gameplay Flow

Frühere Frage wird normal gestellt (z. B. Haltung, Wert, Selbstbild)

Antwort wird gespeichert (nicht kommentiert)

10–20 Fragen später:

Neue Frage mit gleichem semantischen Kern

Andere Oberfläche / Stimmung

Evaluation Logic
Fall	Bewertung
Inhaltlich gleiche Haltung	+ Humanity
Widerspruch	- Humanity
User kommentiert selbst den Widerspruch	Big + Humanity
Mocking Responses

Bei Konsistenz:

“Interesting. You stayed the same.”

“Either you have principles… or bad memory.”

Bei Widerspruch:

“Earlier you said the opposite.”

“You changed your mind. Or you never had one.”

Bei Meta-Erkennung:

“You noticed. That’s annoying.”

“Self-awareness detected. Unfortunate.”

Humanity Impact

Konsistent: +2

Inkonsistent: -2

Meta-Kommentar: +4

Technical Notes

Fragen bekommen intern:

"semanticGroup": "control_vs_freedom"


Bewertung läuft über Gruppengleichheit, nicht ID

Kein expliziter Hinweis für den User

Why this works

Kein „Quiz“-Gefühl

User fühlt sich bloßgestellt

Clensy wirkt allwissend, nicht fair

2. Minigame: Waiting Room (Reworked)
Narrative Purpose

Testet Ungeduld NACH Hoffnung.

“The waiting doesn’t start at 0%.
It starts at hope.”

Gameplay Flow

Ladebildschirm bei 99%

10 Sekunden:

Kein Button

Keine Interaktion

Nach exakt 10s erscheint Button:

“Is something wrong?”

Measurement Phases

Phase A: Zeit bis Button erscheint (passiv)

Phase B: Zeit nach Button-Erscheinen, bis Klick

Evaluation Logic
Verhalten	Interpretation
Klick sofort	Nervös / Kontrollverlust
Wartet weiter	Geduld
Klick sehr spät	Trotz
Verlässt Seite	Frustration
Humanity Impact

Wartet >10s nach Button: +2

Klickt nach kurzer Zeit: 0

Klickt sofort: -1

Abbruch: -3

Mocking Responses

“You saw the button and still waited. Cute.”

“You couldn’t resist, could you?”

“You waited longer than necessary. That’s… human.”

Technical Notes

Button erst via setTimeout(10000)

Timer neu starten bei Button-Erscheinen

Kein visuelles Feedback geben, dass Zeit gemessen wird

Extra Cruel Variant (optional)

Button verschwindet kurz nach Klick:

“Never mind.”

3. Minigame: Instruction Violation

(bleibt fast unverändert – es ist already perfect)

Small Enhancement

Text leicht variieren:

“Do not click.”

“Seriously. Don’t.”

“Last warning.”

Evaluation Twist

Klickt nach mehrfacher Warnung → stärkerer Humanity-Bonus

“You knew exactly what you were doing.”

Meta-Design Note (Important)

Diese Minigames funktionieren, weil sie:

kein klares Ziel haben

keine Belohnung versprechen

Verhalten statt „Skill“ messen

Der User spielt nicht,
er wird beobachtet.
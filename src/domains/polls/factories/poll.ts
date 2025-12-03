import { InferInsertModel } from "drizzle-orm";

import { pollsTable } from "@/src/database/schema";
import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import { Poll, PollRecord } from "~/domains/polls/models/poll";
import { CATEGORY_CODES } from "~/domains/shared/categories";

const poll: Poll = {
	id: 1,
	question: "What is your favorite programming language?",
	status: "open",
	answerType: "single",
	openingTime: new Date("2025-01-01T00:00:00Z"),
	closingTime: new Date("2025-01-31T23:59:59Z"),
	createdBy: "123e4567-e89b-12d3-a456-426614174000",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-01T00:00:00Z"),
	categoryCode: "js",
	codeBlock: null,
	codeSandboxExample: null,
	pollNumber: null,
	explanation: null,
};

const pollRecord: PollRecord = {
	id: 1,
	question: "What is your favorite programming language?",
	status: "open",
	answer_type: "single",
	opening_time: new Date("2025-01-01T00:00:00Z"),
	closing_time: new Date("2025-01-31T23:59:59Z"),
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date("2025-01-01T00:00:00Z"),
	updated_at: new Date("2025-01-01T00:00:00Z"),
	category_code: "js",
	code_sandbox_example: null,
	code_block: null,
	poll_number: null,
	explanation: null,
};

// For seeding, we need a version without ID to let the database auto-generate it
const seedPollRecord: Omit<PollRecord, "id"> = {
	question: "What is your favorite programming language?",
	status: "open",
	answer_type: "single",
	opening_time: new Date("2025-01-01T00:00:00Z"),
	closing_time: new Date("2025-01-31T23:59:59Z"),
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date("2025-01-01T00:00:00Z"),
	updated_at: new Date("2025-01-01T00:00:00Z"),
	category_code: "js",
	code_sandbox_example: null,
	code_block: null,
	poll_number: null,
	explanation: null,
};

export const createMockPoll = createMockDataFactory<Poll>(poll);

/**
 * Factory for creating mock PollRecord objects (database format) for testing
 */
export const createMockPollRecord =
	createMockDataFactory<PollRecord>(pollRecord);

/**
 * Factory for creating database insert model objects for seeding
 */
export const createSeedPoll =
	createMockDataFactory<Omit<InferInsertModel<typeof pollsTable>, "id">>(
		seedPollRecord
	);

/**
 * Common poll questions that can be used for both testing and seeding
 */
export const pollQuestions = [
	// CSS Questions
	'In CSS, the "*" selector does exist, what effects of this selector can you list?',
	"For CSS devs this might be a no-brainer, but what flex property makes sure items are forced on multiple lines when they don't fit their container?",
	"In CSS, for readability it's important to have vertical spacing for text inbetween, what property do you use that make your text look neat and clean?",
	"In CSS, the position property was implemented long ago, which values from below remove the elements out of the document flow?",
	"Grid or flexbox, the choice isn't always true, which one handles two-dimensional layouts through and through?",
	"Z-index stacking can be quite the fright, what creates a new stacking context just right?",
	"Pseudo-classes and pseudo-elements aren't the same you see, which one uses :: and which uses : as the key?",
	"In CSS, specificity determines the winning score, which selector type has the highest value for sure?",
	"Viewport units are responsive design's best friend, which unit represents 1% of viewport height to the end?",
	"CSS custom properties are variables so neat, what syntax prefix makes them complete?",

	// JavaScript Questions
	"In JS, closures are there, what do you know about it, can you share?",
	"Event bubbling and capturing, both exist it's true, which phase happens first when events come through?",
	"Promises and async/await handle async with care, what's returned when you use await to declare?",
	"Array methods are powerful tools for the wise, which method transforms each element to a new guise?",
	"Hoisting in JavaScript can be quite obscure, which declarations are hoisted to be sure?",
	"The 'this' keyword in JS can shift around, in arrow functions what value is bound?",
	"Prototype chain is inheritance in disguise, where does Object.prototype reside?",
	"Template literals bring strings to a new height, what character makes interpolation right?",
	"Rest and spread operators both use three dots you know, but their purposes differ as your code does grow - what's the key difference on show?",
	"Debounce and throttle optimize function calls with flair, which one limits calls to one per time period to spare?",

	// TypeScript Questions
	"In TS, the type system is very strict, what do you know about it, can you share?",
	"Union types in TypeScript let you combine with ease, what operator joins types if you please?",
	"Generics make functions reusable and bright, what syntax wraps the type parameter just right?",
	"Type assertions override the compiler's decision, what two syntaxes accomplish this with precision?",
	"Interfaces and types both define structure with care, what's one thing only interfaces can declare?",
	"TypeScript enums create named constants that stay, what's the default numeric value that starts the array?",
	"Utility types transform existing types with might, which one makes all properties optional and light?",
	"The never type in TypeScript is quite unique indeed, when does a function return never as the guaranteed deed?",
	"Type guards help narrow types down to specifics, what keyword checks if a property exists?",
	"Readonly and const both prevent mutation's call, but which one works on properties overall?",

	// React Questions
	"In React, development goes rapid, synthetic events are built-in, do you know why they are added?",
	"useState and useReducer manage state with care, when does useReducer become the better pair?",
	"React keys help reconciliation work its magic spell, where should you never use array index as well?",
	"useEffect and useLayoutEffect timing differs you see, which one fires before the browser paints the tree?",
	"Controlled and uncontrolled components handle forms with grace, which one lets React be the single source of state's embrace?",
	"React.memo prevents renders that aren't needed today, what comparison does it perform to keep re-renders at bay?",
	"Context provides data without prop drilling's pain, what hook consumes context again and again?",
	"Error boundaries catch errors in components below, which lifecycle method makes this error-catching flow?",
	"Fragments group children without extra nodes in sight, what short syntax creates fragments concise and tight?",
	"Custom hooks encapsulate logic to reuse, what naming convention must they not refuse?",

	// Git Questions
	"Git branches diverge and merge throughout the day, which command creates a new branch right away?",
	"Merge and rebase both integrate code you see, which one preserves commit history as a clean tree?",
	"Git stash saves work without a commit to make, what command applies stashed changes for goodness sake?",
	"Cherry-pick takes commits from another branch's tale, which command shows the commit hash without fail?",
	"Git reset moves HEAD to a commit you choose, what flag keeps changes staged and nothing to lose?",
	"Detached HEAD state can cause confusion and dread, what action puts you in this state instead?",
	"Git tags mark important points in history's flow, which flag creates an annotated tag to show?",
	"Fetch and pull both update your local store, but which one merges changes to your branch for sure?",
	"Git blame shows who changed each line of code, what flag ignores whitespace changes on the road?",
	"Interactive rebase rewrites history with care, what command starts this process to declare?",

	// HTML Questions
	"Semantic HTML gives meaning to structure and form, which element represents a self-contained composition that's the norm?",
	"Meta tags provide info the browser needs to know, which attribute sets the character encoding to show?",
	"Form validation happens before submit's embrace, which attribute requires a field to not be an empty space?",
	"Accessibility landmarks help screen readers navigate, which element represents the main content to dictate?",
	"Image lazy loading saves bandwidth with grace, what attribute value triggers this loading pace?",
	"Data attributes store custom data on elements you see, what prefix makes these attributes valid and free?",
	"The picture element provides responsive images so neat, which child element specifies the fallback to complete?",
	"Input types in HTML5 are many to explore, which one validates email format to be sure?",
	"HTML entities encode special characters with care, what entity represents a non-breaking space to declare?",
	"The dialog element creates modals native and true, which method opens the dialog for the user's view?",

	// General Frontend Questions
	"In Frontend, content-theft is real, what approach can be used to prevent visitors to steal?",
	"Web performance metrics matter for speed, which metric measures time to interactive indeed?",
	"CORS prevents requests from different origins you know, what header allows cross-origin requests to flow?",
	"localStorage and sessionStorage both store client-side, which one persists after the browser window has died?",
	"Service workers enable offline experiences so great, what must be true of URLs they intercept and regulate?",
	"Webpack and Vite both bundle code with care, which one uses native ESM during development to spare?",
	"Progressive Web Apps bring native-like features to the fore, which file defines the app manifest to explore?",
	"Web vitals measure user experience with precision and care, which metric tracks visual stability everywhere?",
	"Content Security Policy prevents XSS attacks with might, which directive restricts script sources just right?",
	"The critical rendering path optimizes initial page load, which resource blocks rendering on the road?",

	// Preference/Opinion Questions (Mix across categories)
	"What is your favorite programming language?",
	"Which frontend framework do you prefer?",
	"Do you use ts?",
	"How often do you write tests?",
	"What is your preferred CSS solution?",
	"What's your approach to responsive design?",
	"How do you handle state management in React?",
	"What's your preferred method for styling components?",
	"How do you optimize web performance?",
	"What testing strategies do you employ?",
	"How do you approach accessibility in your projects?",
	"What's your preferred deployment strategy?",
];

/**
 * Helper to create an array of mock polls with different questions
 */
export const createMockPollArray = (count: number = 3): Poll[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockPoll({
			id: i + 1,
			question: pollQuestions[i % pollQuestions.length],
			categoryCode: i % 2 === 0 ? "js" : "ts",
		})
	);
};

/**
 * Helper to create an array of mock poll records with different questions
 */
export const createMockPollRecordArray = (count: number = 3): PollRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockPollRecord({
			id: i + 1,
			question: pollQuestions[i % pollQuestions.length],
			category_code: i % 2 === 0 ? "js" : "ts",
		})
	);
};

/**
 * Helper to create an array of seed poll records with different questions
 * This is specifically designed for database seeding
 */
export const createSeedPollArray = (
	count: number = 3,
	userId: string = "123e4567-e89b-12d3-a456-426614174000"
): Array<Omit<InferInsertModel<typeof pollsTable>, "id">> => {
	return Array.from({ length: count }, (_, i) =>
		createSeedPoll({
			question: pollQuestions[i % pollQuestions.length],
			created_by: userId,
			category_code: CATEGORY_CODES[i % CATEGORY_CODES.length],
			answer_type: i % 2 === 0 ? "single" : "multiple",
			opening_time: new Date(),
			closing_time: new Date(),
			status: "closed",
		})
	);
};

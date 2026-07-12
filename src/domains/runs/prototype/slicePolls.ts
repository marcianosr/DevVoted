/**
 * Throwaway poll pool for the slice (DVTD-88si). Real polls come from the practice
 * bank later — these exist only so the loop is instantly playable without DB/auth.
 * The content doesn't decide whether the loop is fun; the tag/gate/strip tension does.
 */
import type { SlicePoll } from "./sessionRun";

const BASE_SLICE_POLLS: readonly Omit<SlicePoll, "id">[] = [
	{
		category: "js",
		question:
			"Which method returns the LAST element of an array without removing it?",
		options: [
			{ id: "a", label: "arr.at(-1)", correct: true },
			{ id: "b", label: "arr.pop()", correct: false },
			{ id: "c", label: "arr.last()", correct: false },
		],
	},
	{
		category: "react",
		question: "Which hook runs an effect only once, after the first render?",
		options: [
			{ id: "a", label: "useEffect(fn, [])", correct: true },
			{ id: "b", label: "useEffect(fn)", correct: false },
			{ id: "c", label: "useMemo(fn, [])", correct: false },
		],
	},
	{
		category: "ts",
		question: "What does `keyof` produce for `{ a: 1; b: 2 }`?",
		options: [
			{ id: "a", label: '"a" | "b"', correct: true },
			{ id: "b", label: "1 | 2", correct: false },
			{ id: "c", label: "string", correct: false },
		],
	},
	{
		category: "git",
		question:
			"Which command moves commits from one branch onto another, rewriting history?",
		options: [
			{ id: "a", label: "git rebase", correct: true },
			{ id: "b", label: "git merge", correct: false },
			{ id: "c", label: "git cherry", correct: false },
		],
	},
	{
		category: "css",
		question: "Which property makes a flex item grow to fill free space?",
		options: [
			{ id: "a", label: "flex-grow", correct: true },
			{ id: "b", label: "flex-basis", correct: false },
			{ id: "c", label: "align-self", correct: false },
		],
	},
	{
		category: "react",
		question: "What is the correct key to give list items in React?",
		options: [
			{ id: "a", label: "A stable unique id", correct: true },
			{ id: "b", label: "The array index, always", correct: false },
			{ id: "c", label: "Math.random()", correct: false },
		],
	},
	{
		category: "python",
		question: "Which builds a list of squares 0..4?",
		options: [
			{ id: "a", label: "[x*x for x in range(5)]", correct: true },
			{ id: "b", label: "{x*x for x in range(5)}", correct: false },
			{ id: "c", label: "(x*x for x in range(5))", correct: false },
		],
	},
	{
		category: "js",
		question: "What does `typeof null` return?",
		options: [
			{ id: "a", label: '"object"', correct: true },
			{ id: "b", label: '"null"', correct: false },
			{ id: "c", label: '"undefined"', correct: false },
		],
	},
	{
		category: "ts",
		question: "Which utility type makes every property optional?",
		options: [
			{ id: "a", label: "Partial<T>", correct: true },
			{ id: "b", label: "Required<T>", correct: false },
			{ id: "c", label: "Readonly<T>", correct: false },
		],
	},
	{
		category: "git",
		question: "How do you undo the last commit but KEEP the changes staged?",
		options: [
			{ id: "a", label: "git reset --soft HEAD~1", correct: true },
			{ id: "b", label: "git reset --hard HEAD~1", correct: false },
			{ id: "c", label: "git revert HEAD", correct: false },
		],
	},
];

/**
 * Builds a pool of `count` polls by cycling the base set — repeats are fine here
 * (the practice-bank philosophy: re-seeing a poll tests whether you remember it).
 */
export const buildSlicePool = (count: number): SlicePoll[] =>
	Array.from({ length: count }, (_, index) => {
		const base = BASE_SLICE_POLLS[index % BASE_SLICE_POLLS.length];
		return {
			...base,
			id: `slice-${index}`,
			options: base.options.map((option) => ({ ...option })),
		};
	});

import {
	bandFor,
	ratioOf,
	rungAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";
import { KANTO_COLORS, type KantoColor } from "~/ui/kanto-theme/colors";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { QuestionOption } from "~/ui/kanto-theme/Question.ui";

export type DemoPhase = "enter" | "picked" | "leaving";

export type LoginDemoStep = {
	readonly poll: number;
	readonly phase: DemoPhase;
};

type DemoPoll = {
	readonly category: string;
	readonly categoryColor: KantoColor;
	readonly question: string;
	readonly options: readonly { readonly id: string; readonly label: string }[];
	readonly rightId: string;
};

export const DEMO_POLLS: readonly DemoPoll[] = [
	{
		category: "JavaScript",
		categoryColor: "saffron",
		question: "Which one is a valid arrow function?",
		options: [
			{ id: "a", label: "`function => (a) { }`" },
			{ id: "b", label: "`(a) => a * 2`" },
			{ id: "c", label: "`=> a (a * 2)`" },
		],
		rightId: "b",
	},
	{
		category: "CSS",
		categoryColor: "cerulean",
		question: "Which selector wins on specificity?",
		options: [
			{ id: "a", label: "`.card .title`" },
			{ id: "b", label: "`#title`" },
			{ id: "c", label: "`h2.title`" },
		],
		rightId: "b",
	},
	{
		category: "Git",
		categoryColor: "vermillion",
		question: "Which command lists the commits you have not pushed yet?",
		options: [
			{ id: "a", label: "`git log origin/main..HEAD`" },
			{ id: "b", label: "`git status --ahead`" },
			{ id: "c", label: "`git diff --unpushed`" },
		],
		rightId: "a",
	},
];

export const DEMO_BEATS = {
	pickAt: 1100,
	holdMs: 1650,
	leaveMs: 220,
} as const;

export const FIRST_STEP: LoginDemoStep = { poll: 0, phase: "enter" };
export const SETTLED_STEP: LoginDemoStep = { poll: 0, phase: "picked" };

const DEMO_GATE = 1;
const OPENING_HELD = 20;
const GAIN_PER_RIGHT = 20;
const LETTERS = ["A", "B", "C"] as const;

export const waitFor = ({ phase }: LoginDemoStep): number => {
	if (phase === "enter") return DEMO_BEATS.pickAt;
	if (phase === "picked") return DEMO_BEATS.holdMs;
	return DEMO_BEATS.leaveMs;
};

export const nextStep = ({ poll, phase }: LoginDemoStep): LoginDemoStep => {
	if (phase === "enter") return { poll, phase: "picked" };
	if (phase === "picked") return { poll, phase: "leaving" };
	return { poll: (poll + 1) % DEMO_POLLS.length, phase: "enter" };
};

export type LoginDemoCard = {
	readonly cardKey: string;
	readonly category: string;
	readonly categoryColor: KantoColor;
	readonly counter: string;
	readonly question: string;
	readonly options: readonly QuestionOption[];
	readonly pickedIds: readonly string[];
	readonly coverage: CoverageBarProps;
	readonly leaving: boolean;
	readonly revealed: boolean;
};

const hasAnswered = ({ phase }: LoginDemoStep): boolean => phase !== "enter";

const heldAt = (step: LoginDemoStep): number =>
	OPENING_HELD +
	step.poll * GAIN_PER_RIGHT +
	(hasAnswered(step) ? GAIN_PER_RIGHT : 0);

const coverageAt = (step: LoginDemoStep): CoverageBarProps => {
	const held = heldAt(step);
	const { floor, ok, healthy } = rungAt(DEMO_GATE);

	return {
		held,
		band: bandFor(ratioOf(held), DEMO_GATE).id,
		floor,
		ok,
		healthy,
	};
};

const optionsOf = (poll: DemoPoll, answered: boolean): QuestionOption[] =>
	poll.options.map((option, index) => ({
		id: option.id,
		letter: LETTERS[index],
		label: option.label,
		state: answered && option.id === poll.rightId ? "right" : undefined,
	}));

export const demoCardFor = (step: LoginDemoStep): LoginDemoCard => {
	const poll = DEMO_POLLS[step.poll];
	const answered = hasAnswered(step);

	return {
		cardKey: `poll-${step.poll}`,
		category: poll.category,
		categoryColor: poll.categoryColor,
		counter: `${step.poll + 1} of ${SLICE_WINDOW}`,
		question: poll.question,
		options: optionsOf(poll, answered),
		pickedIds: answered ? [poll.rightId] : [],
		coverage: coverageAt(step),
		leaving: step.phase === "leaving",
		revealed: answered,
	};
};

export type HeroFigure = { readonly value: string; readonly label: string };

export type LoginHero = {
	readonly pitch: string;
	readonly figures: readonly HeroFigure[];
};

export const heroFor = (): LoginHero => ({
	pitch: `Answer daily questions in ${CATEGORY_CODES.length} categories, ramp up your knowledge, keep your coverage score healthy, craft your build and push through the gates.`,
	figures: [
		{ value: `${SLICE_WINDOW}`, label: "polls a day" },
		{ value: `${VICTORY_GATE}`, label: "gates" },
		{ value: "1", label: "Champion" },
	],
});

export const randomLoginTheme = (): KantoColor =>
	KANTO_COLORS[Math.floor(Math.random() * KANTO_COLORS.length)];

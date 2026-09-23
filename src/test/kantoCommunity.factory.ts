import type {
	CommunityScreenProps,
	Standout,
	TurnoutBand,
} from "~/ui/kanto-theme/CommunityScreen.ui";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { PollResultProps } from "~/ui/kanto-theme/PollResult.ui";

import { gateSwatchAt } from "./swatchTrack.factory";

export const COMMUNITY_SHOP_LABEL = "Back to the shop";
export const COMMUNITY_PREP_LABEL = "Prep for Rainbow";
export const COMMUNITY_DEX_LABEL = "Open the Dex";
export const COMMUNITY_MAP_TITLE = "Where everyone is";
export const COMMUNITY_CLIMB_TITLE = "Lavender cleared";

const CLEARED_GATE = 4;
const NEXT_GATE = 5;

const BORDER = {
	js: "/borders/border-js-saffron.svg",
	ts: "/borders/border-ts-lavender.svg",
	css: "/borders/border-css-cerulean.svg",
	react: "/borders/border-react-celadon.svg",
	git: "/borders/border-git-pewter.svg",
	ruby: "/borders/border-ruby-cinnabar.svg",
	html: "/borders/border-html-vermillion.svg",
	frontend: "/borders/border-frontend-fuchsia.svg",
} as const;

const you: ClimberProps = { name: "Marciano", you: true };
const brock: ClimberProps = { name: "Brock", borderUrl: BORDER.git };
const misty: ClimberProps = { name: "Misty", borderUrl: BORDER.css };
const surge: ClimberProps = { name: "Lt. Surge", borderUrl: BORDER.js };
const erika: ClimberProps = { name: "Erika", borderUrl: BORDER.react };
const koga: ClimberProps = { name: "Koga", borderUrl: BORDER.frontend };
const sabrina: ClimberProps = { name: "Sabrina", borderUrl: BORDER.ts };
const blaine: ClimberProps = { name: "Blaine", borderUrl: BORDER.ruby };
const giovanni: ClimberProps = { name: "Giovanni", borderUrl: BORDER.html };

const bands = (): TurnoutBand[] => [
	{
		label: "Answered all five",
		count: "1,041",
		color: "viridian",
		climbers: [you, brock, misty, surge, erika, koga],
		overflow: 1035,
	},
	{
		label: "Partway through",
		count: "106",
		color: "saffron",
		climbers: [sabrina, blaine, giovanni],
		overflow: 103,
	},
	{
		label: "Not started",
		count: "57",
		climbers: [{ name: "Oak" }, { name: "Mr. Fuji" }],
		overflow: 55,
	},
];

const awards = (): Standout[] => [
	{
		title: "Most active",
		climber: koga,
		value: "38 answers today",
	},
	{
		title: "Most knowledgeable",
		climber: sabrina,
		tag: "TypeScript",
		tagColor: "lavender",
		value: "94% right across 31 answers",
	},
	{
		title: "Fastest",
		climber: surge,
		value: "4.1s average answer",
	},
	{
		title: "Biggest bank",
		climber: giovanni,
		value: "2.4 MB banked",
	},
];

const polls = (): PollResultProps[] => [
	{
		state: "revealed",
		index: 0,
		question: "Which method returns the last element of an array?",
		category: "JavaScript",
		outcome: "correct",
		rightShare: 71,
		options: [
			{
				letter: "A",
				label: "at(-1)",
				percent: 71,
				votes: 854,
				isRight: true,
				yours: true,
				voters: [you, misty],
				voterOverflow: 852,
			},
			{
				letter: "B",
				label: "pop()",
				percent: 18,
				votes: 216,
				isRight: false,
				voters: [brock],
				voterOverflow: 215,
			},
			{
				letter: "C",
				label: "slice(-1)",
				percent: 11,
				votes: 132,
				isRight: false,
				voters: [erika],
				voterOverflow: 131,
			},
		],
	},
	{
		state: "revealed",
		index: 1,
		question: "Which property centres a flex child along the main axis?",
		category: "CSS",
		outcome: "wrong",
		rightShare: 22,
		open: true,
		options: [
			{
				letter: "A",
				label: "justify-content",
				percent: 22,
				votes: 265,
				isRight: true,
				voters: [sabrina, koga],
				voterOverflow: 263,
			},
			{
				letter: "B",
				label: "align-items",
				percent: 58,
				votes: 698,
				isRight: false,
				yours: true,
				voters: [you, surge],
				voterOverflow: 696,
			},
			{
				letter: "C",
				label: "place-self",
				percent: 12,
				votes: 144,
				isRight: false,
				voters: [blaine],
				voterOverflow: 143,
			},
			{
				letter: "D",
				label: "text-align",
				percent: 8,
				votes: 96,
				isRight: false,
				voters: [erika],
				voterOverflow: 95,
			},
		],
	},
	{
		state: "revealed",
		index: 2,
		question: "What does a rebase rewrite?",
		category: "Git",
		outcome: "correct",
		rightShare: 64,
		options: [
			{
				letter: "A",
				label: "The commits it replays",
				percent: 64,
				votes: 770,
				isRight: true,
				yours: true,
				voters: [you, brock],
				voterOverflow: 768,
			},
			{
				letter: "B",
				label: "The remote branch",
				percent: 36,
				votes: 433,
				isRight: false,
				voters: [misty],
				voterOverflow: 432,
			},
		],
	},
	{
		state: "revealed",
		index: 3,
		question: "Which utility type makes every property optional?",
		category: "TypeScript",
		outcome: "correct",
		rightShare: 81,
		options: [
			{
				letter: "A",
				label: "Partial<T>",
				percent: 81,
				votes: 975,
				isRight: true,
				yours: true,
				voters: [you, sabrina],
				voterOverflow: 973,
			},
			{
				letter: "B",
				label: "Pick<T, K>",
				percent: 19,
				votes: 228,
				isRight: false,
				voters: [koga],
				voterOverflow: 227,
			},
		],
	},
	{
		state: "revealed",
		index: 4,
		question: "What does Promise.all reject with?",
		category: "JavaScript",
		outcome: "correct",
		rightShare: 48,
		options: [
			{
				letter: "A",
				label: "The first rejection",
				percent: 48,
				votes: 578,
				isRight: true,
				yours: true,
				voters: [you, giovanni],
				voterOverflow: 576,
			},
			{
				letter: "B",
				label: "An array of rejections",
				percent: 52,
				votes: 625,
				isRight: false,
				voters: [blaine],
				voterOverflow: 624,
			},
		],
	},
];

export const kantoCommunity = (): CommunityScreenProps => ({
	header: {
		swatch: gateSwatchAt(CLEARED_GATE),
		title: "Seed #482 · five polls for Wednesday",
		countdown: "6h 12m left",
		countdownColor: "viridian",
		countdownHint: "polls close in",
		stats: [
			{ icon: "community", label: "1,204", hint: "climbers reviewing" },
			{ icon: "gate", label: "37", hint: "gates cleared today" },
			{ icon: "closed", label: "2", hint: "runs closed" },
		],
		shop: { label: COMMUNITY_SHOP_LABEL, onPress: () => {} },
		prep: { label: COMMUNITY_PREP_LABEL, onPress: () => {} },
	},
	climb: {
		title: COMMUNITY_CLIMB_TITLE,
		standing: "Gate 4 of 12 · 310 KB · four configs",
		badge: "4 of 5",
		badgeColor: "viridian",
		reading: "62.4% against the 60% Lavender asked for.",
		note: `The shop stays open until ${gateSwatchAt(NEXT_GATE).gateName} starts, then shuts until your next clear.`,
	},
	turnout: { title: "Who showed up", when: "Today", bands: bands() },
	map: { title: COMMUNITY_MAP_TITLE, summary: "11 climbing · 2 closed" },
	standouts: {
		title: "Standing out",
		summary: "Four of forty awarded today",
		dex: { label: COMMUNITY_DEX_LABEL, onPress: () => {} },
		awards: awards(),
	},
	polls: {
		title: "The five polls",
		summary: "Percentage is how much of the room got it right",
		polls: polls(),
	},
});

export const kantoCommunityBeforePolls = (): CommunityScreenProps => {
	const base = kantoCommunity();
	return {
		...base,
		climb: {
			...base.climb,
			badge: undefined,
			reading: "Five polls waiting. 60% is what Lavender asks for.",
		},
		polls: {
			...base.polls,
			summary: "Answer them to see how the room found them",
			polls: base.polls.polls.map((poll, index) => ({
				state: "sealed",
				index,
				question: poll.question,
			})),
		},
	};
};

export const kantoCommunityFirstClimb = (): CommunityScreenProps => {
	const base = kantoCommunity();
	return {
		...base,
		standouts: { ...base.standouts, summary: undefined, awards: [] },
	};
};

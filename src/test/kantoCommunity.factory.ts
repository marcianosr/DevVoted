import type {
	CommunityScreenProps,
	TurnoutBand,
} from "~/ui/kanto-theme/CommunityScreen.ui";
import type { CategoryLeaderProps } from "~/ui/kanto-theme/CategoryLeader.ui";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { ClimbMapProps } from "~/ui/kanto-theme/ClimbMap.ui";
import type { ClimberCardProps } from "~/ui/kanto-theme/ClimberCard.ui";
import type {
	LadderClimber,
	LadderGate,
} from "~/modules/run/community/application/climbLadder.viewmodel";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import type { PollResultProps } from "~/ui/kanto-theme/PollResult.ui";

import { kantoIncidents } from "./kantoIncidents.factory";
import { gateSwatchAt } from "./swatchTrack.factory";

export const COMMUNITY_SHOP_LABEL = "Back to the shop";
export const COMMUNITY_PREP_LABEL = "Prep for Rainbow";
export const COMMUNITY_MAP_TITLE = "Where everyone is";
export const COMMUNITY_CLIMB_TITLE = "Lavender cleared";
export const COMMUNITY_LEADERS_TITLE = "Category leaders";

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
const oak: ClimberProps = { name: "Oak" };

const YOUR_CHIPS = [
	{ name: "ESLint", slots: 1, version: 2, badges: [] },
	{
		name: "Cache",
		slots: 4,
		badges: [{ label: "locked in", color: "saffron" as const }],
	},
];

const RIVAL_CHIPS = [
	{ name: "Webpack", slots: 3, badges: [] },
	{ name: "Babel", slots: 2, badges: [] },
	{ name: "Jest", slots: 2, badges: [] },
	{ name: "Sentry", slots: 2, badges: [] },
];

const ladderChip = (
	climber: ClimberProps,
	over: Partial<LadderClimber> = {}
): LadderClimber => ({
	id: climber.name.toLowerCase().replace(/\W/g, ""),
	name: climber.name,
	...(climber.borderUrl === undefined ? {} : { borderUrl: climber.borderUrl }),
	you: climber.you === true,
	rival: false,
	rescued: false,
	...over,
});

const cardFor = (
	climber: LadderClimber,
	over: Partial<ClimberCardProps> = {}
): ClimberCardProps => ({
	name: climber.name,
	...(climber.borderUrl === undefined ? {} : { borderUrl: climber.borderUrl }),
	you: climber.you,
	rival: climber.rival,
	perfect: climber.mark === "perfect",
	shaky: climber.mark === "shaky",
	rescued: climber.rescued,
	gate: "gate 4 · Lavender",
	weight: "7 of 8 weight",
	build: YOUR_CHIPS,
	stats: [
		{ label: "current streak", value: "3" },
		{ label: "best category", value: "TypeScript" },
		{ label: "current gate", value: "4" },
	],
	...over,
});

const withCard = (
	climber: LadderClimber,
	over: Partial<ClimberCardProps> = {}
): LadderClimber => ({ ...climber, card: cardFor(climber, over) });

const LADDER_STANDING: Readonly<Record<number, LadderClimber[]>> = {
	1: [withCard(ladderChip(oak), { gate: "gate 1 · Boulder", build: [] })],
	2: [
		withCard(ladderChip(brock, { mark: "shaky" }), {
			gate: "gate 2 · Cascade",
			band: "shaky",
			coveragePercent: 31,
		}),
	],
	3: [
		withCard(ladderChip(misty, { rival: true, mark: "perfect" }), {
			handle: "misty",
			title: "Heavy Pipeline",
			gate: "gate 3 · Thunder",
			band: "perfect",
			coveragePercent: 70,
			weight: "9 of 12 weight",
			storage: "896 KB",
			build: RIVAL_CHIPS,
			stats: [
				{ label: "current streak", value: "6" },
				{ label: "best category", value: "JavaScript" },
				{ label: "current gate", value: "3" },
			],
		}),
	],
	4: [
		withCard(ladderChip(you, { mark: "perfect" }), {
			handle: "marciano",
			band: "perfect",
			coveragePercent: 64,
			storage: "512 KB",
		}),
		withCard(ladderChip(surge, { rescued: true })),
		withCard(ladderChip(erika)),
		withCard(ladderChip(koga), { build: [] }),
		withCard(ladderChip(sabrina)),
	],
	5: [
		withCard(ladderChip(giovanni, { rival: true }), {
			gate: "gate 5 · Rainbow",
		}),
	],
};

const LADDER_FALLEN: Readonly<Record<number, LadderClimber[]>> = {
	3: [
		withCard(ladderChip(blaine, { mark: "shaky" }), {
			gate: "gate 3 · Thunder",
			band: "danger",
			coveragePercent: 18,
			storage: "64 KB",
		}),
	],
};

const CURRENT_GATE = 4;
const BEST_GATE = 6;
const CHARTED_TO = 6;

const ladderGates = (): LadderGate[] =>
	ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		name: swatch.gateName,
		theme: swatch.theme,
		finish: swatch.finish,
		current: swatch.gate === CURRENT_GATE,
		uncharted: swatch.gate > CHARTED_TO,
		best: swatch.gate === BEST_GATE,
		climbers: LADDER_STANDING[swatch.gate] ?? [],
		fallen: (LADDER_FALLEN[swatch.gate] ?? []).map((climber) => ({
			...climber,
			runKey: `run-${climber.id}`,
		})),
	}));

export const kantoClimbMap = (): ClimbMapProps => ({ gates: ladderGates() });

export const kantoClimberCard = (): ClimberCardProps =>
	cardFor(ladderChip(misty, { rival: true, mark: "perfect" }), {
		handle: "misty",
		title: "Heavy Pipeline",
		gate: "gate 3 · Thunder",
		band: "perfect",
		coveragePercent: 70,
		weight: "9 of 12 weight",
		storage: "896 KB",
		build: RIVAL_CHIPS,
		stats: [
			{ label: "current streak", value: "6" },
			{ label: "best category", value: "JavaScript" },
			{ label: "current gate", value: "3" },
		],
	});

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
		climbers: [oak, { name: "Mr. Fuji" }],
		overflow: 55,
	},
];

const held = (
	category: string,
	handle: string,
	streak: number,
	borderUrl?: string
): CategoryLeaderProps => ({
	category,
	leader: {
		handle: `@${handle}`,
		githubLogin: handle,
		figure: `${streak} in a row`,
		...(borderUrl === undefined ? {} : { borderUrl }),
	},
});

const open = (category: string): CategoryLeaderProps => ({
	category,
	claim: "3 in a row claims it",
});

const seats = (): CategoryLeaderProps[] => [
	held("JavaScript", "koga", 21, BORDER.frontend),
	held("CSS", "erika", 18, BORDER.react),
	held("TypeScript", "sabrina", 16, BORDER.ts),
	held("Git", "giovanni", 13, BORDER.html),
	held("React", "blaine", 11, BORDER.ruby),
	held("HTML", "misty", 9, BORDER.css),
	held("Java", "ltsurge", 7, BORDER.js),
	held("Python", "brock", 6, BORDER.git),
	{
		category: "Vue",
		leader: { handle: "@marciano", figure: "5 in a row", you: true },
	},
	open("Ruby"),
	open("General Frontend"),
	open("General Backend"),
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
	map: { title: COMMUNITY_MAP_TITLE, track: kantoClimbMap() },
	incidents: kantoIncidents(),
	leaders: {
		title: COMMUNITY_LEADERS_TITLE,
		summary: "longest run of correct answers · all-time",
		seated: "9 of 12 seated",
		seats: seats(),
		footer: "A seat changes hands when somebody beats it. 3 seats still open.",
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
		leaders: {
			...base.leaders,
			seated: "0 of 12 seated",
			seats: base.leaders.seats.map(({ category }) => open(category)),
			footer:
				"A seat changes hands when somebody beats it. 12 seats still open.",
		},
	};
};

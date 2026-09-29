type Rung = {
	readonly name: string;
	readonly upTo: number;
};

export const RANK_LADDER: readonly Rung[] = [
	{ name: "Poll Newbie", upTo: 35 },
	{ name: "Poll Acquaintance", upTo: 70 },
	{ name: "no-stopping-me-now", upTo: 105 },
	{ name: "'Long Polling'", upTo: 140 },
	{ name: "Poll-a-holic", upTo: 175 },
	{ name: "Poll collector", upTo: 230 },
	{ name: "Poll Nerdo", upTo: 300 },
	{ name: "Permanently plugged in", upTo: 355 },
	{ name: "Truly poll addicted", upTo: 410 },
	{ name: "Polls are a nerds best friend", upTo: 475 },
	{ name: "Poll Elitist", upTo: 575 },
	{ name: "PollXtreme", upTo: 665 },
	{ name: "Polls treasure trove", upTo: 785 },
];

export const TOP_RANK = "Polls Galore!";

export const RANK_COUNT = RANK_LADDER.length + 1;

export const rankFor = (pollsAnswered: number): string =>
	RANK_LADDER.find((rung) => pollsAnswered <= rung.upTo)?.name ?? TOP_RANK;

export const pollsAnsweredIn = (
	counts: readonly { readonly metric: string; readonly count: number }[]
): number => counts.find((row) => row.metric === "polls-answered")?.count ?? 0;

type RankRung = {
	readonly name: string;
	readonly from: number;
};

const FIRST_POLL = 1;

export const RANK_RUNGS: readonly RankRung[] = [
	...RANK_LADDER.map((rung, index) => ({
		name: rung.name,
		from: index === 0 ? FIRST_POLL : RANK_LADDER[index - 1].upTo + 1,
	})),
	{ name: TOP_RANK, from: (RANK_LADDER.at(-1)?.upTo ?? 0) + 1 },
];

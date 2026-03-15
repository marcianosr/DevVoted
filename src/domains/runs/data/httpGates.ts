import type { HttpGate } from "~/domains/runs/models/httpGate";

/**
 * Gate 1 — always the same for every player.
 * No constraint, no reward. A clean slate to start triaging bugs.
 */
export const STARTING_GATE: HttpGate = {
	httpCode: 200,
	bugName: "The Happy Path",
	difficulty: "easy",
	constraint: null,
	reward: null,
};

/**
 * Easier gate options: no constraint, small reward.
 * Randomly picked as the "safer" choice shown to the player.
 */
const EASIER_GATES: HttpGate[] = [
	{
		httpCode: 301,
		bugName: "The Redirect Loop",
		difficulty: "normal",
		constraint: null,
		reward: {
			id: "coverage_boost_small",
			description: "Coverage gain increased by 10%",
		},
	},
	{
		httpCode: 304,
		bugName: "The Cache Hit",
		difficulty: "normal",
		constraint: null,
		reward: {
			id: "penalty_reduction",
			description: "Wrong answer coverage penalty reduced by 50%",
		},
	},
	{
		httpCode: 201,
		bugName: "The New Resource",
		difficulty: "easy",
		constraint: null,
		reward: {
			id: "coverage_boost_small",
			description: "Coverage gain increased by 10%",
		},
	},
	{
		httpCode: 404,
		bugName: "The Missing Module",
		difficulty: "normal",
		constraint: null,
		reward: {
			id: "penalty_reduction",
			description: "Wrong answer coverage penalty reduced by 50%",
		},
	},
];

/**
 * Harder gate options: have a constraint, but also a bigger reward.
 * Randomly picked as the "riskier" choice shown to the player.
 */
const HARDER_GATES: HttpGate[] = [
	{
		httpCode: 302,
		bugName: "The Temporary Fix",
		difficulty: "hard",
		constraint: {
			id: "slow_coverage",
			description: "Coverage gain reduced by 25%",
		},
		reward: {
			id: "coverage_boost_large",
			description: "Coverage gain increased by 50%",
		},
	},
	{
		httpCode: 400,
		bugName: "The Bad Request",
		difficulty: "hard",
		constraint: {
			id: "penalty_amplifier",
			description: "Wrong answer coverage penalty doubled",
		},
		reward: {
			id: "coverage_boost_large",
			description: "Coverage gain increased by 50%",
		},
	},
	{
		httpCode: 408,
		bugName: "The Timeout",
		difficulty: "intense",
		constraint: {
			id: "penalty_amplifier",
			description: "Wrong answer coverage penalty doubled",
		},
		reward: {
			id: "coverage_boost_large",
			description: "Coverage gain increased by 50%",
		},
	},
	{
		httpCode: 429,
		bugName: "The Rate Limiter",
		difficulty: "hard",
		constraint: {
			id: "slow_coverage",
			description: "Coverage gain reduced by 25%",
		},
		reward: {
			id: "streak_amplifier",
			description: "Streak bonus doubled",
		},
	},
	{
		httpCode: 500,
		bugName: "The Stack Overflow",
		difficulty: "hard",
		constraint: {
			id: "slow_coverage",
			description: "Coverage gain reduced by 25%",
		},
		reward: {
			id: "coverage_boost_large",
			description: "Coverage gain increased by 50%",
		},
	},
	{
		httpCode: 503,
		bugName: "The Overloaded Server",
		difficulty: "intense",
		constraint: {
			id: "penalty_amplifier",
			description: "Wrong answer coverage penalty doubled",
		},
		reward: {
			id: "streak_amplifier",
			description: "Streak bonus doubled",
		},
	},
];

/**
 * Lookup map from HTTP code to its gate definition.
 * Used by RunPath to resolve difficulty styling for each code in gate_path.
 */
export const GATE_BY_HTTP_CODE: Record<number, HttpGate> = [
	STARTING_GATE,
	...EASIER_GATES,
	...HARDER_GATES,
].reduce<Record<number, HttpGate>>((acc, gate) => {
	acc[gate.httpCode] = gate;
	return acc;
}, {});

const pickRandom = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];

/**
 * Randomly selects one easier and one harder gate as options for the player.
 * The player sees both and picks one to triage next.
 * Always returns [easier, harder] — preserving a meaningful choice.
 */
export const getRandomGateOptions = (): [HttpGate, HttpGate] => [
	pickRandom(EASIER_GATES),
	pickRandom(HARDER_GATES),
];

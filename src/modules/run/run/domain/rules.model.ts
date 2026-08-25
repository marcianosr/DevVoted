export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;
export const STORAGE_CAP_KB = 512;

type StoragePlan = {
	readonly tier: number;
	readonly capKb: number;
	readonly billKb: number;
	readonly fromGate: number;
};

export const STORAGE_PLANS: readonly StoragePlan[] = [
	{ tier: 1, capKb: STORAGE_CAP_KB, billKb: 0, fromGate: 0 },
	{ tier: 2, capKb: 640, billKb: 8, fromGate: 0 },
	{ tier: 3, capKb: 768, billKb: 16, fromGate: 2 },
	{ tier: 4, capKb: 1024, billKb: 32, fromGate: 4 },
	{ tier: 5, capKb: 1536, billKb: 48, fromGate: 6 },
	{ tier: 6, capKb: 2048, billKb: 72, fromGate: 8 },
	{ tier: 7, capKb: 3072, billKb: 112, fromGate: 10 },
];

export const storagePlanFor = (tier: number | undefined): StoragePlan =>
	STORAGE_PLANS.find((plan) => plan.tier === tier) ?? STORAGE_PLANS[0];

export const isStoragePlanUnlocked = (
	plan: StoragePlan,
	gatesCleared: number
): boolean => gatesCleared >= plan.fromGate;

export const storagePlanLadder = (
	gatesCleared: number
): readonly StoragePlan[] => {
	const unlocked = STORAGE_PLANS.filter((plan) =>
		isStoragePlanUnlocked(plan, gatesCleared)
	);
	const next = STORAGE_PLANS.find(
		(plan) => !isStoragePlanUnlocked(plan, gatesCleared)
	);
	return next ? [...unlocked, next] : unlocked;
};

export const FAUCET_CAP_KB = 320;

/** What is left of the run's faucet allowance. The reducer clamps each payout
 * against it and the pipeline rail counts it down, so the arithmetic lives in
 * one place rather than being re-derived by whichever surface asks. */
export const faucetRemainingKb = (earnedKb: number): number =>
	Math.max(0, FAUCET_CAP_KB - earnedKb);

export const storageCreditRate = (
	reason: "victory" | "dead" | "abandoned",
	gatesCleared: number
): number => {
	if (reason === "abandoned") return 0;
	if (reason === "victory") return 1;
	return Math.min(1, gatesCleared / GATE_COUNT);
};

/** A miss costs the answer you did not get, plus this fraction of one on top —
 * so it is 1.5 answers whatever the build and whatever the gate. */
export const WRONG_COVERAGE_LOSS = 0.5;

const STREAK_COVERAGE_BONUS = 0.1;

/**
 * The streak survives a gate clear, so an uncapped bonus reached ×7.5 on a
 * flawless run — a bigger multiplier than any config in the roster sells, handed
 * out for free. Capped rather than reset: a player who never misses keeps the
 * bonus for the whole run, it just stops compounding into a number the demand
 * table cannot be tuned against.
 */
export const BASE_STREAK_STEPS = 10;

/** The cap is a build number, not a constant: `capSteps` comes from the
 * pipeline (`streakCapStepsFor`) so a config can sell more headroom. Defaulted
 * for callers pricing the bare rule rather than a specific build. */
export const streakMultiplier = (
	streak: number,
	capSteps: number = BASE_STREAK_STEPS
): number => 1 + STREAK_COVERAGE_BONUS * Math.min(streak, capSteps);

/** What a streak tops out at, for the receipt that has to state the ceiling. */
export const streakCapMultiplier = (capSteps: number): number =>
	1 + STREAK_COVERAGE_BONUS * capSteps;

export const gateBaseMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

/**
 * Coverage each gate demands within its own window (ADR-035): the meter resets
 * per attempt, so every row is a fresh score to hit, not a running total.
 * Per-answer earn scales with `gateBaseMultiplier` (g+1), so a linear table
 * would be constant difficulty — the demand-to-base-pace ratio (strict base =
 * 5·(g+1) per perfect window) is the real ramp and THE tuning knob. Tune the
 * rows first, then WRONG_COVERAGE_LOSS; never gateBaseMultiplier, which
 * reprices every config.
 */
const COVERAGE_DEMANDS = [
	3, 10, 25, 40, 60, 85, 110, 140, 175, 210, 250, 290, 340,
] as const;

export const coverageDemandFor = (gatesCleared: number): number =>
	COVERAGE_DEMANDS[Math.min(gatesCleared, COVERAGE_DEMANDS.length - 1)];

const OPTION_COVERAGE_STEP = 0.1;
const MULTIPLE_CHOICE_COVERAGE_BONUS = 0.5;
const DIFFICULTY_BASELINE_OPTIONS = 3;

export const pollDifficultyMultiplier = (
	optionCount: number,
	isMultiple: boolean
): number =>
	1 +
	OPTION_COVERAGE_STEP *
		Math.max(0, optionCount - DIFFICULTY_BASELINE_OPTIONS) +
	(isMultiple ? MULTIPLE_CHOICE_COVERAGE_BONUS : 0);

/**
 * The one width rule left (ADR-035): a pipeline never goes bare. No gate
 * demands a width anymore, but a build with nothing in it fails every attempt
 * forever, so sell and drop refuse the last config — only a missed gate may
 * take it, and taking it ends the run.
 *
 * Exported so the sell and drop buttons ask the rule rather than restating it;
 * the reducer refuses either way.
 */
export const atMinimumWidth = (configCount: number): boolean =>
	configCount <= 1;

/**
 * What a missed gate peels from the pipeline (ADR-037), one row per gate. It
 * escalates because width does: a clear grants a slot, so one config is a third
 * of an opening build and a fourteenth of a summit build. The rows hold roughly
 * a quarter of `slotsForGatesCleared` at that depth, which keeps the death clock
 * at three or four misses the whole way up instead of thirteen at the top.
 *
 * Strip audits (Elite, Champion) add to the row rather than replacing it. THE
 * tuning knob for how forgiving a retry feels: a row of 0 makes that gate's miss
 * free, and the last two rows plus their audits are the harshest numbers in the
 * game.
 */
const GATE_FAIL_STRIPS = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4] as const;

export const failStripsFor = (gatesCleared: number): number =>
	GATE_FAIL_STRIPS[Math.min(gatesCleared, GATE_FAIL_STRIPS.length - 1)];

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

/** A missed gate is fatal when its strip quota takes the whole build. */
export const isStakeFatal = (strips: number, configs: number): boolean =>
	strips >= configs;

/**
 * The git tag (ADR-036): a once-per-run shop purchase that plants a cross-run
 * checkpoint, burnt by the run it rescues.
 *
 * The price climbs with the gate it marks, because that is exactly how much the
 * tag is worth — a checkpoint at gate 9 saves a week of climbing where one at
 * gate 4 saves an evening. Flat pricing made the shallow tag a bad deal and the
 * deep one a steal.
 */
/** Selling a checkpoint before the audits exist is selling nothing. */
export const PIN_FROM_GATE = 4;

const PIN_COST_STEP_KB = 64;

export const pinCostFor = (gatesCleared: number): number =>
	PIN_COST_STEP_KB * (gatesCleared - PIN_FROM_GATE + 2);

/**
 * The last gate that sells one. Past it a rescue is worse than no rescue: the
 * run would resume on three starter configs against a 4-config peel and stacked
 * audits, so the tag would cost a fortune to buy a death. The ceiling also keeps
 * the deepest price at the free tier's whole cap (512KB at gate 10).
 */
export const PIN_UNTIL_GATE = 10;
/** A pinned run starts with a stipend so a deep-but-fresh build can shop. */
export const PIN_START_KB_PER_GATE = 32;

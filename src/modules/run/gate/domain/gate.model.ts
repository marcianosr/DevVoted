import type { Config } from "~/modules/run/config/domain/config.model";
import {
	checkState,
	CheckStatus,
	EffectContext,
	effectOf,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import {
	Pipeline,
	effectiveRequirement,
	isBare,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

const passes = (state: CheckStatus["state"]): boolean =>
	state === "success" || state === "skipped";

const correctDemand = (required: number): string =>
	`${required} correct answer${required === 1 ? "" : "s"}`;

const correctConfigOf = (pipeline: Pipeline) =>
	pipeline.configs.find((config) => config.check === "correct");

/**
 * The correct-answer demand, or null when no installed config carries one.
 * Checks come only from configs (ADR-017): a build without Unit Tests owes no
 * correct count. The demand is what you bought and nothing else (ADR-033) —
 * gate depth does not raise it. It clamps to the window, so only levels can
 * demand a perfect 5/5.
 */
export const currentRequirement = (pipeline: Pipeline): number | null => {
	const correctConfig = correctConfigOf(pipeline);
	if (!correctConfig) return null;
	const base = correctConfig.checkAmount ?? 1;
	const level = correctConfig.level ?? 1;
	return effectiveRequirement(
		pipeline,
		Math.min(SLICE_WINDOW, base + level - 1)
	);
};

/**
 * How many checks must genuinely pass before the defeat device can report a
 * failing one as passing.
 *
 * The number is a width demand in disguise. Covering takes this many passing
 * rows *plus* the failing row it hides, so the pipeline needs that many other
 * configs alongside the device: **a floor of N needs N + 2 slots.** At 1 the
 * device works on the starting three slots and the run stops being able to end;
 * 2 needs slot 4 (8% coverage), 3 needs slot 5 (16%). Three, so a legendary at
 * 384KB cannot be carried by a starting-width build, and so a build that wants
 * the fraud has to widen — which also gives it more rows that can fail together
 * and take the cover away again.
 *
 * Cover counts `success` only, never `skipped` — a skipped check proves
 * nothing, and counting it would let a build pad the cover with Focus configs
 * for categories that rarely appear, reopening the same hole at any floor.
 */
export const DEFEAT_DEVICE_COVER = 3;

const DEFEAT_DEVICE_DEMAND = `${DEFEAT_DEVICE_COVER} other checks run and passing`;

const defeatDeviceOf = (pipeline: Pipeline): Config | undefined =>
	pipeline.configs.find((config) => config.check === "defeat-device");

/** The faked row still shows its real tally: the fraud is visible, not silent. */
const reportPassing = (check: CheckStatus): CheckStatus => ({
	...check,
	state: "skipped",
	progress: check.progress
		? `${check.progress} (reported passing)`
		: "reported passing",
});

const defeatDeviceProgress = (
	hiddenLabel: string | undefined,
	failing: number,
	covered: number
): string | undefined => {
	if (hiddenLabel) return `hid ${hiddenLabel}`;
	// Nothing failing is the dormant case — the gray dot says it already.
	if (failing === 0) return undefined;
	if (failing > 1) return `${failing} checks failing`;
	return `${covered}/${DEFEAT_DEVICE_COVER} passed`;
};

/**
 * Volkswagen CI (ADR-028). Reports one failing check as passing, but only when
 * at least `DEFEAT_DEVICE_COVER` other checks genuinely pass.
 *
 * It is synthesized here rather than in `effect.model` because it is the only
 * config that *reads* the checklist instead of adding a row to it, and an
 * `Effect` sees only the window, never its neighbours. Same reason `correct`
 * lives here.
 *
 * It can never fail a gate on its own, which ADR-028 accepts as a deliberate
 * exception to ADR-022: with nothing failing there is nothing to hide, and when
 * it cannot cover, the check it failed to hide is already failing the gate. The
 * 384KB draft price and the slot are what it costs.
 */
const applyDefeatDevice = (
	checks: readonly CheckStatus[],
	config: Config
): readonly CheckStatus[] => {
	const failing = checks.filter((check) => check.state === "failed");
	const covered = checks.filter((check) => check.state === "success").length;
	const hides = failing.length === 1 && covered >= DEFEAT_DEVICE_COVER;
	const hiddenLabel = hides ? failing[0].label : undefined;
	const reported = hides
		? checks.map((check) =>
				check.state === "failed" ? reportPassing(check) : check
			)
		: checks;
	return [
		...reported,
		{
			label: config.label,
			progress: defeatDeviceProgress(hiddenLabel, failing.length, covered),
			current: covered,
			target: DEFEAT_DEVICE_COVER,
			state: hides ? "success" : failing.length === 0 ? "skipped" : "failed",
			sourceConfigId: config.id,
			description: DEFEAT_DEVICE_DEMAND,
		},
	];
};

export const checkStatuses = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): readonly CheckStatus[] => {
	const requirement = currentRequirement(pipeline);
	const context: EffectContext = { window, gatesCleared };
	const contributed = pipeline.configs.flatMap((config) => {
		const effect = effectOf(config);
		return effect.gateCheck
			? [
					{
						...effect.gateCheck(context),
						sourceConfigId: config.id,
						description: effect.demand?.(gatesCleared),
					},
				]
			: [];
	});
	const listed =
		requirement === null
			? contributed
			: [
					{
						label: "Correct",
						progress: `${window.correct}/${requirement}`,
						current: window.correct,
						target: requirement,
						state: checkState(window.correct >= requirement, window),
						description: correctDemand(requirement),
						sourceConfigId: correctConfigOf(pipeline)?.id,
					},
					...contributed,
				];
	// Last, on the assembled list: the defeat device reads the other rows, so it
	// can only run once every one of them has resolved.
	const device = defeatDeviceOf(pipeline);
	return device ? applyDefeatDevice(listed, device) : listed;
};

/**
 * A bare pipeline never clears: with checks coming only from configs
 * (ADR-017), an empty checklist would pass vacuously and make a stripped-
 * bare run immortal. Nothing installed means nothing ships — so bareness
 * itself is the failure, keeping "a bare build fails → dead" reachable.
 *
 * There is deliberately **no** correctness floor here (ADR-022, rejected).
 * "Get one right" is a config's check, not the gate's rule: AGENTS.md carries
 * it unconditionally, and duplicating it here would charge builds that never
 * bought it and add a demand with no checklist row for the player to read.
 * The checklist is the whole rulebook.
 */
export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	!isBare(pipeline) &&
	checkStatuses(pipeline, window, gatesCleared).every((check) =>
		passes(check.state)
	);

export const gateDemands = (
	pipeline: Pipeline,
	gatesCleared: number
): readonly string[] => {
	const correct = currentRequirement(pipeline);
	const contributed = pipeline.configs.flatMap((config) => {
		const demand = effectOf(config).demand;
		return demand ? [demand(gatesCleared)] : [];
	});
	if (correct === null) return contributed;
	return [correctDemand(correct), ...contributed];
};

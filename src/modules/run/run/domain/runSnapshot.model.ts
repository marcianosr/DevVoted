import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import {
	type RunState,
	pickBudgetFor,
	scheduleOf,
	windowStartIndex,
} from "~/modules/run/run/domain/run.model";
import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type {
	AnsweredPoll,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	liveAuditsFor,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";

/**
 * The persisted shape of a run (run_states.state): everything the engine
 * needs EXCEPT the day's poll sequence. Polls are the shared daily seed
 * (ADR-009) — identical for every player and holding correctness — so they
 * are stored once in daily_run_polls and rehydrated on load, never duplicated
 * per run.
 */
export type RunSnapshot = Omit<RunState, "polls">;

/**
 * What a persisted row may actually hold. We always WRITE a `RunSnapshot`, but
 * we READ whatever the engine version that wrote it produced, and older ones
 * predate the units rename. Every `RunSnapshot` is assignable to this, so the
 * looser type costs callers nothing and stops the reader pretending fields are
 * there.
 */
export type StoredSnapshot = Omit<RunSnapshot, "bankedUnits" | "window"> & {
	readonly bankedUnits?: number;
	readonly window: Omit<GateWindow, "unitsEarned"> & {
		readonly unitsEarned?: number;
	};
	/** Rows written before the held attack became the sealed audit (ADR-119). */
	readonly attack?: { readonly band: "healthy" | "perfect" };
	readonly attackEarnedAtGate?: number;
};

export const toRunSnapshot = (state: RunState): RunSnapshot => {
	const { polls: _polls, ...snapshot } = state;
	return snapshot;
};

/**
 * Snapshots embed full Config objects at slot/draft time, so an in-flight run
 * carries the roster as it looked back then. The roster is authoritative on
 * load: swap each embedded config for its current version, keeping only the
 * player's earned level. Unknown ids (a config since removed) pass through
 * untouched rather than crashing the run.
 */
const refreshConfig = (config: Config): Config => {
	const current = CONFIG_LIST.find((candidate) => candidate.id === config.id);
	if (!current) return config;
	if (config.level === undefined) return current;
	return { ...current, level: config.level };
};

const refreshConfigs = (configs: readonly Config[]): readonly Config[] =>
	configs.map(refreshConfig);

/**
 * The author is a live profile — avatar, equipped border, title — so a snapshot
 * that embedded it credits the player as they looked when they answered.
 * Re-reading it off the day's polls keeps the credit current, the same way the
 * roster is re-read above. A poll the rollover dropped simply loses its credit.
 */
const refreshAuthors = (
	answered: readonly AnsweredPoll[],
	polls: readonly RunPoll[]
): readonly AnsweredPoll[] =>
	answered.map((entry) => {
		const author = polls.find((poll) => poll.id === entry.id)?.author;
		if (author === undefined) {
			const { author: _dropped, ...rest } = entry;
			return rest;
		}
		return { ...entry, author };
	});

/**
 * Snapshots written before the units rename carry `coverageGained` on the window
 * and no `bankedUnits` at all. Both reach the coverage bar as raw numbers, so a
 * missing one arrives as NaN — and NaN never equals itself, which turns the
 * bar's render-phase comparison into an infinite loop rather than a wrong
 * figure. Healed here for the same reason the roster and the pick budget are.
 */
const legacyUnitsOf = (
	window: StoredSnapshot["window"]
): number | undefined => {
	const renamed: unknown = Reflect.get(window, "coverageGained");
	return typeof renamed === "number" ? renamed : undefined;
};

const finite = (value: number, fallback: number): number =>
	Number.isFinite(value) ? value : fallback;

const unitsEarnedOf = (window: StoredSnapshot["window"]): number => {
	const stored = window.unitsEarned;
	if (stored !== undefined && Number.isFinite(stored)) return stored;

	return legacyUnitsOf(window) ?? 0;
};

/**
 * `coverage` has always been the run's running unit total, so the units the
 * cleared gates banked are that total minus the open window's share. A
 * reconstruction, not a default: zeroing it would silently wipe the score of
 * every run already in flight.
 */
const bankedUnitsOf = (
	snapshot: StoredSnapshot,
	unitsEarned: number
): number => {
	const stored = snapshot.bankedUnits;
	if (stored !== undefined && Number.isFinite(stored)) return stored;

	return Math.max(0, finite(snapshot.coverage, 0) - unitsEarned);
};

/**
 * The polls are authoritative on load in the same way the roster is: a day
 * rollover (ADR-011) drops the window's unplayed tail and appends today's
 * segment, so a pick budget stored when the window opened would describe polls
 * that no longer exist. Recomputing it here covers every load path, and the
 * reducer keeps setting it at open so a window that fills inside one session
 * never needs a round trip to learn its own budget.
 */
export const hydrateRunState = (
	snapshot: StoredSnapshot,
	polls: readonly RunPoll[]
): RunState => {
	const unitsEarned = unitsEarnedOf(snapshot.window);
	const {
		attack: legacyAttack,
		attackEarnedAtGate: legacyHandedAtGate,
		...current
	} = snapshot;
	const heldAudit =
		current.heldAudit ??
		(legacyAttack === undefined
			? undefined
			: {
					band: legacyAttack.band,
					gate: legacyHandedAtGate ?? Math.max(0, snapshot.gatesCleared - 1),
				});
	const auditHandedAtGate = current.auditHandedAtGate ?? legacyHandedAtGate;
	// Healed first, so everything downstream reads one shape: `windowStartIndex`
	// and the audit lens both take a snapshot, and neither should learn that an
	// older engine wrote fewer fields. The legacy keys are dropped, not carried,
	// so the next write is clean.
	const healed: RunSnapshot = {
		...current,
		...(heldAudit === undefined ? {} : { heldAudit }),
		...(auditHandedAtGate === undefined ? {} : { auditHandedAtGate }),
		bankedUnits: bankedUnitsOf(snapshot, unitsEarned),
		coverage: finite(snapshot.coverage, 0),
		// Every row written before Database shipped has no open transaction, and
		// the poll screen reads the figure raw.
		pendingKb: finite(snapshot.pendingKb ?? 0, 0),
		window: { ...snapshot.window, unitsEarned },
	};

	return {
		...healed,
		build: {
			...healed.build,
			configs: refreshConfigs(healed.build.configs),
		},
		available: refreshConfigs(healed.available),
		draftOptions: refreshConfigs(healed.draftOptions),
		answeredThisGate: refreshAuthors(healed.answeredThisGate, polls),
		...(healed.allAnswered === undefined
			? {}
			: { allAnswered: refreshAuthors(healed.allAnswered, polls) }),
		window: {
			...healed.window,
			budget: pickBudgetFor(
				polls,
				windowStartIndex(healed),
				mirrorsPolls(
					liveAuditsFor(
						healed.build.configs,
						healed.gatesCleared,
						scheduleOf(healed)
					)
				)
			),
		},
		polls,
	};
};

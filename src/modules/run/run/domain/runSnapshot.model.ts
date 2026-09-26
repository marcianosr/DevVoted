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

export type RunSnapshot = Omit<RunState, "polls">;

export type StoredSnapshot = Omit<RunSnapshot, "bankedUnits" | "window"> & {
	readonly bankedUnits?: number;
	readonly window: Omit<GateWindow, "unitsEarned"> & {
		readonly unitsEarned?: number;
	};
	readonly attack?: { readonly band: "healthy" | "perfect" };
	readonly attackEarnedAtGate?: number;
};

export const toRunSnapshot = (state: RunState): RunSnapshot => {
	const { polls: _polls, ...snapshot } = state;
	return snapshot;
};

const refreshConfig = (config: Config): Config => {
	const current = CONFIG_LIST.find((candidate) => candidate.id === config.id);
	if (!current) return config;
	if (config.level === undefined) return current;
	return { ...current, level: config.level };
};

const refreshConfigs = (configs: readonly Config[]): readonly Config[] =>
	configs.map(refreshConfig);

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

const bankedUnitsOf = (
	snapshot: StoredSnapshot,
	unitsEarned: number
): number => {
	const stored = snapshot.bankedUnits;
	if (stored !== undefined && Number.isFinite(stored)) return stored;

	return Math.max(0, finite(snapshot.coverage, 0) - unitsEarned);
};

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
	const healed: RunSnapshot = {
		...current,
		...(heldAudit === undefined ? {} : { heldAudit }),
		...(auditHandedAtGate === undefined ? {} : { auditHandedAtGate }),
		bankedUnits: bankedUnitsOf(snapshot, unitsEarned),
		coverage: finite(snapshot.coverage, 0),
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

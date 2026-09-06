import {
	baseSlotsOf,
	type Config,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { CONFIG_UNLOCKS } from "~/modules/run/config/domain/configUnlock.model";
import {
	fallbackCaptionFor,
	provenanceOf,
	STARTER_PROVENANCE,
	thematicCaptionFor,
	type UnlockPathCaption,
} from "~/modules/run/config/domain/unlockCaption.model";

export type UnlockFact = {
	readonly configId: string;
	readonly viaMetric: string | null;
};

export type ProgressFact = {
	readonly metric: string;
	readonly count: number;
};

/**
 * Redaction is enforced at the type level: a locked entry carries no `Config`,
 * so no panel can leak a name, effect or tooltip it was supposed to hide —
 * only the slot silhouette and the two unlock paths survive the fold.
 */
export type ConfigdexEntry =
	| {
			readonly state: "granted";
			readonly config: Config;
			readonly provenance: string;
			readonly starter: boolean;
	  }
	| {
			readonly state: "locked";
			readonly config?: never;
			readonly id: string;
			readonly slots: number;
			readonly thematic: UnlockPathCaption;
			readonly fallback: UnlockPathCaption;
	  };

/**
 * The free set reads granted even without a ledger row — a presentation guard
 * for pre-seed accounts (ADR-051 decision 2 shows starters granted, no
 * objective rows), deliberately looser than ADR-064's row-exists semantics.
 */
export const configdex = (
	unlocks: readonly UnlockFact[],
	progress: readonly ProgressFact[]
): readonly ConfigdexEntry[] => {
	const unlockByConfig = new Map(unlocks.map((row) => [row.configId, row]));
	const countByMetric = new Map(
		progress.map((row) => [row.metric, row.count] as const)
	);
	const countOf = (metric: string): number => countByMetric.get(metric) ?? 0;

	return CONFIG_LIST.map((config): ConfigdexEntry => {
		const unlock = CONFIG_UNLOCKS[config.id];
		if (unlock === undefined || unlock.kind === "free") {
			return {
				state: "granted",
				config,
				provenance: STARTER_PROVENANCE,
				starter: true,
			};
		}
		const row = unlockByConfig.get(config.id);
		if (row) {
			return {
				state: "granted",
				config,
				provenance: provenanceOf(config.id, row.viaMetric),
				starter: row.viaMetric === null,
			};
		}
		return {
			state: "locked",
			id: config.id,
			slots: baseSlotsOf(config),
			thematic: thematicCaptionFor(unlock, countOf(unlock.objective.metric)),
			fallback: fallbackCaptionFor(unlock, countOf("polls-answered")),
		};
	});
};

export const grantedCountIn = (entries: readonly ConfigdexEntry[]): number =>
	entries.filter((entry) => entry.state === "granted").length;

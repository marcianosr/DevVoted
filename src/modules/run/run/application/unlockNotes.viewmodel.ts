import {
	maxLevelOf,
	slotsOf,
	type Config,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { provenanceOf } from "~/modules/run/config/domain/unlockCaption.model";
import type {
	RunUnlock,
	RunView,
} from "~/modules/run/run/application/runView.viewmodel";

export type UnlockLine = {
	readonly config: Config;
	readonly detail: string;
};

export type UnlockAnnouncement = {
	readonly label: string;
	readonly detail: string;
	readonly slots: number;
	readonly version: number;
	readonly maxVersion: number;
};

const configById = new Map(CONFIG_LIST.map((config) => [config.id, config]));

const viaOf = (view: RunView, configId: string): string | null =>
	view.unlockedThisRun.find((grant) => grant.configId === configId)
		?.viaMetric ?? null;

/** The run's grants as chip-ready lines; unknown ids are dropped, not thrown. */
export const unlockLinesFor = (
	grants: readonly RunUnlock[]
): readonly UnlockLine[] =>
	grants.flatMap((grant) => {
		const config = configById.get(grant.configId);
		if (!config) return [];
		return [{ config, detail: provenanceOf(grant.configId, grant.viaMetric) }];
	});

/** The grants the LAST dispatch fired — the immediate saffron beat. */
export const justFiredLines = (view: RunView): readonly UnlockLine[] =>
	unlockLinesFor(
		view.unlockedThisRun.filter((grant) =>
			view.unlockedConfigIds.includes(grant.configId)
		)
	);

/** The same beat as plain strings, for the terminal kit's Unlocks rows. */
export const unlockNotesFor = (view: RunView): readonly UnlockAnnouncement[] =>
	view.unlockedConfigIds.flatMap((configId) => {
		const config = configById.get(configId);
		if (!config) return [];
		return [
			{
				label: config.label,
				detail: provenanceOf(configId, viaOf(view, configId)),
				slots: slotsOf(config),
				version: config.level ?? 1,
				maxVersion: maxLevelOf(config),
			},
		];
	});

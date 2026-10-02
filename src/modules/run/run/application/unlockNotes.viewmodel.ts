import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { provenanceOf } from "~/modules/run/config/domain/unlockCaption.model";
import type { RunUnlock } from "~/modules/run/run/application/runView.viewmodel";

export type UnlockLine = {
	readonly config: Config;
	readonly detail: string;
};

const configById = new Map(CONFIG_LIST.map((config) => [config.id, config]));

export const unlockLinesFor = (
	grants: readonly RunUnlock[]
): readonly UnlockLine[] =>
	grants.flatMap((grant) => {
		const config = configById.get(grant.configId);
		if (!config) return [];
		return [{ config, detail: provenanceOf(grant.configId, grant.viaMetric) }];
	});

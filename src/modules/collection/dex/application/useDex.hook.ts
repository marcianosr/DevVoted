import { getConfigdex } from "~/modules/collection/dex/application/configdex.serverfn";
import { getPolldex } from "~/modules/collection/dex/application/polldex.serverfn";
import { getGateRuns } from "~/modules/collection/dex/application/runHistory.serverfn";
import {
	auditdex,
	type AuditdexEntry,
} from "~/modules/collection/dex/domain/auditdex.model";
import {
	configdex,
	type ConfigdexEntry,
} from "~/modules/collection/dex/domain/configdex.model";
import {
	controldex,
	type ControldexEntry,
} from "~/modules/collection/dex/domain/controldex.model";
import {
	gatedex,
	type GatedexEntry,
} from "~/modules/collection/dex/domain/gatedex.model";
import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import type { RunHistoryEntry } from "~/modules/collection/dex/domain/runHistory.model";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { getServiceUnlocks } from "~/modules/run/shop/application/serviceUnlock.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys, userQueryKeys } from "~/shared/queryKeys";

export type DexCollection = {
	readonly polls: readonly PolldexEntry[];
	readonly configs: readonly ConfigdexEntry[];
	readonly controls: readonly ControldexEntry[];
	readonly gates: readonly GatedexEntry[];
	readonly audits: readonly AuditdexEntry[];
	readonly runs: readonly RunHistoryEntry[];
};

export const useDex = (viewerId: string): DexCollection => {
	const polldex = useApiQuery({
		queryKey: pollQueryKeys.polldex(viewerId),
		queryFn: () => getPolldex(),
	});
	const swatches = useApiQuery({
		queryKey: userQueryKeys.swatches(viewerId),
		queryFn: () => getOwnedSwatches(),
	});
	const gateRuns = useApiQuery({
		queryKey: userQueryKeys.gateRuns(viewerId),
		queryFn: () => getGateRuns(),
	});
	const unlocks = useApiQuery({
		queryKey: userQueryKeys.unlocks(viewerId),
		queryFn: () => getConfigdex(),
	});
	const serviceUnlocks = useApiQuery({
		queryKey: userQueryKeys.serviceUnlocks(viewerId),
		queryFn: () => getServiceUnlocks(),
	});

	const gates = gatedex(swatches.view?.ownedSwatchIds ?? []);

	return {
		polls: polldex.view?.entries ?? [],
		configs:
			unlocks.view === null
				? []
				: configdex(unlocks.view.unlocks, unlocks.view.progress),
		controls: controldex(serviceUnlocks.view?.unlockedServiceIds ?? []),
		gates,
		audits: auditdex(gates),
		runs: gateRuns.view?.history ?? [],
	};
};

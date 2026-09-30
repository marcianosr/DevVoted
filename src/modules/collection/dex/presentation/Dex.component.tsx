import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { controldex } from "~/modules/collection/dex/domain/controldex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { getConfigdex } from "~/modules/collection/dex/application/configdex.serverfn";
import { getGateRuns } from "~/modules/collection/dex/application/runHistory.serverfn";
import { getPolldex } from "~/modules/collection/dex/application/polldex.serverfn";
import {
	dexAuditsFor,
	dexConfigsFor,
	dexControlsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	type DexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { getServiceUnlocks } from "~/modules/run/shop/application/serviceUnlock.serverfn";
import { pollQueryKeys, userQueryKeys } from "~/shared/queryKeys";
import { DexAudits } from "~/ui/kanto-theme/DexAudits.ui";
import { DexConfigs } from "~/ui/kanto-theme/DexConfigs.ui";
import { DexControls } from "~/ui/kanto-theme/DexControls.ui";
import { DexPolls } from "~/ui/kanto-theme/DexPolls.ui";
import { DexRuns } from "~/ui/kanto-theme/DexRuns.ui";
import { DexSwatches } from "~/ui/kanto-theme/DexSwatches.ui";

type DexProps = {
	userId: string;
	activeId: DexTabId;
};

const POLLS_TAB: DexTabId = "polls";
const CONFIGS_TAB: DexTabId = "configs";
const CONTROLS_TAB: DexTabId = "controls";
const AUDITS_TAB: DexTabId = "audits";
const SWATCHES_TAB: DexTabId = "swatches";
const RUNS_TAB: DexTabId = "runs";

export const Dex = ({ userId, activeId }: DexProps) => {
	const [picks, setPicks] = useState<Partial<Record<DexTabId, string>>>({});
	const [filters, setFilters] = useState<Partial<Record<DexTabId, string>>>({});

	const pickIn = (tab: DexTabId) => (id: string) =>
		setPicks({ ...picks, [tab]: id });

	const filterIn = (tab: DexTabId) => (filter: string) =>
		setFilters({ ...filters, [tab]: filter });

	const polldex = useQuery({
		queryKey: pollQueryKeys.polldex(userId),
		queryFn: () => getPolldex(),
	});

	const swatches = useQuery({
		queryKey: userQueryKeys.swatches(userId),
		queryFn: () => getOwnedSwatches(),
	});

	const gateRuns = useQuery({
		queryKey: userQueryKeys.gateRuns(userId),
		queryFn: () => getGateRuns(),
	});

	const unlocks = useQuery({
		queryKey: userQueryKeys.unlocks(userId),
		queryFn: () => getConfigdex(),
	});

	const serviceUnlocks = useQuery({
		queryKey: userQueryKeys.serviceUnlocks(userId),
		queryFn: () => getServiceUnlocks(),
	});

	const entries = polldex.data?.success ? polldex.data.data.entries : [];
	const ownedSwatchIds = swatches.data?.success
		? swatches.data.data.ownedSwatchIds
		: [];
	const history = gateRuns.data?.success ? gateRuns.data.data.history : [];
	const unlockedServiceIds = serviceUnlocks.data?.success
		? serviceUnlocks.data.data.unlockedServiceIds
		: [];
	const configEntries = unlocks.data?.success
		? configdex(unlocks.data.data.unlocks, unlocks.data.data.progress)
		: [];

	const gates = gatedex(ownedSwatchIds);

	const polls = dexPollsFor(entries, filters[POLLS_TAB], picks[POLLS_TAB]);

	const configs = dexConfigsFor(
		configEntries,
		filters[CONFIGS_TAB],
		picks[CONFIGS_TAB]
	);

	return (
		<>
			{activeId === "polls" ? (
				<DexPolls
					{...polls}
					onSelect={pickIn(POLLS_TAB)}
					onFilter={filterIn(POLLS_TAB)}
				/>
			) : null}
			{activeId === "configs" ? (
				<DexConfigs
					{...configs}
					onSelect={pickIn(CONFIGS_TAB)}
					onFilter={filterIn(CONFIGS_TAB)}
				/>
			) : null}
			{activeId === "controls" ? (
				<DexControls
					{...dexControlsFor(
						controldex(unlockedServiceIds),
						picks[CONTROLS_TAB]
					)}
					onSelect={pickIn(CONTROLS_TAB)}
				/>
			) : null}
			{activeId === "audits" ? (
				<DexAudits
					{...dexAuditsFor(
						auditdex(gates),
						filters[AUDITS_TAB],
						picks[AUDITS_TAB]
					)}
					onSelect={pickIn(AUDITS_TAB)}
					onFilter={filterIn(AUDITS_TAB)}
				/>
			) : null}
			{activeId === "swatches" ? (
				<DexSwatches
					{...dexSwatchesFor(gates, picks[SWATCHES_TAB])}
					onSelect={pickIn(SWATCHES_TAB)}
				/>
			) : null}
			{activeId === "runs" ? (
				<DexRuns
					{...dexRunsFor(history, picks[RUNS_TAB])}
					onSelect={pickIn(RUNS_TAB)}
				/>
			) : null}
		</>
	);
};

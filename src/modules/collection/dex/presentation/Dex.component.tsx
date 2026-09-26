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
import {
	DEX_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";
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

export const Dex = ({ userId, activeId }: DexProps) => {
	const [configFlips, setConfigFlips] = useState<ReadonlySet<string>>(
		new Set()
	);

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

	const configs = dexConfigsFor(configEntries);
	const configIds = configs.groups.flatMap((group) =>
		group.chips.map((card) => card.id)
	);

	const configsOpen = disclosedIn(configIds, configFlips, DEX_CARDS_OPEN);

	const toggleConfig = (configId: string) =>
		setConfigFlips(toggleDisclosure(configFlips, configId));

	const toggleAllConfigs = () =>
		setConfigFlips(
			discloseAll(
				configIds,
				configsOpen.size < configIds.length,
				DEX_CARDS_OPEN
			)
		);

	return (
		<>
			{activeId === "polls" ? <DexPolls {...dexPollsFor(entries)} /> : null}
			{activeId === "configs" ? (
				<DexConfigs
					{...configs}
					openInfo={configsOpen}
					onToggleInfo={toggleConfig}
					onToggleAll={toggleAllConfigs}
				/>
			) : null}
			{activeId === "controls" ? (
				<DexControls {...dexControlsFor(controldex(unlockedServiceIds))} />
			) : null}
			{activeId === "audits" ? (
				<DexAudits {...dexAuditsFor(auditdex(gates))} />
			) : null}
			{activeId === "swatches" ? (
				<DexSwatches {...dexSwatchesFor(gates)} />
			) : null}
			{activeId === "runs" ? <DexRuns {...dexRunsFor(history)} /> : null}
		</>
	);
};

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
	DEX_TABS,
	dexAuditsFor,
	dexConfigsFor,
	dexControlsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	dexThemeOf,
	isDexTabId,
	type DexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { getServiceUnlocks } from "~/modules/run/shop/application/serviceUnlock.serverfn";
import { formatStorage } from "~/shared/lib/storage";
import { pollQueryKeys, userQueryKeys } from "~/shared/queryKeys";
import { DexAudits } from "~/ui/kanto-theme/DexAudits.ui";
import { DexConfigs } from "~/ui/kanto-theme/DexConfigs.ui";
import { DexControls } from "~/ui/kanto-theme/DexControls.ui";
import { DexPolls } from "~/ui/kanto-theme/DexPolls.ui";
import { DexRuns } from "~/ui/kanto-theme/DexRuns.ui";
import { DexScreen } from "~/ui/kanto-theme/DexScreen.ui";
import { DexSwatches } from "~/ui/kanto-theme/DexSwatches.ui";

type DexProps = {
	// Only the query-cache discriminator; the server derives auth server-side.
	userId: string;
};

const FIRST_TAB: DexTabId = "polls";
const ARCHIVE_SUFFIX = "archive";

/**
 * Tier 2 wiring for the Dex: tab state, the queries, and the presenters.
 *
 * Swatches and Audits are read off `owned_swatch_ids` alone, so neither needs
 * the poll query. Services read their own grant ledger (ADR-116), the way
 * configs do.
 */
export const Dex = ({ userId }: DexProps) => {
	const [activeId, setActiveId] = useState<DexTabId>(FIRST_TAB);
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);

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

	const archive = useArchiveState(userId);

	const gates = gatedex(ownedSwatchIds);

	const selectTab = (id: string) => {
		if (isDexTabId(id)) setActiveId(id);
	};

	const toggleInfo = (configId: string) =>
		setOpenInfo(configId === openInfo ? undefined : configId);

	return (
		<DexScreen
			tabs={DEX_TABS}
			activeId={activeId}
			onSelect={selectTab}
			theme={dexThemeOf(activeId)}
			archive={`${formatStorage(archive.data?.archivedStorage ?? 0)} ${ARCHIVE_SUFFIX}`}
		>
			{activeId === "polls" ? <DexPolls {...dexPollsFor(entries)} /> : null}
			{activeId === "configs" ? (
				<DexConfigs
					{...dexConfigsFor(configEntries)}
					openInfo={openInfo}
					onToggleInfo={toggleInfo}
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
		</DexScreen>
	);
};

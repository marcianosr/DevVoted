import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { getConfigdex } from "~/modules/collection/dex/application/configdex.serverfn";
import { getGateRuns } from "~/modules/collection/dex/application/runHistory.serverfn";
import { getPolldex } from "~/modules/collection/dex/application/polldex.serverfn";
import {
	DEX_TABS,
	dexAuditsFor,
	dexConfigsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	dexThemeOf,
	isDexTabId,
	type DexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { useArchiveState } from "~/domains/economy/hooks/useArchiveState";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { formatStorage } from "~/shared/lib/storage";
import { pollQueryKeys, userQueryKeys } from "~/shared/queryKeys";
import { DexAudits } from "~/ui/kanto-theme/DexAudits.ui";
import { DexConfigs } from "~/ui/kanto-theme/DexConfigs.ui";
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
 * Swatches and Audits are read off `owned_swatch_ids` alone — a swatch lands
 * exactly when its gate falls, so it already is the account's record of every
 * gate ever cleared, and neither tab needs the poll query.
 */
export const Dex = ({ userId }: DexProps) => {
	const [activeId, setActiveId] = useState<DexTabId>(FIRST_TAB);
	const [versions, setVersions] = useState<Record<string, number>>({});

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

	const entries = polldex.data?.success ? polldex.data.data.entries : [];
	const ownedSwatchIds = swatches.data?.success
		? swatches.data.data.ownedSwatchIds
		: [];
	const runs = gateRuns.data?.success ? gateRuns.data.data.runs : [];
	const history = gateRuns.data?.success ? gateRuns.data.data.history : [];
	const configEntries = unlocks.data?.success
		? configdex(unlocks.data.data.unlocks, unlocks.data.data.progress)
		: [];

	const archive = useArchiveState(userId);

	const gates = gatedex(ownedSwatchIds);

	const selectTab = (id: string) => {
		if (isDexTabId(id)) setActiveId(id);
	};

	const readVersion = (configId: string, version: number) =>
		setVersions((held) => ({ ...held, [configId]: version }));

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
					selected={versions}
					onVersion={readVersion}
				/>
			) : null}
			{activeId === "audits" ? (
				<DexAudits {...dexAuditsFor(auditdex(gates, runs))} />
			) : null}
			{activeId === "swatches" ? (
				<DexSwatches {...dexSwatchesFor(gates)} />
			) : null}
			{activeId === "runs" ? <DexRuns {...dexRunsFor(history)} /> : null}
		</DexScreen>
	);
};

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
	auditdex,
	auditsFacedIn,
} from "~/modules/collection/dex/domain/auditdex.model";
import {
	gatedex,
	gatesClearedIn,
} from "~/modules/collection/dex/domain/gatedex.model";
import {
	polldexCoverage,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";
import { getGateRuns } from "~/modules/collection/dex/application/runHistory.serverfn";
import { getPolldex } from "~/modules/collection/dex/application/polldex.serverfn";
import { AuditsView } from "~/modules/collection/dex/presentation/AuditsView.component";
import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";
import { GatesView } from "~/modules/collection/dex/presentation/GatesView.component";
import { PollsView } from "~/modules/collection/dex/presentation/PollsView.component";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { getOwnedSwatches } from "~/modules/run/run/application/run.serverfn";
import { pollQueryKeys, userQueryKeys } from "~/shared/queryKeys";
import { Text } from "~/ui/modern-theme/Text.ui";
import { DexScreen } from "~/ui/modern-theme/screens/DexScreen.ui";

type PollsTabProps = {
	pending: boolean;
	entries: PolldexEntry[] | null;
};

const PollsTab = ({ pending, entries }: PollsTabProps) => {
	if (pending)
		return (
			<Text as="p" size="meta" tone="muted">
				Loading your collection…
			</Text>
		);

	if (!entries)
		return (
			<Text as="p" size="meta" tone="cinnabar">
				Couldn&apos;t load your polls. Try again shortly.
			</Text>
		);

	return <PollsView entries={entries} />;
};

type DexProps = {
	// Only the query-cache discriminator; the server derives auth server-side.
	userId: string;
};

/**
 * Tier 2 wiring for the Dex: tab state, the two queries, and the counters.
 *
 * Gates and Audits are read off `owned_swatch_ids` alone — a swatch lands
 * exactly when its gate falls, so it already is the account's record of every
 * gate ever cleared, and neither tab needs the poll query. That is why the
 * Polls tab carries its own loading and error state instead of the screen
 * doing it: a slow poll query should not blank a catalogue that is already in
 * hand.
 */
export const Dex = ({ userId }: DexProps) => {
	const [activeId, setActiveId] = useState("polls");

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

	const entries = polldex.data?.success ? polldex.data.data.entries : null;
	const ownedSwatchIds = swatches.data?.success
		? swatches.data.data.ownedSwatchIds
		: [];

	const runs = gateRuns.data?.success ? gateRuns.data.data.runs : [];

	const gates = gatedex(ownedSwatchIds);
	const audits = auditdex(gates, runs);
	const coverage = polldexCoverage(entries ?? []);
	const configCount = Object.keys(CONFIGS).length;

	return (
		<DexScreen
			tabs={[
				{
					id: "polls",
					label: "Polls",
					count: entries ? `${coverage.seen}/${coverage.total}` : undefined,
				},
				{
					id: "configs",
					label: "Configs",
					// No unlock system yet — owned == total.
					count: `${configCount}/${configCount}`,
				},
				{
					id: "audits",
					label: "Audits",
					count: `${auditsFacedIn(audits)}/${audits.length}`,
				},
				{
					id: "gates",
					label: "Gates",
					count: `${gatesClearedIn(gates)}/${gates.length}`,
				},
			]}
			activeId={activeId}
			onSelect={setActiveId}
		>
			{activeId === "gates" ? (
				<GatesView gates={gates} audits={audits} />
			) : null}
			{activeId === "audits" ? <AuditsView audits={audits} /> : null}
			{activeId === "configs" ? <ConfigdexPanel /> : null}
			{activeId === "polls" ? (
				<PollsTab pending={polldex.isPending} entries={entries} />
			) : null}
		</DexScreen>
	);
};

import { useState } from "react";

import {
	dexAuditsFor,
	dexConfigsFor,
	dexControlsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	type DexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { useDex } from "~/modules/collection/dex/application/useDex.hook";
import { DexAudits } from "~/ui/kanto-theme/DexAudits.ui";
import { DexConfigs } from "~/ui/kanto-theme/DexConfigs.ui";
import { DexControls } from "~/ui/kanto-theme/DexControls.ui";
import { DexPolls } from "~/ui/kanto-theme/DexPolls.ui";
import { DexRuns } from "~/ui/kanto-theme/DexRuns.ui";
import { DexSwatches } from "~/ui/kanto-theme/DexSwatches.ui";

type DexProps = {
	viewerId: string;
	activeId: DexTabId;
};

const POLLS_TAB: DexTabId = "polls";
const CONFIGS_TAB: DexTabId = "configs";
const CONTROLS_TAB: DexTabId = "controls";
const AUDITS_TAB: DexTabId = "audits";
const SWATCHES_TAB: DexTabId = "swatches";
const RUNS_TAB: DexTabId = "runs";

export const Dex = ({ viewerId, activeId }: DexProps) => {
	const [picks, setPicks] = useState<Partial<Record<DexTabId, string>>>({});
	const [filters, setFilters] = useState<Partial<Record<DexTabId, string>>>({});

	const pickIn = (tab: DexTabId) => (id: string) =>
		setPicks({ ...picks, [tab]: id });

	const filterIn = (tab: DexTabId) => (filter: string) =>
		setFilters({ ...filters, [tab]: filter });

	const { polls, configs, controls, gates, audits, runs } = useDex(viewerId);

	return (
		<>
			{activeId === "polls" ? (
				<DexPolls
					{...dexPollsFor(polls, filters[POLLS_TAB], picks[POLLS_TAB])}
					onSelect={pickIn(POLLS_TAB)}
					onFilter={filterIn(POLLS_TAB)}
				/>
			) : null}
			{activeId === "configs" ? (
				<DexConfigs
					{...dexConfigsFor(configs, filters[CONFIGS_TAB], picks[CONFIGS_TAB])}
					onSelect={pickIn(CONFIGS_TAB)}
					onFilter={filterIn(CONFIGS_TAB)}
				/>
			) : null}
			{activeId === "controls" ? (
				<DexControls
					{...dexControlsFor(controls, picks[CONTROLS_TAB])}
					onSelect={pickIn(CONTROLS_TAB)}
				/>
			) : null}
			{activeId === "audits" ? (
				<DexAudits
					{...dexAuditsFor(audits, filters[AUDITS_TAB], picks[AUDITS_TAB])}
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
					{...dexRunsFor(runs, picks[RUNS_TAB])}
					onSelect={pickIn(RUNS_TAB)}
				/>
			) : null}
		</>
	);
};

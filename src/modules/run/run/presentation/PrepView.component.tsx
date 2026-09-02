import { getCategoryMetadata } from "~/shared/lib/categories";
import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { coverageFor } from "~/modules/run/run/presentation/PollView.component";
import {
	PrepScreen,
	type BillRow,
	type PrepBuildRow,
} from "~/ui/terminal-theme/screens/PrepScreen.ui";
import type { AuditNote } from "~/ui/terminal-theme/Audits.ui";
import { plural } from "~/ui/terminal-theme/format";

const kb = (value: number) => `${value} KB`;

const signedKb = (value: number) =>
	value < 0 ? `−${kb(-value)}` : `+${kb(value)}`;

const versionOf = (config: Config) => `v${config.level ?? 1}`;

const buildRows = (configs: readonly Config[]): readonly PrepBuildRow[] =>
	configs.map((config) => ({
		family: config.family,
		name: config.label,
		detail: config.description,
		slots: slotsOf(config),
		version: versionOf(config),
	}));

const auditNote = (audit: AuditView): AuditNote => ({
	code: `${audit.code}`,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	suppressed: audit.suppressed,
});

const prefetchFor = (view: RunView) =>
	view.upcomingCategories === null
		? undefined
		: {
				thisGate: view.upcomingCategories.map(
					(code) => getCategoryMetadata(code).name
				),
				nextGate: (view.nextGateCategories ?? []).map(
					(code) => getCategoryMetadata(code).name
				),
			};

const billsFor = (view: RunView) => {
	const { subscriptions } = view.gateStake;
	if (subscriptions.lines.length === 0) return undefined;

	const rows: readonly BillRow[] = subscriptions.lines.map((line) => ({
		name: line.label,
		figure: signedKb(-line.kb),
		note: line.billedOnMiss ? "billed pass or fail" : undefined,
	}));

	return {
		meta: "this gate",
		rows,
		total: {
			name: "Total this gate",
			figure: signedKb(-subscriptions.totalKb),
			note:
				subscriptions.shortfallKb > 0
					? `short by ${kb(subscriptions.shortfallKb)}`
					: undefined,
		},
	};
};

const missPenalty = (view: RunView) => {
	const { missIsFatal, peelSlotsOnFailure } = view.gateStake;
	if (missIsFatal) return "ends the run";
	return `remove ${plural(peelSlotsOnFailure, "slot")}`;
};

export type PrepViewProps = {
	view: RunView;
	onStart: () => void;
	onBackToShop: () => void;
	onCommunity: () => void;
};

export const PrepView = ({
	view,
	onStart,
	onBackToShop,
	onCommunity,
}: PrepViewProps) => {
	const { gateStake } = view;
	const gate = gateStake.gateNumber;
	const swatch = swatchForGate(gate);
	const gateName = swatch?.gateName ?? "the gate";
	const live = gateStake.audits.filter((audit) => !audit.suppressed);
	const startLabel = `Start ${gateName} →`;
	const locked = view.pollsExhausted;
	const start = locked ? undefined : onStart;

	return (
		<PrepScreen
			theme={view.gateTheme}
			header={{
				title: `Gate ${gate} · ${gateName}`,
				subtitle:
					live.length === 0
						? undefined
						: `${plural(live.length, "audit")} · ${live.map((audit) => `${audit.code} ${audit.name}`).join(" · ")}`,
				swatch: swatch?.theme,
				swatchState: "pending",
				value: kb(view.storage),
				caption: "balance",
				coverage: coverageFor(view),
			}}
			ready={{
				note: locked
					? "today's polls are spent"
					: `today's ${plural(gateStake.pollsPerGate, "poll")} are ready`,
				startLabel: locked ? "opens with the next window" : startLabel,
				onStart: start,
			}}
			build={{
				meta: `${view.slotsUsed} of ${plural(view.slots, "slot")}`,
				count: `${view.configs.length}`,
				slots: view.slots,
				rows: buildRows(view.configs),
			}}
			required={{
				note: `Answer all ${plural(gateStake.pollsPerGate, "poll")}`,
				coverage: {
					detail: `earn ${gateStake.coverageDemand}% in this window`,
				},
			}}
			audits={{
				meta: live.length === 0 ? "none running" : `${live.length} running`,
				rows: gateStake.audits.map(auditNote),
			}}
			bills={billsFor(view)}
			prefetch={prefetchFor(view)}
			onClear={{
				reward: signedKb(gateStake.modifiers.gateReward),
				swatchLabel: gateName,
				swatch: swatch?.theme,
				missPenalty: missPenalty(view),
			}}
			footer={{
				changeLabel: `← change · ${kb(view.storage)}`,
				onChange: onBackToShop,
				communityLabel: "Community",
				onCommunity,
				startLabel: locked ? "opens with the next window" : startLabel,
				onStart: start,
			}}
		/>
	);
};

import { kbLabel, signedKbLabel } from "~/shared/lib/storage";
import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { prefetcherFor } from "~/modules/run/build/domain/build.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { AnswerTypeSplit } from "~/modules/run/run/domain/run.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { coverageFor } from "~/modules/run/run/presentation/PollView.component";
import {
	PrepScreen,
	type BillRow,
	type PrepAudit,
	type PrepBuildRow,
	type PrepTally,
} from "~/ui/terminal-theme/screens/PrepScreen.ui";
import { plural } from "~/ui/terminal-theme/format";

const rounded = (value: number) => Math.round(value * 10) / 10;

const versionOf = (config: Config) => `v${config.level ?? 1}`;

const buildRows = (configs: readonly Config[]): readonly PrepBuildRow[] =>
	configs.map((config) => ({
		family: config.family,
		name: config.label,
		detail: config.description,
		slots: slotsOf(config),
		version: versionOf(config),
	}));

const auditRows = (audits: readonly AuditView[]): readonly PrepAudit[] =>
	audits.map((audit) => ({
		label: `${audit.code} ${audit.name}`,
		suppressed: audit.suppressed,
	}));

const answerTypeTally = (
	split: AnswerTypeSplit | null
): readonly PrepTally[] | undefined =>
	split === null
		? undefined
		: [
				{ label: "single", count: split.single },
				{ label: "multiple", count: split.multiple },
			].filter((item) => item.count > 0);

const categoryTally = (
	codes: readonly CategoryCode[] | null
): readonly PrepTally[] | undefined => {
	if (codes === null || codes.length === 0) return undefined;

	const counts = codes.reduce(
		(tally, code) => tally.set(code, (tally.get(code) ?? 0) + 1),
		new Map<CategoryCode, number>()
	);

	return [...counts]
		.sort(([, held], [, other]) => other - held)
		.map(([code, count]) => ({
			label: getCategoryMetadata(code).name.toLowerCase(),
			count,
		}));
};

const billsFor = (view: RunView) => {
	const { subscriptions } = view.gateStake;
	if (subscriptions.lines.length === 0) return undefined;

	const rows: readonly BillRow[] = subscriptions.lines.map((line) => ({
		name: line.label,
		figure: signedKbLabel(-line.kb),
		note: line.billedOnMiss ? "billed pass or fail" : undefined,
	}));

	return {
		meta: "this gate",
		rows,
		total: {
			name: "Total this gate",
			figure: signedKbLabel(-subscriptions.totalKb),
			note:
				subscriptions.shortfallKb > 0
					? `short by ${kbLabel(subscriptions.shortfallKb)}`
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
				value: kbLabel(view.storage),
				caption: "balance",
				coverage: coverageFor(view),
			}}
			ready={{
				note: locked
					? "today's polls are spent"
					: `today's ${plural(gateStake.pollsPerGate, "poll")} are ready`,
			}}
			build={{
				slots: view.slots,
				slotsUsed: view.slotsUsed,
				rows: buildRows(view.configs),
			}}
			window={{
				title: swatch === undefined ? "next gate" : `${swatch.gateName} gate`,
				swatch: swatch?.theme,
				target: {
					reading: `${rounded(gateStake.coverageHeld)} of ${gateStake.coverageDemand}%`,
					held: gateStake.coverageHeld,
					demand: gateStake.coverageDemand,
				},
				polls: `${view.pollsAnswered} / ${gateStake.pollsPerGate} answered`,
				source: prefetcherFor(view.configs)?.label,
				pollTypes: answerTypeTally(view.answerTypesThisGate),
				audits: auditRows(gateStake.audits),
				categories: categoryTally(view.upcomingCategories),
				nextCategories: categoryTally(view.nextGateCategories),
			}}
			bills={billsFor(view)}
			onClear={{
				reward: signedKbLabel(gateStake.modifiers.gateReward),
				swatchLabel: gateName,
				swatch: swatch?.theme,
				missPenalty: missPenalty(view),
			}}
			footer={{
				changeLabel: "Back to shop",
				onChange: onBackToShop,
				communityLabel: "Community",
				onCommunity,
				startLabel: locked ? "opens with the next window" : startLabel,
				onStart: start,
			}}
		/>
	);
};

import { useState } from "react";

import { kbLabel, signedKbLabel } from "~/shared/lib/storage";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	GateHoldScreen,
	type RemoveRow,
} from "~/ui/terminal-theme/screens/GateHoldScreen.ui";
import type { AuditNote } from "~/ui/terminal-theme/Audits.ui";
import type { LedgerRow } from "~/ui/terminal-theme/Ledger.ui";
import { plural } from "~/ui/terminal-theme/format";

const percent = (value: number) => `${value.toFixed(1)}%`;

const auditNote = (audit: AuditView): AuditNote => ({
	code: `${audit.code}`,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	suppressed: audit.suppressed,
});

const chipsFor = (view: RunView) => {
	const { coverageHeld, coverageDemand } = view.gateStake;
	const correct = view.answeredThisGate.filter(
		(poll) => poll.outcome === "correct"
	).length;

	return [
		{
			label: `short by ${percent(coverageDemand - coverageHeld)}`,
			tone: "cinnabar" as const,
		},
		{ label: `${correct} of ${view.answeredThisGate.length} right` },
	];
};

const storageFor = (view: RunView): readonly LedgerRow[] => {
	const { faucetThisGateKb, subscriptionBillKb, planBilledKb } =
		view.gatePayout;
	const bills = [
		{ name: "subscriptions", charged: subscriptionBillKb },
		{ name: "slot rent", charged: planBilledKb },
	].filter((bill) => bill.charged !== 0);

	return [
		{ name: "gate cleared", value: "not paid", muted: true },
		...(faucetThisGateKb === 0
			? []
			: [{ name: "correct answers", figure: signedKbLabel(faucetThisGateKb) }]),
		...bills.map((bill) => ({
			name: bill.name,
			figure: signedKbLabel(-bill.charged),
			muted: true,
		})),
		{ name: "balance", value: kbLabel(view.storage) },
	];
};

export type RemovalViewProps = {
	view: RunView;
	onReviewAnswers: () => void;
	onRemove: (configIds: readonly string[]) => void;
};

export const RemovalView = ({
	view,
	onReviewAnswers,
	onRemove,
}: RemovalViewProps) => {
	const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);

	const toggle = (id: string) =>
		setSelectedIds((current) =>
			current.includes(id)
				? current.filter((held) => held !== id)
				: [...current, id]
		);

	const chosen = view.configs.filter((config) =>
		selectedIds.includes(config.id)
	);
	const chosenSlots = chosen.reduce(
		(total, config) => total + slotsOf(config),
		0
	);
	const shortBy = Math.max(0, view.peelSlotsRemaining - chosenSlots);

	const rows: readonly RemoveRow[] = view.configs.map((config) => ({
		name: config.label,
		detail: config.description,
		slots: slotsOf(config),
		checked: selectedIds.includes(config.id),
		onToggle: () => toggle(config.id),
	}));

	const gate = swatchForGate(view.gateStake.gateNumber);

	return (
		<GateHoldScreen
			theme={gate?.theme}
			title={`${gate?.gateName ?? "The gate"} holds`}
			subtitle="not earned · the gate stays shut"
			retryNote={`retry runs ${plural(view.gateStake.pollsPerGate, "fresh poll")}`}
			chips={chipsFor(view)}
			audits={view.audits.map(auditNote)}
			storage={storageFor(view)}
			remove={{
				meta: `${plural(view.peelSlotsRemaining, "slot")} · ${chosenSlots} chosen`,
				rows,
			}}
			reviewLabel="Review answers"
			onReview={onReviewAnswers}
			removeLabel={
				view.peelSlotsRemaining === 0
					? "Nothing to remove"
					: shortBy === 0
						? `Remove ${plural(chosen.length, "config")} →`
						: `Remove ${plural(shortBy, "more slot")}`
			}
			onRemove={
				view.peelSlotsRemaining > 0 && shortBy === 0
					? () => onRemove(selectedIds)
					: undefined
			}
		/>
	);
};

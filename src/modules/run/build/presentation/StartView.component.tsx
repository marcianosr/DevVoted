import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import type { SlotDealView } from "~/modules/run/run/application/runView.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	NewRunScreen,
	type DealtRow,
	type NewRunBuildRow,
	type StartCombo,
} from "~/ui/terminal-theme/screens/NewRunScreen.ui";
import type { BuyLineProps } from "~/ui/terminal-theme/BuyLine.ui";
import { plural } from "~/ui/terminal-theme/format";

const kb = (value: number) => `${value} KB`;

const versionOf = (config: Config) => `v${config.level ?? 1}`;

// The deal is the distinct configs the three starter stacks are built from, so
// a stack can be taken whole or mixed from the same rows.
const dealtFromStacks = (): readonly Config[] => {
	const seen = new Set<string>();

	return STARTER_STACKS.flatMap((stack) =>
		stack.configs.filter((config) => {
			if (seen.has(config.id)) return false;
			seen.add(config.id);
			return true;
		})
	);
};

const combosFor = (
	onPickStack: (stackId: string) => void
): readonly StartCombo[] =>
	STARTER_STACKS.map((stack) => ({
		id: stack.id,
		name: stack.name,
		blurb: stack.blurb,
		recommended: stack.recommended,
		takeLabel: "Take this stack",
		onTake: () => onPickStack(stack.id),
	}));

const slotLine = (
	deal: SlotDealView,
	label: string,
	onUse: () => void
): BuyLineProps | undefined => {
	if (deal.costKb === undefined) return undefined;
	return {
		label,
		detail: deal.refusal,
		price: kb(deal.costKb),
		onBuy: deal.refusal === undefined ? onUse : undefined,
	};
};

export type StartViewProps = {
	view: RunView;
	onToggle: (configId: string) => void;
	onPickStack: (stackId: string) => void;
	onBuySlot: () => void;
	onRefundSlot: () => void;
	onStart: () => void;
};

export const StartView = ({
	view,
	onToggle,
	onPickStack,
	onBuySlot,
	onRefundSlot,
	onStart,
}: StartViewProps) => {
	const { gateStake, startSlotDeals } = view;
	const swatch = swatchForGate(gateStake.gateNumber);
	const installed = new Set(view.configs.map((config) => config.id));

	const buildRows: readonly NewRunBuildRow[] = view.configs.map((config) => ({
		family: config.family,
		name: config.label,
		detail: config.description,
		slots: slotsOf(config),
		version: versionOf(config),
		remove: { label: `Uninstall ${config.label}`, onRemove: () => onToggle(config.id) },
	}));

	const dealt = dealtFromStacks().filter((config) => !installed.has(config.id));
	const dealtRows: readonly DealtRow[] = dealt.map((config) => {
		const fits = slotsOf(config) <= view.slotsFree;
		return {
			family: config.family,
			name: config.label,
			detail: config.description,
			slots: slotsOf(config),
			deployLabel: `Install ${config.label}`,
			onDeploy: fits ? () => onToggle(config.id) : undefined,
			locked: !fits,
		};
	});

	return (
		<NewRunScreen
			theme={view.gateTheme}
			header={{
				title: "New run",
				subtitle: `${swatch?.gateName ?? "First gate"} · ${gateStake.coverageDemand}% coverage · miss removes ${plural(gateStake.peelSlotsOnFailure, "slot")}`,
				swatch: swatch?.theme,
				swatchState: "pending",
				value: kb(startSlotDeals.archiveKb),
				caption: "archive",
			}}
			combos={{
				meta: `${STARTER_STACKS.length}`,
				rows: combosFor(onPickStack),
			}}
			storage={{
				meta: `${view.slotsUsed} of ${plural(view.slots, "slot")}`,
				slots: view.slots,
			}}
			build={{
				meta: `${view.configs.length}`,
				rows: buildRows,
				buySlot: slotLine(
					startSlotDeals.buy,
					`Buy slot ${view.slots + 1}`,
					onBuySlot
				),
				cashSlot: slotLine(
					startSlotDeals.cash,
					`Refund slot ${view.slots}`,
					onRefundSlot
				),
			}}
			dealt={{ meta: `${dealtRows.length}`, rows: dealtRows }}
			startLabel={view.canStart ? "Start the run →" : "Fill every slot to start"}
			onStart={view.canStart ? onStart : undefined}
		/>
	);
};

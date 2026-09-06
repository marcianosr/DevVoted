import { kbLabel } from "~/shared/lib/storage";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	maxLevelOf,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	NewRunScreen,
	type DealRow,
} from "~/ui/terminal-theme/screens/NewRunScreen.ui";
import type { SlotDealRow } from "~/ui/terminal-theme/SlotDeal.ui";
import { countRange, plural } from "~/ui/terminal-theme/format";

const slotRows = (
	view: RunView,
	onBuySlot: () => void,
	onRefundSlot: () => void
): readonly SlotDealRow[] => {
	const { buy, cash } = view.startSlotDeals;

	return [
		...(cash.costKb === undefined
			? []
			: [
					{
						name: `Slot ${view.slots} · empty`,
						label: `Hand slot ${view.slots} back`,
						detail: cash.refusal,
						price: kbLabel(cash.costKb),
						receives: true,
						onUse: cash.refusal === undefined ? onRefundSlot : undefined,
					},
				]),
		...(buy.costKb === undefined
			? []
			: [
					{
						name: `Slot ${view.slots + 1}`,
						label: `Buy slot ${view.slots + 1}`,
						detail: buy.refusal,
						price: kbLabel(buy.costKb),
						onUse: buy.refusal === undefined ? onBuySlot : undefined,
					},
				]),
	];
};

export type StartViewProps = {
	view: RunView;
	onToggle: (configId: string) => void;
	onBuySlot: () => void;
	onRefundSlot: () => void;
	onStart: () => void;
};

export const StartView = ({
	view,
	onToggle,
	onBuySlot,
	onRefundSlot,
	onStart,
}: StartViewProps) => {
	const { gateStake, startSlotDeals } = view;
	const swatch = swatchForGate(gateStake.gateNumber);
	const installed = new Set(view.configs.map((config) => config.id));

	const dealRow = (config: Config): DealRow => {
		const selected = installed.has(config.id);
		const fits = slotsOf(config) <= view.slotsFree;
		return {
			name: config.label,
			detail: config.description,
			slots: slotsOf(config),
			version: config.level ?? 1,
			maxVersion: maxLevelOf(config),
			selected,
			toggleLabel: selected
				? `Uninstall ${config.label}`
				: `Install ${config.label}`,
			onToggle: selected || fits ? () => onToggle(config.id) : undefined,
			locked: !selected && !fits,
			recommended: !selected && view.recommendedConfigIds.includes(config.id),
		};
	};

	return (
		<NewRunScreen
			theme={view.gateTheme}
			header={{
				title: "New run",
				subtitle: `${swatch?.gateName ?? "First gate"} · ${gateStake.coverageDemand}% coverage · ${gateStake.missIsFree ? "a miss costs nothing" : `miss removes ${countRange(gateStake.peelConfigsOnFailure.fewest, gateStake.peelConfigsOnFailure.most, "config")}`}`,
				swatch: swatch?.theme,
				swatchState: "pending",
				value: kbLabel(startSlotDeals.archiveKb),
				caption: "archive",
			}}
			dealt={{
				meta: `${view.configs.length} of ${view.available.length} picked`,
				rows: view.available.map(dealRow),
			}}
			storage={{
				meta: `${view.slotsUsed} of ${plural(view.slots, "slot")}`,
				slots: view.slots,
				slotRows: slotRows(view, onBuySlot, onRefundSlot),
			}}
			startLabel={view.canStart ? "Start the run →" : "Pick a config to start"}
			onStart={view.canStart ? onStart : undefined}
		/>
	);
};

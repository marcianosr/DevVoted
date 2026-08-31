import { useState } from "react";

import {
	type Config,
	headlineFigureOf,
	largestSizeFitting,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	StartScreen,
	type DealtConfig,
	type StartCombo,
} from "~/ui/modern-theme/screens/StartScreen.ui";
import { ConfigFacts } from "~/modules/run/config/presentation/ConfigFacts.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";
import { MAX_SLOTS } from "~/modules/run/run/domain/rules.model";
import { capLabel, plural } from "~/ui/modern-theme/format";

const BUY_VERB = "Install a new slot from the archive";
const REFUND_VERB = "Refund the slot to the archive";

const toDealt = (config: Config): DealtConfig => ({
	id: config.id,
	label: config.label,
	slots: slotsOf(config),
	summary: <ConfigFacts config={config} />,
	explainer: config.description,
	note: <Figure figure={headlineFigureOf(config)} plain />,
});

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

const shapeNoteFor = (
	configs: readonly Config[],
	slots: number
): string | undefined => {
	if (configs.length === 0) return undefined;
	const used = configs.reduce((total, config) => total + slotsOf(config), 0);
	const spare = slots - used;
	const takes = plural(used, "slot");
	return spare <= 0 ? `${takes} · fills it` : `${takes} · ${spare} spare`;
};

const combosFor = (
	onPickStack: (stackId: string) => void,
	slots: number
): readonly StartCombo[] =>
	STARTER_STACKS.map((stack) => ({
		id: stack.id,
		name: stack.name,
		blurb: stack.blurb,
		shape: shapeNoteFor(stack.configs, slots),
		recommended: stack.recommended,
		onTake: () => onPickStack(stack.id),
	}));

type SlotDealName = "buy" | "cash";

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
	const [armedDeal, setArmedDeal] = useState<SlotDealName | null>(null);
	const disarm = () => setArmedDeal(null);
	const armThenUse = (deal: SlotDealName, use: () => void) => () => {
		if (armedDeal !== deal) {
			setArmedDeal(deal);
			return;
		}
		disarm();
		use();
	};

	const gate = view.gateStake.gateNumber;
	const dealt = dealtFromStacks();

	return (
		<StartScreen
			archive={capLabel(view.startSlotDeals.archiveKb)}
			slotDeals={{
				buy: {
					...view.startSlotDeals.buy,
					verb: BUY_VERB,
					armed: armedDeal === "buy",
					onUse: armThenUse("buy", onBuySlot),
					onDismiss: disarm,
				},
				cash: {
					...view.startSlotDeals.cash,
					verb: REFUND_VERB,
					armed: armedDeal === "cash",
					onUse: armThenUse("cash", onRefundSlot),
					onDismiss: disarm,
				},
			}}
			theme={view.gateTheme}
			dealt={dealt.map(toDealt)}
			dealtFrom={view.available.length + view.configs.length}
			pickedIds={view.configs.map((config) => config.id)}
			onToggle={onToggle}
			combos={combosFor(onPickStack, view.slots)}
			slots={view.slots}
			maxSlots={MAX_SLOTS}
			fits={largestSizeFitting(view.slotsFree)}
			gateName={swatchForGate(gate)?.gateName ?? ""}
			pollCount={view.gateStake.pollsPerGate}
			coverageDemand={view.gateStake.coverageDemand}
			auditCount={view.gateStake.audits.length}
			streakCap={view.gateStake.perAnswer.streakCapMultiplier}
			stake={{
				removeOnMiss: view.gateStake.peelSlotsOnFailure,
				coveragePerWrong: view.gateStake.perAnswer.coveragePerWrong,
			}}
			reward={{
				coveragePerCorrect: view.gateStake.perAnswer.coveragePerCorrect,
				gateRewardKb: view.gateStake.modifiers.gateReward,
			}}
			onStart={onStart}
			canStart={view.canStart}
		/>
	);
};

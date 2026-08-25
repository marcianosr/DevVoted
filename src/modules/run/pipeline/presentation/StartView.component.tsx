import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { GATE_COUNT } from "~/modules/run/run/domain/rules.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	StartScreen,
	type DealtConfig,
	type StartCombo,
	type StartSlot,
} from "~/ui/modern-theme/screens/StartScreen.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";

// No summary: the rarity was the only thing it ever carried here, and the row
// now states that in its own colours beside the Dot.
const toDealt = (config: Config): DealtConfig => ({
	id: config.id,
	label: config.label,
	rarity: rarityOf(config),
	explainer: config.description,
	note: <Figure figure={headlineFigureOf(config)} />,
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

const combosFor = (
	onPickStack: (stackId: string) => void
): readonly StartCombo[] =>
	STARTER_STACKS.map((stack) => ({
		id: stack.id,
		name: stack.name,
		blurb: stack.blurb,
		recommended: stack.recommended,
		onTake: () => onPickStack(stack.id),
	}));

const slotRows = (view: RunView): readonly StartSlot[] => [
	...Array.from({ length: view.slots }, (_, index) => ({
		id: `slot-${index}`,
	})),
	...(view.nextSlotUnlock === null
		? []
		: [
				{
					id: "slot-next",
					gate: view.nextSlotUnlock.gate,
					coverage: view.nextSlotUnlock.coverage,
				},
			]),
];

/**
 * The slot number this gate's clear would open, for the clear-rewards list —
 * nothing when the next slot is waiting on coverage instead (ADR-041), since
 * that one is not a reward for clearing. Numbered from the live width, not
 * from the ladder row: the two diverge as soon as a grant lands out of order.
 */
const slotOpenedByClearing = (
	view: RunView,
	gate: number
): number | undefined =>
	view.nextSlotUnlock?.gate === gate ? view.slots + 1 : undefined;

export type StartViewProps = {
	view: RunView;
	onToggle: (configId: string) => void;
	onPickStack: (stackId: string) => void;
	onStart: () => void;
};

export const StartView = ({
	view,
	onToggle,
	onPickStack,
	onStart,
}: StartViewProps) => {
	const gate = view.gateStake.gateNumber;
	const dealt = dealtFromStacks();

	return (
		<StartScreen
			theme={view.gateTheme}
			dealt={dealt.map(toDealt)}
			dealtFrom={view.available.length + view.configs.length}
			pickedIds={view.configs.map((config) => config.id)}
			onToggle={onToggle}
			combos={combosFor(onPickStack)}
			slots={slotRows(view)}
			gateName={swatchForGate(gate)?.gateName ?? ""}
			gateNumber={gate}
			gateCount={GATE_COUNT}
			pollCount={view.gateStake.pollsPerGate}
			coverageDemand={view.gateStake.coverageDemand}
			auditCount={view.gateStake.audits.length}
			streakCap={view.gateStake.perAnswer.streakCapMultiplier}
			stake={{
				removeOnMiss: view.gateStake.stripsOnFailure,
				coveragePerWrong: view.gateStake.perAnswer.coveragePerWrong,
			}}
			reward={{
				coveragePerCorrect: view.gateStake.perAnswer.coveragePerCorrect,
				gateRewardKb: view.gateStake.modifiers.gateReward,
				slotOpens: slotOpenedByClearing(view, gate),
			}}
			onStart={onStart}
		/>
	);
};

import {
	type Config,
	headlineFigureOf,
	largestGradeFitting,
	rarityOf,
	shapeOf,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import { MAX_SPOTS } from "~/modules/run/pipeline/domain/pipeline.model";
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

const toDealt = (config: Config): DealtConfig => ({
	id: config.id,
	label: config.label,
	rarity: rarityOf(config),
	spots: spotsOf(config),
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
	spots: number
): string | undefined => {
	if (configs.length === 0) return undefined;
	const spare = spots - configs.reduce((total, c) => total + spotsOf(c), 0);
	const shape = shapeOf(configs);
	return spare <= 0 ? `${shape} · fills it` : `${shape} · ${spare} spare`;
};

const combosFor = (
	onPickStack: (stackId: string) => void,
	spots: number
): readonly StartCombo[] =>
	STARTER_STACKS.map((stack) => ({
		id: stack.id,
		name: stack.name,
		blurb: stack.blurb,
		shape: shapeNoteFor(stack.configs, spots),
		recommended: stack.recommended,
		onTake: () => onPickStack(stack.id),
	}));

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
			combos={combosFor(onPickStack, view.spots)}
			spots={view.spots}
			maxSpots={MAX_SPOTS}
			fits={largestGradeFitting(view.spotsFree)}
			gateName={swatchForGate(gate)?.gateName ?? ""}
			pollCount={view.gateStake.pollsPerGate}
			coverageDemand={view.gateStake.coverageDemand}
			auditCount={view.gateStake.audits.length}
			streakCap={view.gateStake.perAnswer.streakCapMultiplier}
			stake={{
				removeOnMiss: view.gateStake.peelSpotsOnFailure,
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

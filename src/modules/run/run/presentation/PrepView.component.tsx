import { gateClearPayout } from "~/modules/run/build/domain/build.model";
import { percentOf } from "~/modules/run/build/domain/coverageRatio.model";
import { PEEL_KB_PER_SLOT } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	type PrepWindow,
	prepPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { PrepScreen } from "~/ui/kanto-theme/PrepScreen.ui";

export type PrepViewProps = {
	view: RunView;
	onStart: () => void;
	onBackToShop: () => void;
	backLabel?: string;
};

export const planTierOf = (view: RunView): number =>
	view.storagePlan.options.find((option) => option.held)?.tier ?? 0;

const windowOf = (view: RunView): PrepWindow => ({
	answerTypes: view.answerTypesThisGate ?? { single: 0, multiple: 0 },
	optionCounts: view.optionCountsThisGate ?? [],
	categories: view.upcomingCategories ?? [],
	nextCategories: view.nextGateCategories ?? [],
});

const BACK_TO_SHOP = "Back to the shop";

export const PrepView = ({
	view,
	onStart,
	onBackToShop,
	backLabel = BACK_TO_SHOP,
}: PrepViewProps) => {
	const { gateStake } = view;
	const props = prepPropsFor({
		gate: gateStake.gateNumber,
		configs: view.configs,
		balanceKb: view.storage,
		planTier: planTierOf(view),
		window: windowOf(view),
		answered: view.answeredThisGate.length,
		bar: { ...gateStake.coverageLadder, held: gateStake.coverageHeld },
		coverageGainPercent: percentOf(gateStake.perAnswer.coveragePerCorrect),
		peelKb: gateStake.peelSlotsOnFailure * PEEL_KB_PER_SLOT,
		payout: (correct) =>
			gateClearPayout(view.configs, correct, gateStake.gateNumber),
	});

	return (
		<PrepScreen
			{...props}
			footer={{
				...props.footer,
				action: {
					...props.footer.action,
					onPress: view.pollsExhausted ? undefined : onStart,
				},
				aside: {
					label: backLabel,
					icon: "back",
					iconAt: "lead",
					onPress: onBackToShop,
				},
			}}
		/>
	);
};

import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
	largestSizeFitting,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { MAX_SLOTS } from "~/modules/run/run/domain/rules.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import {
	PrepScreen,
	type PrepAudit,
	type PrepBill,
	type PrepConfig,
} from "~/ui/modern-theme/screens/PrepScreen.ui";
import { toAuditId } from "~/ui/modern-theme/audits";
import { ConfigFacts } from "~/modules/run/config/presentation/ConfigFacts.ui";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import { Figure } from "~/ui/modern-theme/Figure.ui";

const configRows = (configs: readonly Config[]): readonly PrepConfig[] =>
	configs.map((config) => ({
		id: config.id,
		label: config.label,
		slots: slotsOf(config),
		minified: config.minified,
		note: <Figure figure={headlineFigureOf(config)} plain />,
		summary: (
			<ConfigFacts config={config} refundKb={sellRefundIn(configs, config)} />
		),
		explainer: config.description,
	}));

const auditRows = (view: RunView): readonly PrepAudit[] =>
	view.gateStake.audits.flatMap((audit): readonly PrepAudit[] => {
		const id = toAuditId(audit.id);
		return id === null
			? []
			: [{ id, description: audit.description, suppressed: audit.suppressed }];
	});

const billRows = (view: RunView): readonly PrepBill[] =>
	view.gateStake.subscriptions.lines.map((line) => ({
		id: line.id,
		label: line.label,
		kb: -line.kb,
		billedOnMiss: line.billedOnMiss,
	}));

const categoryNames = (
	categories: readonly Parameters<typeof getCategoryMetadata>[0][] | null
): readonly string[] =>
	(categories ?? []).map((code) => getCategoryMetadata(code).name);

const prefetchFor = (view: RunView) =>
	view.upcomingCategories === null
		? undefined
		: {
				thisGate: categoryNames(view.upcomingCategories),
				nextGate: categoryNames(view.nextGateCategories),
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
	const gate = view.gateStake.gateNumber;
	const gateName = swatchForGate(gate)?.gateName ?? "";
	const { subscriptions, perAnswer, modifiers } = view.gateStake;

	return (
		<PrepScreen
			theme={view.gateTheme}
			gate={{
				title: `Gate ${gate} · ${gateName}`,
				audits: auditRows(view).map((audit) => audit.id),
				storage: { balanceKb: view.storage },
				track: { gates: ALL_SWATCHES, cleared: view.gatesCleared },
			}}
			gateName={gateName}
			pollCount={view.gateStake.pollsPerGate}
			coverageDemand={view.gateStake.coverageDemand}
			coverageHeld={view.gateStake.coverageHeld}
			removeOnMiss={view.gateStake.peelSlotsOnFailure}
			missIsFatal={view.gateStake.missIsFatal}
			coveragePerWrong={view.gateStake.perAnswer.coveragePerWrong}
			configs={configRows(view.configs)}
			slots={view.slots}
			maxSlots={MAX_SLOTS}
			fits={largestSizeFitting(view.slotsFree)}
			audits={auditRows(view)}
			reward={{
				coveragePerCorrect: perAnswer.coveragePerCorrect,
				storageKbPerCorrect: perAnswer.storageKbPerCorrect,
				matchingMultiplier: perAnswer.matchingConfigMultiplier,
				streakMultiplier: perAnswer.streakStepMultiplier,
				gateRewardKb: modifiers.gateReward,
			}}
			bills={billRows(view)}
			shortfallKb={
				subscriptions.shortfallKb > 0 ? subscriptions.shortfallKb : undefined
			}
			prefetch={prefetchFor(view)}
			startLock={view.pollsExhausted ? "opens with the next window" : undefined}
			onStart={onStart}
			onBackToShop={onBackToShop}
			onCommunity={onCommunity}
		/>
	);
};

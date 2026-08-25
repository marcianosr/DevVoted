import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
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
	type PrepSlot,
} from "~/ui/modern-theme/screens/PrepScreen.ui";
import { toAuditId } from "~/ui/modern-theme/audits";
import { Figure } from "~/ui/modern-theme/Figure.ui";

const configRows = (configs: readonly Config[]): readonly PrepConfig[] =>
	configs.map((config) => ({
		id: config.id,
		label: config.label,
		rarity: rarityOf(config),
		note: <Figure figure={headlineFigureOf(config)} />,
		// The rarity is stated in the row's own colours beside the Dot, so
		// repeating it here would only bury the version.
		summary: config.level === undefined ? undefined : `v${config.level}`,
		explainer: config.description,
	}));

const slotRows = (view: RunView): readonly PrepSlot[] => {
	const empty = Math.max(0, view.slots - view.configs.length);
	if (empty > 0)
		return Array.from({ length: empty }, (_, index) => ({
			id: `slot-${view.configs.length + index}`,
		}));

	return view.nextSlotGate === null
		? []
		: [{ id: "slot-next", gate: view.nextSlotGate }];
};

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
				storage: {
					plan:
						view.storageBillKb === 0
							? "Free tier"
							: `${view.storageBillKb} KB / gate`,
					used: view.storage,
					cap: view.storageCap,
				},
				track: { gates: ALL_SWATCHES, cleared: view.gatesCleared },
			}}
			gateName={gateName}
			pollCount={view.gateStake.pollsPerGate}
			coverageDemand={view.gateStake.coverageDemand}
			coverageHeld={view.gateStake.coverageHeld}
			removeOnMiss={view.gateStake.stripsOnFailure}
			missIsFatal={view.gateStake.missIsFatal}
			coveragePerWrong={view.gateStake.perAnswer.coveragePerWrong}
			configs={configRows(view.configs)}
			slots={slotRows(view)}
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

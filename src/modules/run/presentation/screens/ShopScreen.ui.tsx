import type { ReactNode } from "react";
import {
	Config,
	draftCost,
	isUpgradable,
	sellRefund,
	upgradeCost,
	upgradeCoverageRequired,
} from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { Button } from "~/ui/Button.component";
import { Tooltip } from "~/ui/Tooltip.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { Loadout } from "../pipeline/Loadout.ui";
import { MultiplierSummary } from "../run/MultiplierSummary.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	configs: readonly Config[];
	slots: number;
	gateReward: number;
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
	newConfigIds: readonly string[];
	draftOptions: readonly Config[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	coverage: number;
	slotCoverageRequired: number;
	canAddSlot: boolean;
	onAddSlot: () => void;
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
};

const PathCard = ({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) => (
	<section className="flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-900/40 p-5">
		<header>
			<Title as="h3" size="sm">
				{title}
			</Title>
			<Subtitle>{description}</Subtitle>
		</header>
		{children}
	</section>
);

export const ShopScreen = ({
	storage,
	coverageByCategory,
	checks,
	gateNumber,
	configs,
	slots,
	gateReward,
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
	newConfigIds,
	draftOptions,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	coverage,
	slotCoverageRequired,
	canAddSlot,
	onAddSlot,
	onUpgrade,
	onSell,
}: ShopScreenProps) => {
	const atSlotCap = !Number.isFinite(slotCoverageRequired);
	const isFull = configs.filter((config) => !config.fixed).length >= slots;

	const canUpgrade = (config: Config): boolean => {
		const level = config.level ?? 1;
		if (config.focusCategory)
			return (
				(coverageByCategory[config.focusCategory] ?? 0) >=
				upgradeCoverageRequired(level)
			);
		return storage >= upgradeCost(level);
	};
	const upgradeLabel = (config: Config): string => {
		const level = config.level ?? 1;
		return config.focusCategory
			? `Upgrade (${upgradeCoverageRequired(level)}% cov)`
			: `Upgrade (${upgradeCost(level)}KB)`;
	};
	const actionsFor = (config: Config) =>
		[
			isUpgradable(config)
				? {
						label: upgradeLabel(config),
						onClick: () => onUpgrade(config.id),
						disabled: !canUpgrade(config),
					}
				: null,
			config.fixed
				? null
				: {
						label: `Sell +${sellRefund(config)}KB`,
						onClick: () => onSell(config.id),
					},
		].filter((action): action is NonNullable<typeof action> => action !== null);

	const expandTile = atSlotCap ? null : canAddSlot ? (
		<button
			type="button"
			onClick={onAddSlot}
			className="rounded-lg border-2 border-dashed border-cerulean px-4 py-2 text-sm font-semibold text-cerulean transition hover:bg-cerulean/10"
		>
			＋ Add slot: {slots} → {slots + 1}
		</button>
	) : (
		<Tooltip
			content={`at ${slotCoverageRequired}% coverage — you have ${coverage}%`}
		>
			<span className="rounded-lg border-2 border-dashed border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400">
				Expand to {slots + 1} slots
			</span>
		</Tooltip>
	);
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-3">
				<div>
					<Title>Upgrade your pipeline</Title>
					<Subtitle>
						Expand your load-out or make your pipeline stricter!
					</Subtitle>
				</div>
				<MultiplierSummary
					rewardMultiplier={rewardMultiplier}
					coverageMultiplier={coverageMultiplier}
					coverageAdd={coverageAdd}
				/>
			</header>

			<div className="grid grid-cols-1 gap-4">
				<PathCard
					title="Select new configs"
					description="Adds categories → boosts coverage fastest"
				>
					<div className="flex flex-wrap gap-3">
						{draftOptions.map((config) => {
							const cost = draftCost(config);
							return (
								<ConfigChip
									key={config.id}
									config={config}
									action="draft ＋"
									price={cost}
									disabled={isFull || storage < cost}
									onClick={() => onDraft(config.id)}
								/>
							);
						})}
					</div>
					<Button
						variant="secondary"
						size="small"
						className="self-start"
						disabled={!canRebuild}
						onClick={onRebuild}
					>
						Rebuild configs ({rebuildCost}KB)
					</Button>
				</PathCard>
			</div>

			<Loadout
				configs={configs}
				slots={slots}
				gateNumber={gateNumber}
				gateReward={gateReward}
				newConfigIds={newConfigIds}
				actionsFor={actionsFor}
				trailing={expandTile}
			/>

			<RoleList rows={roleRows(configs, checks)} />
		</div>
	);
};

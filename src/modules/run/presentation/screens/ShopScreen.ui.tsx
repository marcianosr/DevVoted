import type { ReactNode } from "react";
import {
	Config,
	describeConfig,
	draftCost,
	givesOf,
	isUpgradable,
	needsOf,
	sellRefund,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { PipelineReportRow } from "../gate/PipelineReportRow.ui";
import { PipelineTable } from "../gate/PipelineTable.ui";
import { RoleList } from "../gate/RoleList.ui";

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

// The shop's row controls share one shape: a bordered pill whose label reads
// plain and whose price glows saffron. Buying is the loud one (viridian);
// an unlocked upgrade wears the legendary Kanto ring (prismatic).
const actionTone = ({
	loud,
	prismatic,
}: {
	loud: boolean;
	prismatic: boolean;
}): string => {
	if (prismatic)
		return "border-transparent legendary-ring text-zinc-100 enabled:hover:brightness-125";
	if (loud)
		return "border-viridian bg-viridian/10 text-zinc-100 enabled:hover:bg-viridian/20";
	return "border-zinc-600 text-zinc-300 enabled:hover:border-zinc-400";
};

const actionButton = ({
	label,
	price,
	onClick,
	disabled = false,
	loud = false,
	prismatic = false,
}: {
	label: string;
	price?: string;
	onClick?: () => void;
	disabled?: boolean;
	loud?: boolean;
	prismatic?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className={`rounded-lg border px-3 py-1.5 text-sm transition ${actionTone({ loud, prismatic })} enabled:cursor-pointer disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600`}
	>
		{label}
		{price ? (
			<>
				{" "}
				<span className="ml-1 font-bold text-saffron">{price}</span>
			</>
		) : null}
	</button>
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
	const isFull = configs.length >= slots;

	// Focus upgrades are coverage-gated and free; Unit Tests' upgrade is
	// storage-priced (32KB × the level bought) with no coverage requirement.
	const canUpgrade = (config: Config): boolean => {
		if (!config.focusCategory)
			return storage >= upgradeStorageCost(config.level ?? 1);
		return (
			(coverageByCategory[config.focusCategory] ?? 0) >=
			upgradeCoverageRequired(config.level ?? 1)
		);
	};

	// Hovering Upgrade always previews the next level's concrete effect; while
	// gated it adds what the upgrade wants — the category-tied coverage for a
	// focus config (its name in its own Kanto color), the KB price otherwise.
	const upgradeTooltip = (config: Config): ReactNode => {
		const nextLevel = (config.level ?? 1) + 1;
		const preview = `L${nextLevel}: ${describeConfig({ ...config, level: nextLevel })}`;
		if (canUpgrade(config)) return preview;
		if (!config.focusCategory) {
			const cost = upgradeStorageCost(config.level ?? 1);
			return `${preview} Costs ${cost}KB — you have ${storage}KB.`;
		}
		const required = upgradeCoverageRequired(config.level ?? 1);
		const have = coverageByCategory[config.focusCategory] ?? 0;
		return (
			<>
				{preview} Unlocks at {required}%{" "}
				<span
					{...categoryTheme(config.focusCategory)}
					className="font-bold text-theme"
				>
					{getCategoryMetadata(config.focusCategory).name}
				</span>{" "}
				coverage — you have {have}%.
			</>
		);
	};

	const loadoutActions = (config: Config): ReactNode => {
		const upgradeButton = isUpgradable(config)
			? actionButton({
					label: "Upgrade",
					price: config.focusCategory
						? undefined
						: `${upgradeStorageCost(config.level ?? 1)}KB`,
					onClick: () => onUpgrade(config.id),
					disabled: !canUpgrade(config),
					prismatic: canUpgrade(config),
				})
			: null;
		return (
			<span className="flex items-center gap-2">
				{upgradeButton ? (
					<Tooltip content={upgradeTooltip(config)}>{upgradeButton}</Tooltip>
				) : null}
				{actionButton({
					label: "Deinstall",
					price: `${sellRefund(config)}KB`,
					onClick: () => onSell(config.id),
				})}
			</span>
		);
	};

	const offerAction = (config: Config): ReactNode => {
		const cost = draftCost(config);
		if (storage < cost)
			return (
				<Paragraph as="span" size="sm" tone="muted">
					need <span className="font-bold text-saffron/70">{cost}KB</span>
				</Paragraph>
			);
		const buy = actionButton({
			label: "Install",
			price: `${cost}KB`,
			onClick: () => onDraft(config.id),
			disabled: isFull,
			loud: true,
		});
		if (!isFull) return buy;
		return (
			<Tooltip content="Add a new slot to upgrade or sell an existing config">
				{buy}
			</Tooltip>
		);
	};

	const expandBar =
		"block w-full rounded-lg border-2 border-dashed px-4 py-2 text-center text-sm font-semibold";
	const expandTile = atSlotCap ? null : canAddSlot ? (
		<button
			type="button"
			onClick={onAddSlot}
			className={`${expandBar} border-cerulean text-cerulean transition hover:bg-cerulean/10`}
		>
			＋ Add slot: {slots} → {slots + 1}
		</button>
	) : (
		<Tooltip
			className="w-full"
			content={`at ${slotCoverageRequired}% coverage — you have ${coverage}%`}
		>
			<span className={`${expandBar} border-zinc-700 text-zinc-400`}>
				Expand to {slots + 1} slots
			</span>
		</Tooltip>
	);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<Title>Upgrade your pipeline</Title>
				<Subtitle>
					Expand your load-out or make your pipeline stricter!
				</Subtitle>
			</header>

			<section className="flex flex-col gap-2">
				<header>
					<Title as="h3">Install new configs</Title>
					<Subtitle>New categories raise coverage fastest</Subtitle>
				</header>
				<PipelineTable>
					{draftOptions.map((config) => (
						<PipelineReportRow
							key={config.id}
							badge="skip"
							mark="add"
							layout="table"
							config={config}
							description={describeConfig(config)}
							gives={givesOf(config)}
							needs={needsOf(config)}
							costs={config.costs}
							dimmed={storage < draftCost(config)}
							trailing={offerAction(config)}
						/>
					))}
				</PipelineTable>
				<span className="self-start">
					{actionButton({
						label: "Reroll offers",
						price: `${rebuildCost}KB`,
						onClick: onRebuild,
						disabled: !canRebuild,
					})}
				</span>
			</section>

			<section className="flex flex-col gap-2">
				<header>
					<Title as="h2">Your load-out for gate {gateNumber}</Title>
					<Subtitle>
						{configs.length} of {slots} slots used
					</Subtitle>
				</header>
				<RoleList
					rows={roleRows(configs, checks)}
					slots={slots}
					trailingFor={loadoutActions}
					newConfigIds={newConfigIds}
					trailing={expandTile}
				/>
				<Paragraph size="sm" className="self-center">
					<span className="font-extrabold text-gradient-green">
						+{gateReward}KB
					</span>{" "}
					storage this gate ·{" "}
					<span className="font-extrabold text-gradient-green">
						×{rewardMultiplier}
					</span>{" "}
					reward ·{" "}
					<span className="font-extrabold text-gradient-green">
						×{coverageMultiplier}
						{coverageAdd > 0 ? ` +${coverageAdd}%` : ""}
					</span>{" "}
					coverage
				</Paragraph>
			</section>
		</div>
	);
};

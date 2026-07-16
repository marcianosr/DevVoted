import type { ReactNode } from "react";
import { getCategoryMetadata } from "~/domains/shared/categories";
import {
	Config,
	draftCost,
	focusCoverageMultiplier,
	upgradeCost,
	upgradeCoverageRequired,
} from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Button } from "~/ui/Button.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/session-run/gate/configRole.model";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { Loadout } from "../pipeline/Loadout.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	configs: readonly Config[];
	slots: number;
	newConfigIds: readonly string[];
	draftOptions: readonly Config[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	canAddSlot: boolean;
	onAddSlot: () => void;
	upgradeable: readonly Config[];
	onUpgrade: (configId: string) => void;
};

/** One upgrade path, rendered as a card: a heading and description over its actions. */
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
	newConfigIds,
	draftOptions,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	canAddSlot,
	onAddSlot,
	upgradeable,
	onUpgrade,
}: ShopScreenProps) => {
	const isFull = configs.filter((config) => !config.fixed).length >= slots;
	return (
		<div className="flex flex-col gap-6">
			<header>
				<Title>Upgrade your pipeline</Title>
				<Subtitle>
					Expand your load-out or make your pipeline stricter!
				</Subtitle>
			</header>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
						variant="primary"
						className="self-start rounded-lg text-sm"
						disabled={!canRebuild}
						onClick={onRebuild}
					>
						Rebuild configs ({rebuildCost}KB)
					</Button>
				</PathCard>

				{upgradeable.length > 0 ? (
					<PathCard
						title="Upgrade a config"
						description="Raises requirement, raises reward"
					>
						<div className="flex flex-wrap gap-3">
							{upgradeable.map((config) => {
								const level = config.level ?? 1;
								// Focus configs gate on reaching category coverage; Unit Tests costs KB.
								if (config.focusCategory) {
									const need = upgradeCoverageRequired(level);
									const have = coverageByCategory[config.focusCategory] ?? 0;
									const met = have >= need;
									const name = getCategoryMetadata(config.focusCategory).name;
									const subline = (
										<>
											<span className="prismatic-text">
												{focusCoverageMultiplier(level)}×
											</span>
											{" → "}
											<span className="prismatic-text">
												{focusCoverageMultiplier(level + 1)}×
											</span>
										</>
									);
									return (
										<ConfigChip
											key={config.id}
											config={config}
											subline={subline}
											tooltip={`Reach ${need}% ${name} coverage to upgrade — you have ${have}%.`}
											disabled={!met}
											onClick={() => onUpgrade(config.id)}
										/>
									);
								}
								const cost = upgradeCost(level);
								const subline = (
									<>
										<span className="prismatic-text">{level} correct</span>
										{" → "}
										<span className="prismatic-text">{level + 1} correct</span>
									</>
								);
								return (
									<ConfigChip
										key={config.id}
										config={config}
										subline={subline}
										price={cost}
										disabled={storage < cost}
										onClick={() => onUpgrade(config.id)}
									/>
								);
							})}
						</div>
					</PathCard>
				) : null}

				<PathCard
					title="Expand your pipeline"
					description="More slots, more can fail"
				>
					{canAddSlot ? (
						<Button
							variant="primary"
							className="self-start rounded-lg text-sm"
							onClick={onAddSlot}
						>
							Add a slot: {slots} → {slots + 1}
						</Button>
					) : null}
				</PathCard>
			</div>

			<Loadout
				configs={configs}
				slots={slots}
				gateNumber={gateNumber}
				newConfigIds={newConfigIds}
			/>

			<RoleList rows={roleRows(configs, checks)} />
		</div>
	);
};

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
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { Loadout } from "../pipeline/Loadout.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	pollsToGate: number;
	gateReward: number;
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

export const ShopScreen = ({
	storage,
	coverageByCategory,
	checks,
	gateNumber,
	pollsToGate,
	gateReward,
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
			<Title>Upgrade your pipeline</Title>

			<div className="flex flex-wrap items-start gap-8 rounded-xl border-2 border-zinc-700 bg-zinc-900/40 p-5">
				<section className="flex flex-col gap-3">
					<Subtitle>Select new configs</Subtitle>
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
						variant="theme"
						className="self-start rounded-lg text-sm"
						disabled={!canRebuild}
						onClick={onRebuild}
					>
						Rebuild configs ({rebuildCost}KB)
					</Button>
				</section>

				{upgradeable.length > 0 ? (
					<section className="flex flex-col gap-3">
						<Subtitle>Upgrade a config</Subtitle>
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
					</section>
				) : null}

				<section className="flex flex-col gap-2">
					<Subtitle>Expand your pipeline</Subtitle>
					<Paragraph>Add more slots to your pipeline.</Paragraph>
					{canAddSlot ? (
						<button
							type="button"
							onClick={onAddSlot}
							className="cursor-pointer self-start rounded-lg border border-theme px-3 py-2 text-sm text-theme transition hover:bg-theme hover:text-black"
						>
							Add a slot: {slots} → {slots + 1}
						</button>
					) : null}
				</section>
			</div>

			<Loadout
				configs={configs}
				slots={slots}
				gateNumber={gateNumber}
				newConfigIds={newConfigIds}
			/>

			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>
		</div>
	);
};

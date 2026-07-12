import {
	Config,
	focusCoverageMultiplier,
	upgradeCost,
} from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { Pipeline } from "../pipeline/Pipeline.ui";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type RewardScreenProps = {
	storage: number;
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
	onNext: () => void;
};

export const RewardScreen = ({
	storage,
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
	onNext,
}: RewardScreenProps) => {
	const isFull = configs.length >= slots;
	const isOwnedFocus = (config: Config) =>
		configs.some(
			(equipped) => equipped.id === config.id && equipped.focusCategory
		);
	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-viridian bg-viridian/10 p-6">
				<Title>Gate cleared — build your pipeline</Title>
				<Paragraph>
					Storage: <span className="font-bold text-saffron">{storage}KB</span>
				</Paragraph>
			</div>

			<Pipeline configs={configs} slots={slots} newConfigIds={newConfigIds} />

			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>

			<section className="flex flex-col gap-4">
				<Title as="h2" className="text-xl">
					Draft configs
				</Title>
				<Subtitle>
					Configs construct your pipeline — they provide perks but also
					requirements for pipelines.
				</Subtitle>
				<div className="flex flex-wrap gap-3">
					{draftOptions.map((config) => (
						<ConfigChip
							key={config.id}
							config={config}
							action={isOwnedFocus(config) ? "upgrade ＋" : "draft ＋"}
							disabled={isFull && !isOwnedFocus(config)}
							onClick={() => onDraft(config.id)}
						/>
					))}
				</div>
			</section>

			<section className="flex gap-2">
				<button
					type="button"
					disabled={!canRebuild}
					onClick={onRebuild}
					className="cursor-pointer rounded-lg border border-theme px-4 py-2 text-sm text-theme transition enabled:hover:bg-theme enabled:hover:text-black disabled:opacity-40"
				>
					Rebuild draft ({rebuildCost}KB)
				</button>
				{canAddSlot ? (
					<button
						type="button"
						onClick={onAddSlot}
						className="cursor-pointer rounded-lg border border-theme px-3 py-2 text-sm text-theme transition hover:bg-theme hover:text-black"
					>
						Add a slot: {slots} → {slots + 1}
					</button>
				) : null}
			</section>

			{upgradeable.length > 0 ? (
				<section className="flex flex-col gap-3">
					<Paragraph>Or upgrade a Focus config</Paragraph>
					<div className="flex flex-wrap gap-3">
						{upgradeable.map((config) => {
							const level = config.level ?? 1;
							const cost = upgradeCost(level);
							const action = (
								<>
									<span className="prismatic-text">
										{focusCoverageMultiplier(level)}×
									</span>
									{" → "}
									<span className="prismatic-text">
										{focusCoverageMultiplier(level + 1)}×
									</span>
									{` · ${cost}KB`}
								</>
							);
							return (
								<ConfigChip
									key={config.id}
									config={config}
									action={action}
									disabled={storage < cost}
									onClick={() => onUpgrade(config.id)}
								/>
							);
						})}
					</div>
				</section>
			) : null}

			<button
				type="button"
				onClick={onNext}
				className="cursor-pointer self-start rounded-lg bg-cerulean px-6 py-3 font-bold text-black transition hover:brightness-110"
			>
				Next →
			</button>
		</div>
	);
};

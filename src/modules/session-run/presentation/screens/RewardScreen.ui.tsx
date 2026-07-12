import type { Config } from "~/modules/session-run/configs/config";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { ConfigRow } from "../configs/ConfigRow.ui";

type RewardScreenProps = {
	storage: number;
	draftOptions: readonly Config[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	slots: number;
	canAddSlot: boolean;
	onAddSlot: () => void;
	upgradeable: readonly Config[];
	onUpgrade: (configId: string) => void;
	onSkip: () => void;
};

export const RewardScreen = ({
	storage,
	draftOptions,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	slots,
	canAddSlot,
	onAddSlot,
	upgradeable,
	onUpgrade,
	onSkip,
}: RewardScreenProps) => (
	<div className="flex flex-col gap-6">
		<div className="rounded-xl border border-viridian bg-viridian/10 p-6">
			<Title>Gate cleared — take one reward</Title>
			<Paragraph>
				Storage: <span className="font-bold text-saffron">{storage}KB</span>
			</Paragraph>
		</div>

		<section className="flex flex-col gap-2">
			<Paragraph>Draft a config</Paragraph>
			{draftOptions.map((config) => (
				<ConfigRow
					key={config.id}
					config={config}
					action="draft ＋"
					onClick={() => onDraft(config.id)}
				/>
			))}
			<button
				type="button"
				disabled={!canRebuild}
				onClick={onRebuild}
				className="mt-1 self-start rounded-lg border border-cerulean px-4 py-2 text-sm font-bold text-cerulean transition enabled:hover:bg-cerulean enabled:hover:text-black disabled:opacity-40"
			>
				Rebuild draft ({rebuildCost}KB)
			</button>
		</section>

		{canAddSlot ? (
			<button
				type="button"
				onClick={onAddSlot}
				className="self-start rounded-lg border border-viridian px-3 py-2 text-sm text-viridian transition hover:bg-viridian hover:text-black"
			>
				Add a slot: {slots} → {slots + 1}
			</button>
		) : null}

		{upgradeable.length > 0 ? (
			<section className="flex flex-col gap-2">
				<Paragraph>Or upgrade a Focus config</Paragraph>
				<div className="flex flex-wrap gap-2">
					{upgradeable.map((config) => (
						<ConfigChip
							key={config.id}
							config={config}
							action={`→ L${(config.level ?? 1) + 1}`}
							onClick={() => onUpgrade(config.id)}
						/>
					))}
				</div>
			</section>
		) : null}

		<button
			type="button"
			onClick={onSkip}
			className="self-start rounded-lg bg-zinc-800 px-6 py-3 font-bold text-white transition hover:brightness-125"
		>
			Skip reward →
		</button>
	</div>
);

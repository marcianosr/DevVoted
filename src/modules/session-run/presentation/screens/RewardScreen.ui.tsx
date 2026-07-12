import type { Config } from "~/modules/session-run/configs/config.model";
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
}: RewardScreenProps) => (
	<div className="flex flex-col gap-6">
		<div className="rounded-xl border border-viridian bg-viridian/10 p-6">
			<Title>Gate cleared — take one reward</Title>
			<Paragraph>
				Storage: <span className="font-bold text-saffron">{storage}KB</span>
			</Paragraph>
		</div>

		<section className="flex flex-col gap-4">
			<Title>Configure your pipeline</Title>
			<section className="flex gap-2">
				{draftOptions.map((config) => (
					<ConfigRow
						key={config.id}
						config={config}
						action="draft ＋"
						onClick={() => onDraft(config.id)}
					/>
				))}
			</section>
		</section>

		<section className="flex gap-2">
			<button
				type="button"
				disabled={!canRebuild}
				onClick={onRebuild}
				className="rounded-lg border border-theme px-4 py-2 text-sm text-theme transition enabled:hover:bg-theme enabled:hover:text-black disabled:opacity-40 cursor-pointer"
			>
				Rebuild draft ({rebuildCost}KB)
			</button>
			{canAddSlot ? (
				<button
					type="button"
					onClick={onAddSlot}
					className="rounded-lg border border-theme px-3 py-2 text-sm text-theme transition hover:bg-theme hover:text-black cursor-pointer"
				>
					Add a slot: {slots} → {slots + 1}
				</button>
			) : null}
		</section>

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
	</div>
);

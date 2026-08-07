import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import type { Config } from "~/modules/run/configs/config.model";
import { draftCost, sellRefund } from "~/modules/run/configs/config.model";

type StorageConfig = {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly currentLevel: number;
	readonly nextLevelCost: number | null;
	readonly maxLevel: boolean;
};

type DualShopProps = {
	// Pipeline
	pipelineDraftOptions: readonly Config[];
	pipelineConfigs: readonly Config[];
	pipelineSlots: number;
	pipelineRebuildCost: number;
	onPipelineDraft: (id: string) => void;
	onPipelineRebuild: () => void;
	onPipelineUpgrade?: (id: string) => void;
	onPipelineSell: (id: string) => void;

	// Storage
	storage: number;
	storageCap: number;
	storageConfigs: readonly StorageConfig[];
	storageRebuildCost: number;
	draftCostReduction: number;
	onStorageUpgrade: (id: string) => void;
	onStorageDeinstall: (id: string) => void;
};

export const DualShop = ({
	pipelineDraftOptions,
	pipelineConfigs,
	pipelineSlots,
	pipelineRebuildCost,
	onPipelineDraft,
	onPipelineRebuild,
	onPipelineSell,
	storage,
	storageCap,
	storageConfigs,
	storageRebuildCost,
	draftCostReduction,
	onStorageUpgrade,
	onStorageDeinstall,
}: DualShopProps) => (
	<div className="grid grid-cols-2 gap-12">
		{/* Pipeline Column */}
		<div className="space-y-6">
			<header>
				<Title as="h2">Pipeline</Title>
				<Subtitle className="text-xs">
					{pipelineConfigs.length} of {pipelineSlots} · every one adds a check
				</Subtitle>
			</header>

			{/* Offers */}
			<div className="space-y-3">
				<Paragraph size="xs" tone="muted">
					on offer
				</Paragraph>
				<div className="space-y-2">
					{pipelineDraftOptions.map((config) => (
						<button
							key={config.id}
							type="button"
							onClick={() => onPipelineDraft(config.id)}
							className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 transition hover:border-zinc-500"
						>
							<div className="flex-1 text-left">
								<Paragraph size="sm" className="font-semibold">
									{config.label}
								</Paragraph>
								<Paragraph size="xs" tone="muted">
									Adds 1 check
								</Paragraph>
							</div>
							<Paragraph size="sm" className="text-viridian">
								{draftCost(config)}KB
							</Paragraph>
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={onPipelineRebuild}
					className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-500"
				>
					Rebuild {pipelineRebuildCost}KB
				</button>
			</div>

			{/* Installed */}
			<div className="space-y-3">
				<Paragraph size="xs" tone="muted">
					installed
				</Paragraph>
				<div className="space-y-3">
					{pipelineConfigs.map((config, idx) => (
						<div
							key={config.id}
							className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="text-sm">
											{idx + 1} <span className="text-yellow-400">●</span>
										</span>
										<Paragraph size="sm" className="font-semibold">
											{config.label}
										</Paragraph>
									</div>
									<Paragraph size="xs" tone="muted" className="mt-1">
										1 check
									</Paragraph>
									<Paragraph
										size="xs"
										tone="muted"
										className="mt-0.5 text-zinc-500"
									>
										deinstall {sellRefund(config)}KB
									</Paragraph>
								</div>
								<button
									type="button"
									onClick={() => onPipelineSell(config.id)}
									className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-400"
								>
									deinstall
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>

		{/* Storage Column */}
		<div className="space-y-6">
			<header>
				<Title as="h2">Storage</Title>
				<Subtitle className="text-xs">
					{storageConfigs.filter((c) => c.currentLevel > 0).length} of{" "}
					{storageConfigs.length} · no checks, no risk
				</Subtitle>
			</header>

			{/* Offers */}
			<div className="space-y-3">
				<Paragraph size="xs" tone="muted">
					on offer
				</Paragraph>
				<div className="space-y-2">
					{storageConfigs.map((config) => (
						<button
							key={config.id}
							type="button"
							onClick={() => onStorageUpgrade(config.id)}
							disabled={storage < (config.nextLevelCost ?? 0)}
							className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 transition enabled:hover:border-zinc-500 disabled:opacity-50"
						>
							<div className="flex-1 text-left">
								<Paragraph size="sm" className="font-semibold">
									{config.label}
								</Paragraph>
								<Paragraph size="xs" tone="muted">
									{config.description}
								</Paragraph>
							</div>
							<Paragraph size="sm" className="text-viridian">
								{config.nextLevelCost}KB
							</Paragraph>
						</button>
					))}
				</div>
				<button
					type="button"
					className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-500"
					disabled
				>
					Rebuild {storageRebuildCost}KB
				</button>
			</div>

			{/* Installed */}
			<div className="space-y-3">
				<Paragraph size="xs" tone="muted">
					installed
				</Paragraph>
				<div className="space-y-2">
					{storageConfigs.map((config, idx) => (
						<div key={config.id}>
							{config.currentLevel > 0 ? (
								<div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="text-sm">{idx + 1}</span>
												<Paragraph size="sm" className="font-semibold">
													{config.label}
												</Paragraph>
											</div>
											<Paragraph size="xs" tone="muted" className="mt-1">
												{config.description}
											</Paragraph>
											<Paragraph
												size="xs"
												tone="muted"
												className="mt-0.5 text-zinc-500"
											>
												deinstall{" "}
												{Math.floor((config.nextLevelCost ?? 0) * 0.5)}KB
											</Paragraph>
										</div>
										<button
											type="button"
											onClick={() => onStorageDeinstall(config.id)}
											className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-400"
										>
											deinstall
										</button>
									</div>
								</div>
							) : (
								<div className="rounded-lg border border-zinc-700/30 px-3 py-4 text-center">
									<Paragraph size="xs" tone="muted">
										empty
									</Paragraph>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Summary */}
			<div className="border-t border-zinc-700 pt-3">
				<Paragraph size="xs" tone="muted">
					in effect · cap <span className="text-zinc-100">{storageCap}KB</span>{" "}
					· drafts{" "}
					<span className="text-viridian">
						{draftCostReduction > 0 ? "-" : "+"}
						{Math.round(draftCostReduction * 100)}%
					</span>
				</Paragraph>
			</div>
		</div>
	</div>
);

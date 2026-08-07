import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { Tooltip } from "~/ui/Tooltip.component";

type StorageConfig = {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly currentLevel: number;
	readonly nextLevelCost: number | null;
	readonly maxLevel: boolean;
};

type StorageShopProps = {
	readonly storage: number;
	readonly storageCap: number;
	readonly availableStorageConfigs: readonly StorageConfig[];
	readonly draftCostReduction: number;
	readonly refundBoost: number;
	readonly payoutBoost: number;
	readonly freeRebuild: boolean;
	readonly onUpgradeStorage: (configId: string) => void;
	readonly onDeinstallStorage: (configId: string) => void;
};

const levelIndicators = (current: number, max: number = 5): string => {
	const filled = "●".repeat(current);
	const empty = "○".repeat(Math.max(0, max - current));
	return filled + empty;
};

const refundPrice = (cost: number): number => Math.floor(cost * 0.5);

export const StorageShop = ({
	storage,
	storageCap,
	availableStorageConfigs,
	draftCostReduction,
	refundBoost,
	payoutBoost,
	freeRebuild,
	onUpgradeStorage,
	onDeinstallStorage,
}: StorageShopProps) => (
	<div className="flex flex-col gap-6">
		<header>
			<Title>Your storage</Title>
			<Subtitle>
				{storage}KB of {storageCap}KB · draft cost -
				{(draftCostReduction * 100).toFixed(0)}% · refunds +
				{(refundBoost * 100).toFixed(0)}% · payout +
				{(payoutBoost * 100).toFixed(0)}%{freeRebuild && " · free rebuild"}
			</Subtitle>
		</header>

		<div className="space-y-3">
			{availableStorageConfigs.map((config) => (
				<div
					key={config.id}
					className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3"
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<Paragraph size="sm" className="font-bold">
									{config.label}
								</Paragraph>
								<Paragraph size="xs" tone="muted" className="tracking-wide">
									{levelIndicators(config.currentLevel)}
								</Paragraph>
							</div>
							<Paragraph size="xs" tone="muted" className="mt-1">
								{config.description}
							</Paragraph>
						</div>

						<div className="flex flex-col items-end gap-2">
							{config.currentLevel > 0 && (
								<button
									type="button"
									className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-100"
									onClick={() => onDeinstallStorage(config.id)}
								>
									deinstall{" "}
									<span className="text-viridian">
										+{refundPrice(config.nextLevelCost ?? 0)}KB
									</span>
								</button>
							)}
							{config.nextLevelCost !== null && (
								<Tooltip
									content={`Upgrade to L${config.currentLevel + 1} for ${config.nextLevelCost}KB`}
								>
									<button
										type="button"
										className={`rounded border px-2 py-1 text-xs transition ${
											storage >= config.nextLevelCost
												? "border-viridian bg-viridian/10 text-zinc-100 hover:bg-viridian/20"
												: "border-zinc-700 text-zinc-500 cursor-not-allowed"
										}`}
										onClick={() => onUpgradeStorage(config.id)}
										disabled={storage < config.nextLevelCost}
									>
										L{config.currentLevel + 1}{" "}
										<span className="text-saffron">
											{config.nextLevelCost}KB
										</span>
									</button>
								</Tooltip>
							)}
							{config.maxLevel && (
								<Paragraph size="xs" tone="muted" className="italic">
									maxed
								</Paragraph>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	</div>
);

import { ConfigCard } from "../../configs/components/ConfigCard";
import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { useConfigCardActions } from "../../configs/hooks/useConfigCardActions";
import { calculateRerollCost } from "../services/reroll.service";
import { getStorageInfo } from "../services/configManager.service";
import { formatStorage } from "~/lib/storage";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";
import { SecondaryButton } from "~/ui/SecondaryButton";

type ShopProps = {
	activeRun: Run;
	offeredConfigs: Config[];
	onReroll: () => void;
	lastScoreBreakdown?: PollScoreBreakdown | null;
	categoryCode?: CategoryCode;
	costReduction: number;
};

type ShopConfigCardProps = {
	config: Config;
	activeRun: Run;
};

const ShopConfigCard = ({ config, activeRun }: ShopConfigCardProps) => {
	const actions = useConfigCardActions({
		run: activeRun,
		config,
		mode: "shop",
	});

	return <ConfigCard key={config.id} config={config} {...actions} />;
};

export const Shop = ({
	activeRun,
	offeredConfigs,
	onReroll,
	costReduction,
}: ShopProps) => {
	const { storageAvailable } = getStorageInfo(activeRun);
	const rerollCost = calculateRerollCost(activeRun.rerolls);
	const canReroll = storageAvailable >= rerollCost;

	const displayedConfigs =
		costReduction > 0
			? offeredConfigs.map((config) => ({
					...config,
					originalCost: config.cost,
					cost: Math.floor(config.cost * (1 - costReduction)),
				}))
			: offeredConfigs;
	return (
		<section>
			<div className="space-y-8 flex justify-between items-start mt-12">
				<div>
					<h2 className="text-4xl text-theme mb-2">Shop</h2>
					<p>
						Improve your run by installing new configs to your
						storage deck!
					</p>
				</div>
			</div>

			<div className="mb-4">
				{costReduction > 0 && (
					<p className="text-green-600 font-semibold mt-1">
						{costReduction * 100}% discount active!
					</p>
				)}
			</div>

			<div className="grid grid-cols-3 gap-4 mb-6">
				{displayedConfigs.map((config) => (
					<ShopConfigCard
						key={config.id}
						config={config}
						activeRun={activeRun}
					/>
				))}
			</div>
			<div className="flex justify-end flex-col items-end gap-4">
				<SecondaryButton onClick={onReroll} disabled={!canReroll}>
					Rebuild ({formatStorage(rerollCost)})
				</SecondaryButton>
				<small>
					Not the config you were looking for? Try rebuilding!
				</small>
			</div>
		</section>
	);
};

import { ConfigCard } from "../../configs/components/ConfigCard";
import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { useConfigCardActions } from "../../configs/hooks/useConfigCardActions";
import { calculateRerollCost } from "../services/reroll.service";
import { getStorageInfo } from "../services/configManager.service";
import { formatStorage } from "~/lib/storage";
import { ScoreBreakdownDisplay } from "./ScoreBreakdownDisplay";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";

type ShopProps = {
	activeRun: Run;
	offeredConfigs: Config[];
	onReroll: () => void;
	lastScoreBreakdown?: PollScoreBreakdown | null;
	categoryCode?: CategoryCode;
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
	lastScoreBreakdown,
	categoryCode,
}: ShopProps) => {
	const { storageAvailable } = getStorageInfo(activeRun);
	const rerollCost = calculateRerollCost(activeRun.rerolls);
	const canReroll = storageAvailable >= rerollCost;

	return (
		<div>
			{/* Score Breakdown Display */}
			{lastScoreBreakdown && categoryCode && (
				<ScoreBreakdownDisplay
					breakdown={lastScoreBreakdown}
					activeConfigIds={activeRun.activeConfigIds}
					categoryCode={categoryCode}
				/>
			)}

			<div className="mb-6 flex justify-between items-start">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Config Shop
					</h2>
					<p className="text-gray-600">
						Select up to storage limit configs to add to your
						storage deck
					</p>
				</div>
				<button
					onClick={onReroll}
					disabled={!canReroll}
					className={`px-4 py-2 rounded-md font-medium transition-colors ${
						canReroll
							? "bg-blue-600 text-white hover:bg-blue-700"
							: "bg-gray-300 text-gray-500 cursor-not-allowed"
					}`}
				>
					Reroll ({formatStorage(rerollCost)})
				</button>
			</div>

			<div className="grid grid-cols-3 gap-4 mb-6">
				{/* offeredConfigs should be a filtered list of unique configs */}
				{offeredConfigs.map((config) => (
					<ShopConfigCard
						key={config.id}
						config={config}
						activeRun={activeRun}
					/>
				))}
			</div>
		</div>
	);
};

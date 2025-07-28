import { ConfigCard } from "./ConfigCard";
import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { useConfigCardActions } from "../hooks/useConfigCardActions";

type ShopProps = {
	activeRun: Run;
	offeredConfigs: Config[];
};

export const Shop = ({ activeRun, offeredConfigs }: ShopProps) => (
	<div className="p-6">
		<div className="mb-6">
			<h2 className="text-2xl font-bold text-gray-900 mb-2">
				Config Shop
			</h2>
			<p className="text-gray-600">
				Select up to storage limit configs to add to your storage deck
			</p>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
			{/* offeredConfigs should be a filtered list of unique configs */}
			{offeredConfigs.map((config) => {
				const actions = useConfigCardActions({
					run: activeRun,
					config,
					mode: "shop",
				});

				return (
					<ConfigCard key={config.id} config={config} {...actions} />
				);
			})}
		</div>
	</div>
);

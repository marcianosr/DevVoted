import { useState } from "react";

import { ConfigCard } from "./ConfigCard";
import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { canAddConfigToRun } from "../services/configStorage.service";

type ShopProps = {
	onSubmit: (selectedConfigIds: string[]) => void;
	onCancel?: () => void;
	activeRun: Run;
	availableConfigs: Config[];
};

export const Shop = ({
	onSubmit,
	onCancel,
	activeRun,
	availableConfigs,
}: ShopProps) => {
	const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([]);

	const toggleConfigSelection = (configId: string) => {
		setSelectedConfigIds((prev) => {
			if (prev.includes(configId)) {
				return prev.filter((id) => id !== configId);
			}

			return [...prev, configId];
		});
	};

	const downloadConfig = () => onSubmit(selectedConfigIds);

	return (
		<div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Config Shop
				</h2>
				<p className="text-gray-600">
					Select up to storage limit configs to add to your storage
					deck
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
				{availableConfigs.map((config) => {
					return (
						<ConfigCard
							key={config.id}
							config={config}
							isSelected={selectedConfigIds.includes(config.id)}
							onToggle={() => toggleConfigSelection(config.id)}
							disabled={!canAddConfigToRun(activeRun, config)}
						/>
					);
				})}
			</div>

			<div className="flex justify-end gap-3">
				{onCancel && (
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
					>
						Cancel
					</button>
				)}
				<button
					onClick={downloadConfig}
					disabled={selectedConfigIds.length === 0}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
				>
					Download to storage ({selectedConfigIds.length})
				</button>
			</div>
		</div>
	);
};

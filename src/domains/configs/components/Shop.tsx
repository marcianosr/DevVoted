import { useState } from "react";
import { STORAGE_UNITS } from "~/lib/storage";
import { createConfig } from "../factories/config";
import { ConfigCard } from "./ConfigCard";

type ShopProps = {
	onSubmit: (selectedConfigIds: string[]) => void;
	onCancel?: () => void;
};

export const Shop = ({ onSubmit, onCancel }: ShopProps) => {
	const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([]);

	// Get 6 random configs for the shop
	const shopConfigs = [
		createConfig({
			name: "ESLint",
			id: "eslint",
			cost: STORAGE_UNITS.MB / 128,
		}),
		createConfig({
			name: "Prettier",
			id: "prettier",
			cost: STORAGE_UNITS.MB / 256,
		}),
		createConfig({
			name: "vanilla",
			id: "vanilla",
			cost: STORAGE_UNITS.MB / 256,
		}),
		createConfig(),
	];

	const toggleConfigSelection = (configId: string) => {
		setSelectedConfigIds((prev) => {
			if (prev.includes(configId)) {
				return prev.filter((id) => id !== configId);
			}

			return prev;
		});
	};

	const handleSubmit = () => {
		onSubmit(selectedConfigIds);
	};

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
				{shopConfigs.map((config) => (
					<ConfigCard
						key={config.id}
						config={config}
						isSelected={selectedConfigIds.includes(config.id)}
						onToggle={() => toggleConfigSelection(config.id)}
						disabled={!selectedConfigIds.includes(config.id)}
					/>
				))}
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
					onClick={handleSubmit}
					disabled={selectedConfigIds.length === 0}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
				>
					Add to Storage ({selectedConfigIds.length})
				</button>
			</div>
		</div>
	);
};

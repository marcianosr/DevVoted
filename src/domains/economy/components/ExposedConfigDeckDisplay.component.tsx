import { clsx } from "clsx";

import { configs } from "~/domains/economy/data/configs";
import type { ExposedConfigDeck } from "~/domains/runs/api/run.queries";

import { RARITY_COLORS } from "./Cards/ConfigCard.component";

type ExposedConfigDeckDisplayProps = {
	deck: ExposedConfigDeck;
};

const getColorFromString = (str: string): string => {
	const KANTO_COLORS = [
		"bg-pallet",
		"bg-viridian",
		"bg-pewter",
		"bg-cerulean",
		"bg-vermillion",
		"bg-lavender",
		"bg-celadon",
		"bg-fuchsia",
		"bg-saffron",
		"bg-cinnabar",
		"bg-indigo",
		"bg-seafoam",
	];

	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % KANTO_COLORS.length;
	return KANTO_COLORS[index];
};

const ExposedConfigDeckDisplay = ({ deck }: ExposedConfigDeckDisplayProps) => {
	const resolvedConfigs = deck.configIds
		.map((id) => configs.find((c) => c.id === id))
		.filter((c) => c !== undefined);

	const initial = (deck.displayName || deck.userId).charAt(0).toUpperCase();
	const colorClass = getColorFromString(deck.userId);

	return (
		<div className="mt-8 p-4 bg-gray-800/40 border border-gray-700">
			<h4 className="text-xl mb-4">🔍 Exposed Config Deck</h4>
			<div className="flex items-center gap-3 mb-4">
				{deck.photoUrl ? (
					<img
						src={deck.photoUrl}
						alt={deck.displayName || "Player avatar"}
						className="w-10 h-10 rounded-full"
					/>
				) : (
					<span
						className={clsx(
							"w-10 h-10 rounded-full inline-flex items-center justify-center text-white",
							colorClass
						)}
					>
						{initial}
					</span>
				)}
				<span className="text-lg">{deck.displayName}</span>
			</div>

			{resolvedConfigs.length === 0 ? (
				<p className="text-gray-400">No configs installed</p>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{resolvedConfigs.map((config) => {
						const rarityColor = RARITY_COLORS[config.rarity];

						return (
							<div
								key={config.id}
								className={clsx(
									"p-2 border",
									rarityColor.border,
									rarityColor.bg
								)}
								title={config.description}
							>
								<span className={clsx("text-xs", rarityColor.text)}>
									({config.rarity})
								</span>
								<p className={clsx("text-sm font-medium", rarityColor.text)}>
									{config.name}
								</p>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ExposedConfigDeckDisplay;

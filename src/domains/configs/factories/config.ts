import { Config } from "~/domains/configs/models/config";
import { STORAGE_UNITS } from "~/lib/storage";

export const createConfig = (overrides: Partial<Config> = {}): Config => ({
	id: "test-config",
	name: "Test Config",
	description: "A test configuration",
	cost: STORAGE_UNITS.KB * 100, // 100KB
	cooldown: 0,
	rarity: "common",
	effect: () => {},
	...overrides,
});

export const createConfigs = (count: number = 3): Config[] => {
	const rarities: Config["rarity"][] = [
		"common",
		"uncommon",
		"rare",
		"legendary",
	];

	return Array.from({ length: count }, (_, index) =>
		createConfig({
			id: `test-config-${index + 1}`,
			name: `Test Config ${index + 1}`,
			description: `Test config number ${index + 1}`,
			cost: STORAGE_UNITS.KB * (100 + index * 50), // 100KB, 150KB, 200KB, etc.
			cooldown: index,
			rarity: rarities[index % 4],
		})
	);
};

export const createConfigWithRarity = (rarity: Config["rarity"]): Config =>
	createConfig({
		id: `${rarity}-config`,
		name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Config`,
		rarity,
		cost:
			rarity === "common"
				? STORAGE_UNITS.KB * 50
				: rarity === "uncommon"
					? STORAGE_UNITS.KB * 100
					: rarity === "rare"
						? STORAGE_UNITS.KB * 200
						: STORAGE_UNITS.KB * 500, // legendary
	});

export const createConfigWithCooldown = (cooldown: number): Config =>
	createConfig({
		id: `cooldown-${cooldown}-config`,
		name: `Cooldown ${cooldown} Config`,
		cooldown,
	});

export const createConfigWithImage = (imagePath: string): Config =>
	createConfig({
		id: "image-config",
		name: "Config with Image",
		image: imagePath,
	});

export const configFactory = {
	create: createConfig,
	createMany: createConfigs,
	withRarity: createConfigWithRarity,
	withCooldown: createConfigWithCooldown,
	withImage: createConfigWithImage,
};

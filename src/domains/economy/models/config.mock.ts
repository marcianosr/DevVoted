import type { Config } from "./config.model";

export const createMockConfig = (overrides: Partial<Config> = {}): Config => ({
	id: "test-config",
	name: "Test Config",
	description: "A test configuration",
	cost: 100 * 1024,
	rarity: "common",
	effect: ["testEffect"],
	priority: 1,
	image: "/images/configs/default-config.png",
	...overrides,
});

export const createMockConfigs = (count: number = 3): Config[] => {
	const rarities: Config["rarity"][] = [
		"common",
		"uncommon",
		"rare",
		"legendary",
	];
	return Array.from({ length: count }, (_, i) =>
		createMockConfig({
			id: `test-config-${i + 1}`,
			name: `Test Config ${i + 1}`,
			description: `Test config number ${i + 1}`,
			cost: (100 + i * 50) * 1024,
			rarity: rarities[i % 4],
		})
	);
};

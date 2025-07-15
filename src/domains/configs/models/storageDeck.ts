import { Config, ConfigInstance } from "./config";

export type StorageDeck = {
	configs: ConfigInstance[];
	storageUsed: number;
	storageLimit: number;
	storageAvailable: number;
};

export type StorageDeckAction = 
	| { type: "ADD_CONFIG"; config: Config }
	| { type: "REMOVE_CONFIG"; configId: string }
	| { type: "UPDATE_COOLDOWN"; configId: string; pollNumber: number }
	| { type: "SET_STORAGE_LIMIT"; limit: number };

export const createStorageDeck = (storageLimit: number): StorageDeck => ({
	configs: [],
	storageUsed: 0,
	storageLimit,
	storageAvailable: storageLimit,
});

export const canAddConfig = (deck: StorageDeck, config: Config): boolean => {
	return deck.storageAvailable >= config.cost;
};

export const getConfigById = (deck: StorageDeck, configId: string): ConfigInstance | undefined => {
	return deck.configs.find(instance => instance.config.id === configId);
};

export const isConfigOnCooldown = (configInstance: ConfigInstance, currentPollNumber: number): boolean => {
	const pollsSinceLastUse = currentPollNumber - configInstance.lastUsed;
	return pollsSinceLastUse < configInstance.config.cooldown;
};
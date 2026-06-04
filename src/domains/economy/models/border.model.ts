export type BorderRarity = "common" | "rare" | "epic" | "legendary";

export type Border = {
	id: string;
	name: string;
	description: string;
	image: string; // root-relative path under /public, e.g. "/borders/<id>.png"
	cost: number; // archive bytes
	rarity: BorderRarity;
};

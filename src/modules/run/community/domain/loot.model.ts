export type LootRefusal =
	"already-looted" | "own-run" | "nothing-left" | "no-run";

export type LootTarget = {
	readonly ownerId: string;
	readonly lootedById: string | null;
	readonly lootKb: number;
};

export type LootViewer = {
	readonly id: string;
	readonly hasLiveRun: boolean;
};

export const lootRefusalOf = (
	target: LootTarget,
	viewer: LootViewer
): LootRefusal | null => {
	if (target.lootedById !== null) return "already-looted";
	if (target.ownerId === viewer.id) return "own-run";
	if (target.lootKb <= 0) return "nothing-left";
	if (!viewer.hasLiveRun) return "no-run";
	return null;
};

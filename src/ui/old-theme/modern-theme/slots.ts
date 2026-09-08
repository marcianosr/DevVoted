export type SlotClaim = { readonly slots: number };

export type Occupancy = {
	readonly used: number;
	readonly free: number;
	readonly overflow: number;
	readonly unbought: number;
};

export const occupancyOf = (
	claims: readonly SlotClaim[],
	slots: number,
	maxSlots: number
): Occupancy => {
	const used = claims.reduce((total, claim) => total + claim.slots, 0);
	return {
		used,
		free: Math.max(0, slots - used),
		overflow: Math.max(0, used - slots),
		unbought: Math.max(0, maxSlots - Math.max(slots, used)),
	};
};

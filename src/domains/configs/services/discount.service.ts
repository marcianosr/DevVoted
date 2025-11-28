export const withDiscount = <T extends { cost: number }>(
	item: T,
	reduction: number
): T & { originalCost?: number } => {
	if (reduction <= 0) return item;
	return {
		...item,
		originalCost: item.cost,
		cost: Math.floor(item.cost * (1 - reduction)),
	};
};

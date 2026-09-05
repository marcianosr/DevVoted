export const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

export const countRange = (fewest: number, most: number, noun: string) =>
	fewest === most ? plural(fewest, noun) : `${fewest}–${most} ${noun}s`;

export const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

export const countRange = (fewest: number, most: number, noun: string) =>
	fewest === most ? plural(fewest, noun) : `${fewest}–${most} ${noun}s`;

export const capLabel = (kb: number) =>
	kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;

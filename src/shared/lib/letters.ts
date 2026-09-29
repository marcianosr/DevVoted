const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BEYOND = "?";

export const letterAt = (index: number): string =>
	LETTERS.charAt(index) || BEYOND;

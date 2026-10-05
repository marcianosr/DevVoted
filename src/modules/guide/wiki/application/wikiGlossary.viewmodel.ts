export type WikiTerm = { readonly term: string; readonly meaning: string };

export const GLOSSARY_TERMS: readonly WikiTerm[] = [
	{
		term: "Run",
		meaning: "One climb through the gates, spread over many days.",
	},
	{
		term: "Gate",
		meaning: "One day's polls, and the coverage they must reach.",
	},
	{
		term: "Coverage",
		meaning: "The score: how much of a gate your answers covered.",
	},
];

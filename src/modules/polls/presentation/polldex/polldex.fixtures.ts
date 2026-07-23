import type { PolldexEntry } from "../../polldex/polldex.model";

/** Sample rows for Stories — a mix of seen (varied accuracy) and unseen polls. */
export const SAMPLE_POLLDEX_ENTRIES: PolldexEntry[] = [
	{
		id: 1,
		pollNumber: 1,
		categoryCode: "general-frontend",
		seen: true,
		question:
			"Which technology keeps a connection open for realtime, bidirectional data?",
		timesSeen: 7,
		answeredCount: 7,
		accuracy: 86,
	},
	{
		id: 2,
		pollNumber: 2,
		categoryCode: "css",
		seen: true,
		question:
			"When specificities of declarations are equal in the same origin type, which one takes precedence?",
		timesSeen: 2,
		answeredCount: 2,
		accuracy: 50,
	},
	{
		id: 3,
		pollNumber: 3,
		categoryCode: "js",
		seen: true,
		question:
			"Which of these are valid ways to make a fetch request cancellable?",
		timesSeen: 1,
		answeredCount: 1,
		accuracy: 20,
	},
	{
		id: 4,
		pollNumber: 4,
		categoryCode: "css",
		seen: false,
		question: null,
		timesSeen: 0,
		answeredCount: 0,
		accuracy: null,
	},
	{
		id: 5,
		pollNumber: 5,
		categoryCode: "ts",
		seen: false,
		question: null,
		timesSeen: 0,
		answeredCount: 0,
		accuracy: null,
	},
];

export const BUILD = "Build";
export const REGISTRY = "Registry";
export const AUDITS = "Audits";
export const WEIGHT = "weight";
export const OF = "of";
export const NEEDED = "needed";
export const LOCKED_CONFIG = "Locked config";
export const WHAT_EACH_POLL_PAID = "Score";
export const STORAGE_BALANCE = "Storage balance";
export const COMMUNITY = "Community";

export const IN_A_ROW = (streak: number) => `${streak} in a row`;

export const MOST_CORRECT = (correct: number) => `${correct} correct`;

export const NO_TITLE_YET = "no title yet";

export const NEW_POLLS_IN = (remaining: string) => `New polls in ${remaining}`;

export const NOTHING_TO_COMPARE_YET =
	"Nothing to see yet — answer some of today’s polls first.";

export const SUGGEST_A_POLL = "Suggest a poll";
export const YOUR_SUGGESTED_POLLS = "Your suggested polls";

export const ANSWER_TYPE_LABEL = {
	single: "single answer",
	multiple: "multiple answers",
} as const;

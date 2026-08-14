/**
 * Centralized query key factory for consistent cache management
 * across the application
 */

export const runQueryKeys = {
	all: ["runs"] as const,
	active: (userId: string | undefined) =>
		[...runQueryKeys.all, "active", userId] as const,
	withCategoryXp: (runId: number) =>
		[...runQueryKeys.all, runId, "categoryCoverage"] as const,
	lastRun: (userId: string | undefined) =>
		[...runQueryKeys.all, "last", userId] as const,
};

export const sessionRunQueryKeys = {
	all: [...runQueryKeys.all, "session"] as const,
	today: (date: string) => [...sessionRunQueryKeys.all, date] as const,
	community: (date: string) =>
		[...sessionRunQueryKeys.all, "community", date] as const,
	/** Keyed by poll rather than by date: a peek is bought once and stays bought
	 * for as long as that poll is on screen. */
	pollSplit: (pollId: number) =>
		[...sessionRunQueryKeys.all, "split", pollId] as const,
};

export const pollQueryKeys = {
	all: ["polls"] as const,
	detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
	withOptions: (pollId: number, userId: string | undefined) =>
		[...pollQueryKeys.all, pollId, "options", userId] as const,
	daily: (userId: string | undefined) =>
		[...pollQueryKeys.all, "daily", userId] as const,
	seenInRun: (runId: number | undefined) =>
		[...pollQueryKeys.all, "seenInRun", runId] as const,
	polldex: (userId: string | undefined) =>
		[...pollQueryKeys.all, "polldex", userId] as const,
};

const USERS = ["users"] as const;

export const userQueryKeys = {
	all: USERS,
	profile: (userId: string) => [...USERS, userId, "profile"] as const,
	/**
	 * Grouped by concern *before* the user, unlike `profile`: a gate clear awards
	 * a swatch and has to invalidate this, but the run flow never holds a userId
	 * (the server derives it from the session), so it needs a prefix it can name.
	 */
	swatchesAll: [...USERS, "swatches"] as const,
	swatches: (userId: string) => [...userQueryKeys.swatchesAll, userId] as const,
};

export const archiveQueryKeys = {
	all: ["archive"] as const,
	state: (userId: string | undefined) =>
		[...archiveQueryKeys.all, userId] as const,
};

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

export const pollQueryKeys = {
	all: ["polls"] as const,
	detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
	withOptions: (pollId: number, userId: string | undefined) =>
		[...pollQueryKeys.all, pollId, "options", userId] as const,
	daily: (userId: string | undefined) =>
		[...pollQueryKeys.all, "daily", userId] as const,
	totalSeen: (userId: string | undefined) =>
		[...pollQueryKeys.all, "totalSeen", userId] as const,
};

export const userQueryKeys = {
	all: ["users"] as const,
	profile: (userId: string) =>
		[...userQueryKeys.all, userId, "profile"] as const,
};

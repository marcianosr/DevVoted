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
	attackTargets: (date: string) =>
		[...sessionRunQueryKeys.all, "attack-targets", date] as const,
	incidents: (date: string) =>
		[...sessionRunQueryKeys.all, "incidents", date] as const,
	pollSplit: (pollId: number) =>
		[...sessionRunQueryKeys.all, "split", pollId] as const,
	recap: (runId: number) =>
		[...sessionRunQueryKeys.all, "recap", runId] as const,
	upcomingCategories: (date: string) =>
		[...sessionRunQueryKeys.all, "upcoming", date] as const,
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
	list: () => [...pollQueryKeys.all, "list"] as const,
	authored: () => [...pollQueryKeys.all, "authored"] as const,
	creators: () => [...pollQueryKeys.all, "creators"] as const,
	adminAccess: () => [...pollQueryKeys.all, "adminAccess"] as const,
};

const USERS = ["users"] as const;

export const userQueryKeys = {
	all: USERS,
	profile: (userId: string) => [...USERS, userId, "profile"] as const,
	swatchesAll: [...USERS, "swatches"] as const,
	swatches: (userId: string) => [...userQueryKeys.swatchesAll, userId] as const,
	unlocksAll: [...USERS, "unlocks"] as const,
	unlocks: (userId: string) => [...userQueryKeys.unlocksAll, userId] as const,
	serviceUnlocksAll: [...USERS, "service-unlocks"] as const,
	serviceUnlocks: (userId: string) =>
		[...userQueryKeys.serviceUnlocksAll, userId] as const,
	gateRuns: (userId: string) => [...USERS, userId, "gate-runs"] as const,
};

export const archiveQueryKeys = {
	all: ["archive"] as const,
	state: (userId: string | undefined) =>
		[...archiveQueryKeys.all, userId] as const,
};

export const titleQueryKeys = {
	all: ["titles"] as const,
	state: (userId: string | undefined) =>
		[...titleQueryKeys.all, userId] as const,
	announcement: (userId: string | undefined) =>
		[...titleQueryKeys.all, "announcement", userId] as const,
};

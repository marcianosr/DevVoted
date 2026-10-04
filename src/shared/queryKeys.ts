import { getTodayDateString } from "~/shared/lib/dateUtils";

export const runQueryKeys = {
	all: ["runs"] as const,
};

export const sessionRunQueryKeys = {
	all: [...runQueryKeys.all, "session"] as const,
	today: (date: string) => [...sessionRunQueryKeys.all, date] as const,
	todaysRun: () => sessionRunQueryKeys.today(getTodayDateString()),
	pollsLeft: (date: string) =>
		[...sessionRunQueryKeys.all, "polls-left", date] as const,
	todaysPollsLeft: () => sessionRunQueryKeys.pollsLeft(getTodayDateString()),
	community: (date: string) =>
		[...sessionRunQueryKeys.all, "community", date] as const,
	todaysCommunity: () => sessionRunQueryKeys.community(getTodayDateString()),
	attackTargets: (date: string) =>
		[...sessionRunQueryKeys.all, "attack-targets", date] as const,
	todaysAttackTargets: () =>
		sessionRunQueryKeys.attackTargets(getTodayDateString()),
	incidents: (date: string) =>
		[...sessionRunQueryKeys.all, "incidents", date] as const,
	todaysIncidents: () => sessionRunQueryKeys.incidents(getTodayDateString()),
	approvalSlots: (date: string) =>
		[...sessionRunQueryKeys.all, "approval-slots", date] as const,
	todaysApprovalSlots: () =>
		sessionRunQueryKeys.approvalSlots(getTodayDateString()),
	recap: (runId: number) =>
		[...sessionRunQueryKeys.all, "recap", runId] as const,
	upcomingCategories: (date: string) =>
		[...sessionRunQueryKeys.all, "upcoming", date] as const,
	runNumber: () => [...sessionRunQueryKeys.all, "run-number"] as const,
};

export const pollQueryKeys = {
	all: ["polls"] as const,
	detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
	polldexAll: () => [...pollQueryKeys.all, "polldex"] as const,
	polldex: (userId: string | undefined) =>
		[...pollQueryKeys.polldexAll(), userId] as const,
	publishedCount: () => [...pollQueryKeys.all, "publishedCount"] as const,
	authored: () => [...pollQueryKeys.all, "authored"] as const,
	creators: () => [...pollQueryKeys.all, "creators"] as const,
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
	card: (userId: string) => [...USERS, userId, "card"] as const,
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

export const adminQueryKeys = {
	all: ["admin"] as const,
	dashboard: () => [...adminQueryKeys.all, "dashboard"] as const,
};

import type { CategoryCode } from "~/domains/shared/categories";

export type AwardType = "mastery" | "participation" | "coverage";

export type AwardContext = "all-time" | "current-runs";

export type AwardEarner = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	score: number;
};

export type AwardDefinition = {
	id: string;
	name: string;
	description: string;
	type: AwardType;
	categoryCode: CategoryCode;
};

export type Award = AwardDefinition & {
	earners: AwardEarner[];
};

export type CategoryWinner = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	categoryCode: string;
	score: number;
};

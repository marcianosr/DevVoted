import type { CategoryCode } from "~/shared/lib/categories";

export const POLL_STATUSES = ["draft", "published", "archived"] as const;
export type PollStatus = (typeof POLL_STATUSES)[number];

export type AnswerType = "single" | "multiple";

export type Poll = {
	id: number;
	question: string;
	status: PollStatus;
	answerType: AnswerType;
	openingTime: Date;
	closingTime: Date;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date | null;
	categoryCode: CategoryCode;
	codeSandboxExample: string | null;
	codeBlock: string | null;
	explanation: string | null;
	pollNumber: number | null;
	reviewedAt: Date | null;
};

export type PollCreator = {
	id: string;
	displayName: string;
	amountOfPolls: number;
	photoUrl: string | null;
	githubUsername: string | null;
};

export const POLL_LIMITS = {
	question: { min: 10, max: 2000 },
	explanation: { max: 2000 },
	answers: { min: 3, max: 20 },
	answer: { max: 500 },
} as const;

export const APPROVED_POLL_ARCHIVE_KB = 16;

export const isPollStatus = (value: string): value is PollStatus =>
	(POLL_STATUSES as readonly string[]).includes(value);

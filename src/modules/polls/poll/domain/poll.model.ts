import type { CategoryCode } from "~/shared/lib/categories";

/** Poll status values — mirrors the database schema enum. */
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
};

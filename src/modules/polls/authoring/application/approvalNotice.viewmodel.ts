import type { AnnouncedPoll } from "~/modules/polls/authoring/infrastructure/authoring.repository";
import {
	questionSegmentsOf,
	type QuestionSegment,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import { signedKbLabel, STORAGE_UNITS } from "~/shared/lib/storage";

const COPY = {
	one: "Your poll is live",
	many: (count: number) => `${count} of your polls are live`,
} as const;

export type ApprovedQuestion = {
	readonly id: number;
	readonly segments: readonly QuestionSegment[];
};

export type ApprovalNoticeView = {
	readonly heading: string;
	readonly reward: string;
	readonly fromKb: number;
	readonly toKb: number;
	readonly questions: readonly ApprovedQuestion[];
};

export const approvalNoticeViewFor = (
	polls: readonly AnnouncedPoll[],
	archivedBytes: number
): ApprovalNoticeView | null => {
	if (polls.length === 0) return null;

	const rewardKb = APPROVED_POLL_ARCHIVE_KB * polls.length;
	const toKb = archivedBytes / STORAGE_UNITS.KB;

	return {
		heading: polls.length === 1 ? COPY.one : COPY.many(polls.length),
		reward: signedKbLabel(rewardKb),
		fromKb: Math.max(0, toKb - rewardKb),
		toKb,
		questions: polls.map(({ id, question }) => ({
			id,
			segments: questionSegmentsOf(question),
		})),
	};
};

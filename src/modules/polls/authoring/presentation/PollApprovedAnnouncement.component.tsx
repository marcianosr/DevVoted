import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useTitleAnnouncement } from "~/modules/account/profile/application/useTitleAnnouncement.hook";
import { approvalNoticeViewFor } from "~/modules/polls/authoring/application/approvalNotice.viewmodel";
import {
	useAcknowledgePollApprovals,
	usePollApprovalNotice,
} from "~/modules/polls/authoring/application/usePollApproval.hook";
import { PollApprovedModal } from "~/modules/polls/authoring/presentation/PollApprovedModal.ui";

export const PollApprovedAnnouncement = ({ userId }: { userId: string }) => {
	const { view: notice } = usePollApprovalNotice(userId);
	const { view: titles } = useTitleAnnouncement(userId);
	const acknowledge = useAcknowledgePollApprovals(userId);

	const polls = notice?.polls ?? [];
	const owner = polls.length > 0 ? userId : undefined;
	const { view: archive } = useArchiveState(owner);

	const titlesPending = titles === null || titles.titleIds.length > 0;
	if (titlesPending || archive === null) return null;

	const view = approvalNoticeViewFor(polls, archive.archivedStorage);
	if (view === null) return null;

	return (
		<PollApprovedModal
			{...view}
			isMutating={acknowledge.isPending}
			onDismiss={() => acknowledge.mutate(polls.map((poll) => poll.id))}
		/>
	);
};

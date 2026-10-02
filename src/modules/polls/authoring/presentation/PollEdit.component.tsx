import {
	STATUS_CHOICES,
	pollFormStateOf,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { usePollAuthoring } from "~/modules/polls/authoring/application/usePollAuthoring.hook";
import { PollForm } from "~/modules/polls/authoring/presentation/PollForm.component";
import {
	PollEditDenied,
	PollEditError,
	PollEditLoading,
} from "~/modules/polls/authoring/presentation/PollEdit.ui";
import { usePollDetail } from "~/modules/polls/poll/application/usePollDetail.hook";
import { ACCESS_DENIED } from "~/modules/polls/poll/domain/pollAccess.model";

type PollEditProps = {
	pollId: number;
};

const isRefused = (errorMessage: string | null) =>
	errorMessage === ACCESS_DENIED;

export const PollEdit = ({ pollId }: PollEditProps) => {
	const detail = usePollDetail(pollId);
	const authoring = usePollAuthoring(pollId);

	if (detail.isPending) return <PollEditLoading />;
	if (isRefused(detail.errorMessage)) return <PollEditDenied />;
	if (!detail.view) {
		return <PollEditError message={detail.errorMessage ?? "Poll not found"} />;
	}
	if (!detail.view.canAdminister) return <PollEditDenied />;

	return (
		<PollForm
			mode="edit"
			pollNumber={detail.view.poll.pollNumber ?? undefined}
			initial={pollFormStateOf(detail.view.poll, detail.view.options)}
			statuses={STATUS_CHOICES}
			error={authoring.error}
			submitting={authoring.submitting}
			onSubmit={authoring.submit}
		/>
	);
};

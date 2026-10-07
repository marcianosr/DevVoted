import { suggestFormFor } from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { usePollAuthoring } from "~/modules/polls/authoring/application/usePollAuthoring.hook";
import { usePollBounties } from "~/modules/polls/authoring/application/usePollBounties.hook";
import { PollForm } from "~/modules/polls/authoring/presentation/PollForm.component";
import type { CategoryCode } from "~/shared/lib/categories";

export type PollCreateProps = { category?: CategoryCode };

export const PollCreate = ({ category }: PollCreateProps) => {
	const authoring = usePollAuthoring();
	const { view: bounties } = usePollBounties();

	return (
		<PollForm
			mode="suggest"
			initial={suggestFormFor(category)}
			bounties={bounties ?? undefined}
			error={authoring.error}
			submitting={authoring.submitting}
			onSubmit={authoring.submit}
		/>
	);
};

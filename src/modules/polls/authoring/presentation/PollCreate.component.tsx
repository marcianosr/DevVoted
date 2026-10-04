import { usePollAuthoring } from "~/modules/polls/authoring/application/usePollAuthoring.hook";
import { PollForm } from "~/modules/polls/authoring/presentation/PollForm.component";

export const PollCreate = () => {
	const authoring = usePollAuthoring();

	return (
		<PollForm
			mode="suggest"
			error={authoring.error}
			submitting={authoring.submitting}
			onSubmit={authoring.submit}
		/>
	);
};

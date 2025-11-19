import { applyEffects } from "~/domains/configs/data/configs";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { useState } from "react";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import PollContent from "./PollContent";
import { User } from "~/domains/users/services/userSync.service";
import { Run } from "~/domains/runs/models/run";

type PollPageContainerProps = {
	user: User;
	poll: PollWithOptionsResponse;
	activeRun: Run;
};

/**
 * Container component for poll pages
 * Applies config effects to poll data and renders PollContent
 * Note: Active run requirement is enforced at route level via beforeLoad guard
 */
export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	poll,
	activeRun,
}) => {
	const [lastScoreBreakdown, setLastScoreBreakdown] =
		useState<PollScoreBreakdown | null>(null);

	// Apply config effects to poll data
	// activeRun is guaranteed to exist (enforced by route guard)
	const dataWithEffects = applyEffects(
		{ ...poll, run: activeRun },
		activeRun.activeConfigIds
	);

	return (
		<PollContent
			pollData={dataWithEffects.view}
			effectProps={dataWithEffects.renderProps}
			user={user}
			activeRun={activeRun}
			lastScoreBreakdown={lastScoreBreakdown}
			setLastScoreBreakdown={setLastScoreBreakdown}
		/>
	);
};

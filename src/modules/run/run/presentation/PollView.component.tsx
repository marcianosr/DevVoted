import { useState } from "react";

import { useDisclosure } from "~/shared/hooks/useDisclosure.hook";
import { useIsSmallScreen } from "~/shared/hooks/useIsSmallScreen.hook";
import { useScrollToTopOnSmallScreen } from "~/shared/hooks/useScrollToTopOnSmallScreen.hook";
import { INSTALLED_CARDS_OPEN } from "~/shared/lib/disclosure";

import {
	enterActionFor,
	type PollScreenHandlers,
	pollFlightFor,
	pollKeysFor,
	pollScreenPropsFor,
} from "~/modules/run/run/application/pollScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { usePollKeyboard } from "~/modules/run/run/application/usePollKeyboard.hook";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { useAnswerFeedback } from "~/modules/run/run/presentation/useAnswerFeedback.hook";
import { PollScreen } from "~/ui/kanto-theme/PollScreen.ui";

export type PollViewProps = Omit<PollScreenHandlers, "onSubmit"> & {
	onAnswer: (optionIds: readonly string[]) => void;
	view: RunView;
	answered?: AnsweredPoll;
	selectedOptionIds: readonly string[];
	clockMs?: number;
};

export const PollView = ({
	view,
	answered,
	selectedOptionIds,
	clockMs = 0,
	onAnswer,
	...handlers
}: PollViewProps) => {
	const build = useDisclosure(
		view.configs.map((config) => config.label),
		INSTALLED_CARDS_OPEN
	);
	const revealing = answered !== undefined;
	const [before, setBefore] = useState(view);
	if (!revealing && before !== view) setBefore(view);
	const feedback = useAnswerFeedback(
		answered,
		handlers.onNext,
		pollFlightFor(before, view, answered) !== undefined
	);
	useScrollToTopOnSmallScreen(view.poll?.id);
	const small = useIsSmallScreen();
	const on = {
		...handlers,
		onSelect:
			view.poll?.answerType === "multiple"
				? handlers.onSelect
				: (optionId: string) => onAnswer([optionId]),
		onSubmit: () => onAnswer(selectedOptionIds),
	};

	usePollKeyboard({
		keys: revealing ? [] : pollKeysFor(view),
		onPick: revealing ? undefined : on.onSelect,
		onEnter: enterActionFor(
			revealing,
			selectedOptionIds.length > 0,
			on.onSubmit
		),
	});

	const props = pollScreenPropsFor({
		view,
		answered,
		before,
		landed: feedback.landed,
		leaving: feedback.leaving,
		selectedOptionIds,
		on: { ...on, onLanded: feedback.land, onSettled: feedback.settle },
		ui: { build, clockMs, buildOpen: !small },
	});

	return props === null ? null : <PollScreen {...props} />;
};

import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";

import { applyEffects } from "~/domains/configs/data/configs";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed";
import PollOptionsForm from "~/domains/polls/components/PollOptionsForm";
import SelectedOptionsSummary from "~/domains/polls/components/SelectedOptionsSummary";
import { Poll } from "~/domains/polls/models/poll";
import { PollOption } from "~/domains/polls/models/pollOption";
import type { Run } from "~/domains/runs/models/run";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { PrimaryButton } from "~/ui/PrimaryButton";

import { submitPollOptions } from "./PollContent";
import { PollQuestionDisplay } from "./PollQuestionDisplay";

type DailyPollContainerProps = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
	activeRun: Run;
	selectedOptions: string[];
};

const DailyPollContainer = ({
	poll,
	options,
	hasAnswered,
	activeRun,
	selectedOptions,
}: DailyPollContainerProps) => {
	const router = useRouter();
	const category = getCategoryMetadata(poll.categoryCode);

	const mutation = useMutation({
		mutationFn: submitPollOptions,
		onSuccess: () => router.invalidate(),
		onError: (error) => {
			console.error("Error submitting poll options", error);
		},
	});

	const effectsResult = applyEffects(
		{ poll, options, hasAnswered, run: activeRun },
		activeRun.activeConfigIds
	);

	return (
		<section className="max-w-5xl mx-auto p-4">
			<header className="border-b-1 border-theme py-4 mb-8">
				<p className="text-4xl text-theme">{category.name}</p>
				<p>
					#{poll.pollNumber} · Opened at{" "}
					<time dateTime={poll.updatedAt?.toISOString()}>
						{poll.updatedAt?.toDateString()}
					</time>
				</p>
				<p>Created by: {poll.createdBy}</p>
			</header>
			<PollQuestionDisplay poll={poll} />
			{poll.codeSandboxExample && (
				<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
			)}
			{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
			<div className="mt-6">
				{hasAnswered ? (
					<>
						<SelectedOptionsSummary
							options={options}
							selectedOptions={selectedOptions}
						/>
						<PrimaryButton>
							<Link to={`/daily-poll`}>See your progress!</Link>
						</PrimaryButton>
					</>
				) : (
					<PollOptionsForm
						poll={poll}
						options={options}
						hasAnswered={hasAnswered}
						effect={effectsResult}
						selectedOptions={selectedOptions}
						mutation={mutation}
					/>
				)}
			</div>
		</section>
	);
};

export default DailyPollContainer;

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { applyEffects } from "~/domains/configs/data/configs";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed";
import PollOptionsForm from "~/domains/polls/components/PollOptionsForm";
import SelectedOptionsSummary from "~/domains/polls/components/SelectedOptionsSummary";
import { Poll } from "~/domains/polls/models/poll";
import { PollOption } from "~/domains/polls/models/pollOption";
import type { Run } from "~/domains/runs/models/run";
import { ScoreCalculation } from "~/domains/score/services/score.service";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { PrimaryButton } from "~/ui/PrimaryButton";
import { getAuthenticatedUserId } from "~/utils/authorization";

import { PollQuestionDisplay } from "./PollQuestionDisplay";
import {
	getCommunityStatsHandler,
	getScoreBreakdownHandler,
	postPollOptionsHandler,
} from "../api/handlers";

// TODO: submitPollOptions to its own file

export const submitPollOptions = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();

		// TODO: remove score calc here (only post) get score breakdown here instead of getting it from the POST IF needed?
		return postPollOptionsHandler({ data: { ...data, userId } });
	});

export const getScoreBreakdown = createServerFn({ method: "GET" })
	.inputValidator(
		z.custom<{
			poll: Poll;
			options: PollOption[];
			hasAnswered: boolean;
			run: Run;
			selectedOptions: string[];
		}>()
	)
	.handler(async ({ data }) => {
		const result = await getScoreBreakdownHandler({
			data: {
				hasAnswered: data.hasAnswered,
				options: data.options,
				poll: data.poll,
				run: data.run,
				selectedOptions: data.selectedOptions,
			},
		});

		if (!result || !result.success) {
			throw new Error("Failed to get score breakdown");
		}

		return result.data;
	});

const getCommunityStats = createServerFn({ method: "GET" })
	.inputValidator(z.object({ pollId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const result = await getCommunityStatsHandler({ data });

		if (!result || !result.success) {
			throw new Error("Failed to get community stats");
		}

		return result.data;
	});

type DailyPollContainerProps = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
	activeRun: Run;
	selectedOptions: string[];
	score: ScoreCalculation;
};

const DailyPollContainer = ({
	poll,
	options,
	hasAnswered,
	activeRun,
	selectedOptions,
	score,
}: DailyPollContainerProps) => {
	const router = useRouter();
	const category = getCategoryMetadata(poll.categoryCode);

	// Stays as query: would be nice to have real-time community stats after answering, see it update over time
	const { data: communityStats } = useQuery({
		queryKey: ["communityStats", poll.id],
		queryFn: () =>
			getCommunityStats({
				data: {
					pollId: poll.id,
				},
			}),
		retry: false,
		enabled: hasAnswered,
	});

	const mutation = useMutation({
		mutationFn: submitPollOptions,

		onSuccess: (data) => {
			router.invalidate();

			console.info("Successfully submitted poll options", data);
		},
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
			<header className="border-b border-theme py-4 mb-8">
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
							score={score}
							communityStats={communityStats}
						/>
						<PrimaryButton className="mt-4">
							<Link to={`/progress`}>See your run progress and shop →</Link>
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

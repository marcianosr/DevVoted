import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PollQuestionDisplay } from "~/domains//polls/components/PollQuestionDisplay";
import { ApplyEffects } from "~/domains/configs/data/configs";
import {
	getCommunityStatsHandler,
	getScoreBreakdownHandler,
} from "~/domains/polls/api/handlers";
import { postPollOptions } from "~/domains/polls/api/polls";
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
	configEffects: ApplyEffects;
	creatorDisplayName: string | null;
};

const DailyPollContainer = ({
	poll,
	options,
	hasAnswered,
	selectedOptions,
	score,
	configEffects,
	creatorDisplayName,
}: DailyPollContainerProps) => {
	const router = useRouter();
	const navigate = useNavigate();
	const category = getCategoryMetadata(poll.categoryCode);

	// Store the score from mutation to avoid stale data after router.invalidate()
	// The loader recalculates score with updated run data, which gives wrong values
	const [submittedScore, setSubmittedScore] = useState<ScoreCalculation | null>(
		null
	);

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
		mutationFn: postPollOptions,

		onSuccess: (response) => {
			if (response.success) {
				// Store the breakdown from the mutation - this is the correct score
				// that was actually saved to the DB
				if (response.data.breakdown) {
					setSubmittedScore({
						breakdown: response.data.breakdown,
						newTotalCoverage: 0, // Not used in display
						newBestStreak: 0, // Not used in display
						newStreak: response.data.breakdown.streak,
						newPollsAnswered: 0, // Not used in display
					});
				}

				if (response.data.runEnded) {
					navigate({ to: "/game-over" });
					return;
				}
			}

			router.invalidate();
		},
		onError: (error) => {
			console.error("Error submitting poll options", error);
		},
	});

	// Use the submitted score if available (just answered), otherwise fall back to loader's score
	const displayScore = submittedScore ?? score;

	return (
		<section>
			<header className="border-b border-theme py-4 mb-8">
				<p className="text-4xl text-theme">{category.name}</p>
				<p>
					#{poll.pollNumber} · Opened at{" "}
					<time dateTime={poll.updatedAt?.toISOString()}>
						{poll.updatedAt?.toDateString()}
					</time>
				</p>
				<p>Created by: {creatorDisplayName ?? "Unknown"}</p>
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
							score={displayScore}
							communityStats={communityStats}
							categoryCode={poll.categoryCode}
							explanation={poll.explanation}
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
						effect={configEffects}
						selectedOptions={selectedOptions}
						mutation={mutation}
					/>
				)}
			</div>
		</section>
	);
};

export default DailyPollContainer;

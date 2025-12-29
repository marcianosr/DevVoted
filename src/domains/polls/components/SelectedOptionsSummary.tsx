import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";

import UserAvatar from "~/components/UserAvatar";
import Leaderboard from "~/domains/leaderboards/components/Leaderboard";
import NextPollCategoryForm from "~/domains/polls/components/NextPollCategoryForm";
import { ScoreCalculation } from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";
import { PrimaryButton } from "~/ui/PrimaryButton";

import MarkdownText from "./MarkdownText";
import { CommunityStats } from "../api/queries"; // TODO: don;t import type from api, move to models
import { PollOption } from "../models/pollOption";

const formatTimeTaken = (ms: number | null): string | null => {
	if (ms === null) return null;

	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

type SelectedOptionsSummaryProps = {
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	categoryCode: CategoryCode;
	explanation?: string | null;
};

const SelectedOptionsSummary = ({
	options,
	selectedOptions,
	score,
	communityStats,
	categoryCode,
	explanation,
}: SelectedOptionsSummaryProps) => {
	return (
		<section className="space-y-14 border-b border-theme mb-8">
			<div>
				<h3 className="text-4xl">Results</h3>
				<section className="mt-4 pt-4 border-t border-theme space-y-2">
					<p className="text-2xl">Your choice(s):</p>

					<ul className="list-disc px-4">
						{selectedOptions.map((optionId) => {
							const option = options.find((opt) => opt.id === Number(optionId));
							const styles = clsx(
								"text-xl",
								option?.correct ? "text-green-400" : "text-red-400"
							);

							if (!option) return null;

							return (
								<li key={option.id} className={`${styles} markdown`}>
									<MarkdownText>{option.option}</MarkdownText>
								</li>
							);
						})}
					</ul>

					<h3 className="text-2xl">Correct answer(s):</h3>
					<ul className="list-disc px-4">
						{options
							.filter((opt) => opt.correct)
							.map((opt) => (
								<li key={opt.id} className="text-green-400 text-xl markdown">
									<MarkdownText>{opt.option}</MarkdownText>
								</li>
							))}
					</ul>

					{explanation && (
						<div className="mt-6 p-4 bg-gray-800/40 border border-gray-700">
							<h4 className="text-xl mb-2">💡 Explanation</h4>
							<div className="markdown text-gray-300">
								<MarkdownText>{explanation}</MarkdownText>
							</div>
						</div>
					)}
				</section>
				{score && (
					<section className="mt-4 py-8 border-t border-theme space-y-2">
						<h3 className="text-4xl">Score</h3>
						{score.breakdown.earnedCoverage > 0 ? (
							<section>
								<ul className="ml-4 text-green-400 list-disc border-b border-white w-fit py-2">
									<li>Base score: +{score?.breakdown.baseCoverage}%</li>
									<li>Config bonus: +{score?.breakdown.configBonus}%</li>
									<li>Streak bonus: +{score?.breakdown.streakBonus}%</li>
								</ul>
								<p className="text-3xl text-green-400 py-2 pb-6">
									+{score?.breakdown.earnedCoverage}%{" "}
									<span className="text-lg">coverage earned</span>
								</p>

								<ul className="text-xl list-disc px-4">
									<li>Correct streak: ⚡️ {score?.newStreak}</li>
									<li>Total polls answered: {score?.newPollsAnswered}</li>
								</ul>
							</section>
						) : (
							<ul>
								<li className="text-red-400 text-xl">
									Coverage score: -{score?.breakdown.earnedCoverage}%
								</li>
								<li className="text-red-400 text-xl">
									Correct streak: ⚡️ {score?.newStreak}
								</li>
								<li>Total polls answered: {score?.newPollsAnswered}</li>
							</ul>
						)}
					</section>
				)}
				<section className="mt-4 py-8 border-t border-theme space-y-2">
					<h3 className="text-4xl">👥 Community</h3>
					<p className="text-xl">
						<span>
							{communityStats?.totalResponses} player(s) participated in this
							poll{" "}
						</span>
						<span className="mx-2">·</span>
						<span>
							{communityStats?.users.map((user) => (
								<UserAvatar key={user.id} user={user} />
							))}
						</span>
					</p>
					{communityStats?.firstToAnswer && (
						<div>
							<p className="text-xl mt-4">First to answer</p>
							<div className="flex gap-2 items-center">
								<UserAvatar user={communityStats.firstToAnswer} />
								<p>{communityStats.firstToAnswer.displayName}</p>
								{communityStats.firstToAnswer.timeTakenMs !== null && (
									<span className="text-zinc-400 text-sm">
										in{" "}
										{formatTimeTaken(communityStats.firstToAnswer.timeTakenMs)}
									</span>
								)}
							</div>
						</div>
					)}
					{communityStats?.fastestResponder && (
						<div>
							<p className="text-xl mt-4">Fastest responder</p>
							<div className="flex gap-2 items-center">
								<UserAvatar user={communityStats.fastestResponder} />
								<p>{communityStats.fastestResponder.displayName}</p>
								{communityStats.fastestResponder.timeTakenMs !== null && (
									<span className="text-zinc-400 text-sm">
										in{" "}
										{formatTimeTaken(
											communityStats.fastestResponder.timeTakenMs
										)}
									</span>
								)}
							</div>
						</div>
					)}
					<section className="flex items-baseline flex-col mt-8">
						<h3 className="text-2xl">
							Be even more involved in this community!
						</h3>
						<small>Add a poll yourself!</small>
						<PrimaryButton className="mt-4" size="small">
							<Link
								to="/polls/new"
								className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
							>
								Suggest a poll yourself →
							</Link>
						</PrimaryButton>
					</section>
					<section>
						<NextPollCategoryForm />
					</section>
					<section className="mt-16">
						<Leaderboard categoryCode={categoryCode} />
					</section>
				</section>
			</div>
		</section>
	);
};

export default SelectedOptionsSummary;

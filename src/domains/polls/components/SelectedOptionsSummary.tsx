import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import Leaderboard from "~/domains/leaderboards/components/Leaderboard";
import { ScoreCalculation } from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";

import { PollOption } from "../models/pollOption";

type SelectedOptionsSummaryProps = {
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: {
		totalResponses: number;
	};
	categoryCode: CategoryCode;
};

const SelectedOptionsSummary = ({
	options,
	selectedOptions,
	score,
	communityStats,
	categoryCode,
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
									<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
										{option.option}
									</ReactMarkdown>
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
									<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
										{opt.option}
									</ReactMarkdown>
								</li>
							))}
					</ul>
				</section>
				{score && (
					<section className="mt-4 py-8 border-t border-theme space-y-2">
						<h3 className="text-4xl">Score</h3>
						{score.breakdown.earnedCoverage > 0 ? (
							<ul className="text-xl list-disc px-4">
								<li>
									Coverage earned:{" "}
									<span className="text-green-400">
										+{score?.breakdown.earnedCoverage}% coverage
									</span>
									<small className="ml-4 text-green-400 ">
										({score?.breakdown.baseCoverage} +{" "}
										{score?.breakdown.configBonus} +{" "}
										{score?.breakdown.streakBonus})
									</small>
								</li>
								<li>Correct streak: ⚡️ {score?.newStreak}</li>
								<li>Total polls answered: {score?.newPollsAnswered}</li>
							</ul>
						) : (
							<p className="text-red-400 text-xl">
								Coverage score: {score?.breakdown.earnedCoverage}%
							</p>
						)}
					</section>
				)}
				<section className="mt-4 py-8 border-t border-theme space-y-2">
					<h3 className="text-4xl">👥 Community</h3>
					<p className="text-xl">
						{communityStats?.totalResponses} player(s) participated in this poll
					</p>
					<Leaderboard categoryCode={categoryCode} />
				</section>
			</div>
		</section>
	);
};

export default SelectedOptionsSummary;

import { getCategoryMetadata } from "~/domains/shared/categories";
import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

export const AnswerResults = ({ answered }: AnswerResultsProps) => (
	<section className="flex flex-col gap-2">
		<Subtitle>Your answers</Subtitle>
		<ul className="flex flex-col gap-1">
			{answered.map((poll, index) => (
				<li key={`${poll.id}-${index}`} className="flex flex-col gap-0.5">
					<span className="flex items-baseline gap-2">
						<span className={poll.correct ? "text-viridian" : "text-cinnabar"}>
							{poll.correct ? "✓" : "✕"}
						</span>
						<span
							{...categoryTheme(poll.category)}
							className="flex items-center gap-1.5 font-bold text-theme"
						>
							<span className="inline-block h-3.5 w-3.5 rounded bg-theme" />
							{getCategoryMetadata(poll.category).name}
						</span>
						<Paragraph>{poll.question}</Paragraph>
					</span>
					<ul
						className={`list-disc pl-10 ${poll.correct ? "text-viridian" : "text-cinnabar"}`}
					>
						{poll.picked.map((pick, pickIndex) => (
							<li key={`${pick}-${pickIndex}`}>{pick}</li>
						))}
					</ul>
				</li>
			))}
		</ul>
	</section>
);

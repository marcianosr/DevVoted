import { cva } from "class-variance-authority";
import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

const resultMarker = cva("", {
	variants: {
		correct: {
			true: "text-celadon",
			false: "text-vermillion",
		},
	},
});

const resultRow = cva("flex items-start gap-2 rounded-lg p-3", {
	variants: {
		correct: {
			true: "bg-celadon/10",
			false: "bg-vermillion/10",
		},
	},
});

export const AnswerResults = ({ answered }: AnswerResultsProps) => (
	<section className="flex flex-col gap-2">
		<Title size="sm">Your answers</Title>
		<ul className="flex flex-col gap-6">
			{answered.map((poll, index) => {
				const tone = poll.correct ? "celadon" : "vermillion";
				return (
					<li
						key={`${poll.id}-${index}`}
						className={resultRow({ correct: poll.correct })}
					>
						<span className={resultMarker({ correct: poll.correct })}>
							{poll.correct ? "✓" : "✕"}
						</span>
						{/* The category swatch stands in for its name, inline before the
						    question; the coverage legend below decodes the colors. */}
						<div className="flex min-w-0 flex-col gap-1">
							<span className="flex items-center gap-2">
								<span {...categoryTheme(poll.category)} className="inline-flex">
									<Swatch />
								</span>
								<Paragraph size="sm" className="font-black">
									{poll.question}
								</Paragraph>
							</span>
							<ul
								className={`list-disc pl-5 ${resultMarker({ correct: poll.correct })}`}
							>
								{poll.picked.map((pick, pickIndex) => (
									<li key={`${pick}-${pickIndex}`}>
										<Paragraph tone={tone}>{pick}</Paragraph>
									</li>
								))}
							</ul>
						</div>
					</li>
				);
			})}
		</ul>
	</section>
);

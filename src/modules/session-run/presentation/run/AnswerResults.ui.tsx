import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

export const AnswerResults = ({ answered }: AnswerResultsProps) => (
	<section className="flex flex-col gap-2">
		<Title size="sm">Your answers</Title>
		<ul className="flex flex-col gap-6">
			{answered.map((poll, index) => {
				const tone = poll.correct ? "celadon" : "vermillion";
				const markerColor = poll.correct ? "text-celadon" : "text-vermillion";
				const rowBg = poll.correct ? "bg-celadon/10" : "bg-vermillion/10";
				return (
					<li
						key={`${poll.id}-${index}`}
						className={`flex items-start gap-2 rounded-lg p-3 ${rowBg}`}
					>
						<span className={markerColor}>{poll.correct ? "✓" : "✕"}</span>
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
							<ul className={`list-disc pl-5 ${markerColor}`}>
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

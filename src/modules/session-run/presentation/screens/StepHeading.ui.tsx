import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

type StepTone = "cerulean" | "viridian";

const TONE: Record<StepTone, string> = {
	cerulean: "bg-cerulean",
	viridian: "bg-viridian",
};

type StepHeadingProps = {
	step: number;
	title: string;
	subtitle?: string;
	tone?: StepTone;
};

/** A numbered step header — a tinted circle beside a Title, for the two build stages. */
export const StepHeading = ({
	step,
	title,
	subtitle,
	tone = "cerulean",
}: StepHeadingProps) => (
	<header className="flex items-start gap-3">
		<span
			className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black ${TONE[tone]}`}
		>
			{step}
		</span>
		<div>
			<Title as="h2" size="md">
				{title}
			</Title>
			{subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
		</div>
	</header>
);

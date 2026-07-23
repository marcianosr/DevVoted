import { cva } from "class-variance-authority";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

type StepTone = "cerulean" | "viridian";

type StepHeadingProps = {
	step: number;
	title: string;
	subtitle?: string;
	tone?: StepTone;
};

const stepBadge = cva(
	"mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black",
	{
		variants: {
			tone: {
				cerulean: "bg-cerulean",
				viridian: "bg-viridian",
			} satisfies Record<StepTone, string>,
		},
	}
);

export const StepHeading = ({
	step,
	title,
	subtitle,
	tone = "cerulean",
}: StepHeadingProps) => (
	<header className="flex items-start gap-3">
		<span className={stepBadge({ tone })}>{step}</span>
		<header>
			<Title as="h2" size="md">
				{title}
			</Title>
			{subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
		</header>
	</header>
);

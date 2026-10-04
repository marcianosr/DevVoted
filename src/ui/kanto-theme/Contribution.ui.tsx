import { Fragment } from "react";

import { Badge } from "./Badge.ui";

const SEPARATOR = "·";

type Count = { figure: string; words: string };

const counted = (count: number, one: string, many: string): Count => ({
	figure: count.toLocaleString("en"),
	words: count === 1 ? one : many,
});

export const COPY = {
	answered: (count: number) =>
		counted(count, "poll answered", "polls answered"),
	published: (count: number) =>
		counted(count, "poll published", "polls published"),
	answers: (count: number) => counted(count, "answer", "answers"),
} as const;

const CONTRIBUTION =
	"flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-wide text-theme-faint";
const PART = "inline-flex items-center gap-1.5";

export type Authored = {
	role?: string;
	published: number;
	answers: number;
};

export type ContributionProps = {
	answered: number;
	authored?: Authored;
};

type Part = Count | { words: string };

const authoredParts = ({ role, published, answers }: Authored): Part[] => [
	...(role === undefined ? [] : [{ words: role }]),
	COPY.published(published),
	COPY.answers(answers),
];

const PartReading = ({ part }: { part: Part }) => (
	<span className={PART}>
		{"figure" in part ? <Badge>{part.figure}</Badge> : null}
		{part.words}
	</span>
);

export const Contribution = ({ answered, authored }: ContributionProps) => {
	const parts = [
		...(authored === undefined ? [] : authoredParts(authored)),
		COPY.answered(answered),
	];

	return (
		<span className={CONTRIBUTION}>
			{parts.map((part, index) => (
				<Fragment key={part.words}>
					{index === 0 ? null : <span aria-hidden>{SEPARATOR}</span>}
					<PartReading part={part} />
				</Fragment>
			))}
		</span>
	);
};

const SEPARATOR = " · ";

const counted = (count: number, one: string, many: string): string =>
	`${count.toLocaleString("en")} ${count === 1 ? one : many}`;

export const COPY = {
	answered: (count: number) =>
		counted(count, "poll answered", "polls answered"),
	published: (count: number) =>
		counted(count, "poll published", "polls published"),
	answers: (count: number) => counted(count, "answer", "answers"),
} as const;

const CONTRIBUTION =
	"truncate text-xs uppercase tracking-wide text-theme-faint";

export type Authored = {
	role?: string;
	published: number;
	answers: number;
};

export type ContributionProps = {
	answered: number;
	authored?: Authored;
};

const authoredParts = ({ role, published, answers }: Authored) => [
	role,
	COPY.published(published),
	COPY.answers(answers),
];

export const Contribution = ({ answered, authored }: ContributionProps) => (
	<span className={CONTRIBUTION}>
		{[
			...(authored === undefined ? [] : authoredParts(authored)),
			COPY.answered(answered),
		]
			.filter((part) => part !== undefined)
			.join(SEPARATOR)}
	</span>
);

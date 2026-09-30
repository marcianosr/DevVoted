const SEPARATOR = " · ";

const counted = (count: number, one: string, many: string): string =>
	`${count.toLocaleString("en")} ${count === 1 ? one : many}`;

export const COPY = {
	published: (count: number) =>
		counted(count, "poll published", "polls published"),
	answers: (count: number) => counted(count, "answer", "answers"),
} as const;

const CONTRIBUTION =
	"truncate text-xs uppercase tracking-wide text-theme-faint";

export type ContributionProps = {
	role?: string;
	published: number;
	answers: number;
};

export const Contribution = ({
	role,
	published,
	answers,
}: ContributionProps) => (
	<span className={CONTRIBUTION}>
		{[role, COPY.published(published), COPY.answers(answers)]
			.filter((part) => part !== undefined)
			.join(SEPARATOR)}
	</span>
);

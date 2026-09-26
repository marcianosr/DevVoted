import type { ReactNode } from "react";

import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	credit:
		"A crazy roguelite obsession built with craftsmanship, passion, ❤️ & TanStack Start by Marciano Schildmeijer",
	established: "EST may 2022",
	updated: "Last updated:",
	foundBug: "Found a bug?",
	report: "Report it on GitHub",
} as const;

const ISSUES = "https://github.com/marcianosr/DevVoted/issues";

const FOOTER =
	"mt-auto flex flex-col items-center gap-4 border-t border-theme-faint px-4 py-6";
const COUNTS = "flex flex-wrap items-center justify-center gap-2";
const CREDIT = "flex flex-col items-center gap-1 text-center";

const SEPARATOR = "·";

export type AppFooterProps = {
	pollCount: number | null;
	categoryCount: number;
	configCount: number;
	lastCommitDate: string;
	statsLink?: ReactNode;
};

const Count = ({ children }: { children: ReactNode }) => (
	<Typography variant="hint" as="span">
		{children}
	</Typography>
);

export const AppFooter = ({
	pollCount,
	categoryCount,
	configCount,
	lastCommitDate,
	statsLink,
}: AppFooterProps) => (
	<footer className={FOOTER}>
		<section className={COUNTS}>
			{pollCount === null ? null : (
				<>
					<Count>{`${pollCount} polls`}</Count>
					<Count>{SEPARATOR}</Count>
				</>
			)}
			<Count>{`${categoryCount} categories`}</Count>
			<Count>{SEPARATOR}</Count>
			<Count>{`${configCount} configs`}</Count>
			{statsLink === undefined ? null : (
				<>
					<Count>{SEPARATOR}</Count>
					{statsLink}
				</>
			)}
		</section>

		<section className={CREDIT}>
			<Typography variant="hint">
				{`${COPY.credit} | ${COPY.established} | ${COPY.updated} ${lastCommitDate}`}
			</Typography>
			<Typography variant="hint">
				{COPY.foundBug}{" "}
				<Link href={ISSUES} external>
					{COPY.report}
				</Link>
			</Typography>
		</section>
	</footer>
);

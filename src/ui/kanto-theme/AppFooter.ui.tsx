import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Logo } from "./Logo.ui";
import { opensHere } from "./opensHere";
import { Typography } from "./Typography.ui";

const COPY = {
	tagline:
		"a roguelite obsession, built with craftsmanship, passion ♥ & TanStack Start",
	lastCommit: "last commit",
	by: "by",
	since: "since 2022",
	report: "report a bug",
	wiki: "wiki",
} as const;

const ISSUES = "https://github.com/marcianosr/DevVoted/issues";
const BUG = "🐛";
const BOOK = "📖";
const SEPARATOR = "·";
const THEME: KantoColor = "pewter";

const FOOTER = "mt-auto px-4 pt-10 pb-6";
const CARD =
	"flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-theme-faint bg-theme-faint px-5 py-4";
const COUNTS = "flex flex-wrap items-center gap-2";
const META = "flex grow flex-wrap items-center justify-end gap-x-3 gap-y-2";
const STAMP = "font-bold lowercase text-brand-sand";
const HANDLE = "font-bold text-brand-bone";
const REPORT =
	"inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-bold text-theme-muted ring-1 ring-inset ring-theme-faint transition-colors hover:text-theme-soft hover:ring-theme-soft";

export type AppFooterProps = {
	pollCount: number | null;
	categoryCount: number;
	configCount: number;
	lastCommitDate: string;
	lastCommitAuthor: string;
	wikiHref?: string;
	onNavigate?: (href: string) => void;
};

export const AppFooter = ({
	pollCount,
	categoryCount,
	configCount,
	lastCommitDate,
	lastCommitAuthor,
	wikiHref,
	onNavigate,
}: AppFooterProps) => (
	<footer className={FOOTER}>
		<div data-screen-theme={THEME} className={CARD}>
			<Logo
				size="md"
				below={
					<>
						<Typography variant="hint">{COPY.tagline}</Typography>
						<span className={COUNTS}>
							{pollCount === null ? null : (
								<Badge>{`${pollCount} polls`}</Badge>
							)}
							<Badge>{`${categoryCount} categories`}</Badge>
							<Badge>{`${configCount} configs`}</Badge>
						</span>
					</>
				}
			/>

			<div className={META}>
				<Typography variant="hint" as="span">
					{`${COPY.lastCommit} `}
					<span className={STAMP}>{lastCommitDate}</span>
					{` ${COPY.by} `}
					<span className={HANDLE}>{`@${lastCommitAuthor}`}</span>
					{` ${SEPARATOR} ${COPY.since}`}
				</Typography>

				{wikiHref === undefined ? null : (
					<a
						className={REPORT}
						href={wikiHref}
						onClick={(event) => {
							if (onNavigate === undefined || !opensHere(event)) return;
							event.preventDefault();
							onNavigate(wikiHref);
						}}
					>
						<span aria-hidden>{BOOK}</span>
						{COPY.wiki}
					</a>
				)}
				<a className={REPORT} href={ISSUES} target="_blank" rel="noreferrer">
					<span aria-hidden>{BUG}</span>
					{COPY.report}
				</a>
			</div>
		</div>
	</footer>
);

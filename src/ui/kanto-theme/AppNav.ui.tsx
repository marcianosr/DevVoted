import { clsx } from "clsx";
import type { MouseEvent, ReactNode } from "react";

import {
	COMMUNITY,
	SUGGEST_A_POLL,
	YOUR_SUGGESTED_POLLS,
} from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { archiveLabel } from "~/shared/lib/storage";

import { Badge } from "./Badge.ui";
import { Balance } from "./Balance.ui";
import { Climber } from "./Climber.ui";
import { Figures } from "./Figures.ui";
import { Logo } from "./Logo.ui";
import { NavDisclosure, NavDivider } from "./NavDisclosure.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import type { NavRunReading } from "./useNavRun.hook";
import { WornTitles } from "./WornTitles.ui";

export const COPY = {
	home: "devvoted, back to the start",
	run: "Daily Run",
	community: COMMUNITY,
	suggest: SUGGEST_A_POLL,
	suggestFor: (reward: string) => `${SUGGEST_A_POLL} · ${reward}`,
	signIn: "Sign in",
	signOut: "Sign out",
	profile: "Profile & Dex",
	suggested: YOUR_SUGGESTED_POLLS,
	account: "Your account",
	runStorage: "run",
	pollsLeft: (count: number) => `${plural(count, "poll")} left`,
} as const;

const AVATAR_THEME = "vermillion";
const BADGE_THEME = "saffron";
const SEPARATOR = " · ";

const WRAP = "flex items-center gap-2 bg-black px-2 py-1.5";
const BAR =
	"flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-theme-faint bg-theme-faint px-3 py-1.5";
const GROUP = "flex min-w-0 items-center gap-1";
const DESKTOP = "hidden md:inline-flex";
const TRACK = "hidden shrink-0 lg:flex";
const FUNDS = "ml-auto flex shrink-0";
const TRACK_SIZE = "small";

const HOME = "shrink-0 rounded-md px-1 py-1 hover:brightness-110";

const ITEM =
	"inline-flex min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors";
const ITEM_LABEL = "truncate";
const ITEM_HERE =
	"bg-theme-raised text-theme-faint ring-1 ring-inset ring-theme-soft";
const ITEM_ELSEWHERE =
	"text-theme-muted hover:bg-theme-raised hover:text-theme-soft";

const SIGN_IN =
	"inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-bold text-theme-faint ring-1 ring-inset ring-theme-soft transition-colors hover:bg-theme-raised";

const MENU = "flex w-64 flex-col";
const MENU_HEAD = "flex items-start gap-3 px-4 py-3";
const MENU_NAMING = "flex min-w-0 flex-col gap-1.5";
const MENU_NAME = "break-all";
const STANDING = "flex flex-wrap items-center gap-x-2 gap-y-1.5";
const MENU_ROW =
	"block px-4 py-2 text-sm text-theme-soft transition-colors hover:bg-theme-raised";
const HIDDEN = "sr-only";

const opensHere = (event: MouseEvent<HTMLAnchorElement>): boolean =>
	event.button === 0 &&
	!event.metaKey &&
	!event.ctrlKey &&
	!event.shiftKey &&
	!event.altKey;

type NavAnchorProps = {
	href: string;
	className: string;
	children: ReactNode;
	label?: string;
	onNavigate?: (href: string) => void;
};

const NavAnchor = ({
	href,
	className,
	children,
	label,
	onNavigate,
}: NavAnchorProps) => (
	<a
		href={href}
		aria-label={label}
		className={className}
		onClick={(event) => {
			if (onNavigate === undefined || !opensHere(event)) return;
			event.preventDefault();
			onNavigate(href);
		}}
	>
		{children}
	</a>
);

export type NavViewer = {
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	titles?: readonly string[];
	archivedStorage: number;
	profileHref: string;
	suggestedHref: string;
	signOutHref: string;
};

export type NavTarget = {
	href: string;
	active: boolean;
};

export type NavRun = NavTarget & { pollsLeft?: number };

export type NavSuggest = NavTarget & { reward?: string };

const suggestLabelOf = ({ reward }: NavSuggest): string =>
	reward === undefined ? COPY.suggest : COPY.suggestFor(reward);

export type AppNavProps = {
	homeHref: string;
	signInHref: string;
	run: NavRun;
	community: NavTarget;
	suggest: NavSuggest;
	viewer?: NavViewer;
	reading?: NavRunReading;
	onNavigate?: (href: string) => void;
};

type NavItemProps = NavTarget & {
	label: string;
	count?: number;
	desktopOnly?: boolean;
	onNavigate?: (href: string) => void;
};

const countedNameOf = (label: string, count?: number): string | undefined =>
	count === undefined
		? undefined
		: `${label}${SEPARATOR}${COPY.pollsLeft(count)}`;

const NavItem = ({
	href,
	active,
	label,
	count,
	desktopOnly = false,
	onNavigate,
}: NavItemProps) => (
	<NavAnchor
		href={href}
		label={countedNameOf(label, count)}
		className={clsx(
			ITEM,
			active ? ITEM_HERE : ITEM_ELSEWHERE,
			desktopOnly && DESKTOP
		)}
		onNavigate={onNavigate}
	>
		<span className={ITEM_LABEL}>{label}</span>
		{count === undefined ? null : <Badge color={BADGE_THEME}>{count}</Badge>}
	</NavAnchor>
);

const Mark = ({ viewer, size }: { viewer: NavViewer; size: "sm" | "md" }) => (
	<span data-screen-theme={AVATAR_THEME}>
		<Climber
			name={viewer.name}
			photoUrl={viewer.photoUrl}
			borderUrl={viewer.borderUrl}
			size={size}
		/>
	</span>
);

const Standing = ({ viewer }: { viewer: NavViewer }) => (
	<span className={STANDING}>
		<WornTitles titles={viewer.titles ?? []} />
		<Typography variant="hint" as="span">
			<Figures text={archiveLabel(viewer.archivedStorage)} />
		</Typography>
	</span>
);

type AccountMenuProps = {
	viewer: NavViewer;
	community: NavTarget;
	suggest: NavSuggest;
	onNavigate?: (href: string) => void;
};

const AccountMenu = ({
	viewer,
	community,
	suggest,
	onNavigate,
}: AccountMenuProps) => (
	<NavDisclosure
		summary={
			<>
				<span className={HIDDEN}>{COPY.account}</span>
				<Mark viewer={viewer} size="sm" />
			</>
		}
	>
		<div className={MENU}>
			<div className={MENU_HEAD}>
				<Mark viewer={viewer} size="md" />
				<span className={MENU_NAMING}>
					<span className={MENU_NAME}>
						<Typography variant="subtitle" as="span">
							{viewer.name}
						</Typography>
					</span>
					<Standing viewer={viewer} />
				</span>
			</div>

			<NavDivider />

			<NavAnchor
				href={viewer.profileHref}
				className={MENU_ROW}
				onNavigate={onNavigate}
			>
				{COPY.profile}
			</NavAnchor>
			<NavAnchor
				href={viewer.suggestedHref}
				className={MENU_ROW}
				onNavigate={onNavigate}
			>
				{COPY.suggested}
			</NavAnchor>
			<NavAnchor
				href={community.href}
				className={clsx(MENU_ROW, "md:hidden")}
				onNavigate={onNavigate}
			>
				{COPY.community}
			</NavAnchor>
			<NavAnchor
				href={suggest.href}
				className={clsx(MENU_ROW, "md:hidden")}
				onNavigate={onNavigate}
			>
				{suggestLabelOf(suggest)}
			</NavAnchor>

			<NavDivider />

			<NavAnchor href={viewer.signOutHref} className={MENU_ROW}>
				{COPY.signOut}
			</NavAnchor>
		</div>
	</NavDisclosure>
);

export const AppNav = ({
	homeHref,
	signInHref,
	run,
	community,
	suggest,
	viewer,
	reading,
	onNavigate,
}: AppNavProps) => (
	<div className={WRAP}>
		<header className={BAR}>
			<NavAnchor
				href={homeHref}
				label={COPY.home}
				className={HOME}
				onNavigate={onNavigate}
			>
				<Logo size="sm" />
			</NavAnchor>

			{viewer === undefined ? (
				<NavAnchor
					href={signInHref}
					className={clsx(SIGN_IN, "ml-auto")}
					onNavigate={onNavigate}
				>
					{COPY.signIn}
				</NavAnchor>
			) : (
				<nav className={GROUP}>
					<NavItem
						href={run.href}
						active={run.active}
						label={COPY.run}
						count={run.pollsLeft}
						onNavigate={onNavigate}
					/>
					<NavItem
						{...community}
						label={COPY.community}
						desktopOnly
						onNavigate={onNavigate}
					/>
					<NavItem
						href={suggest.href}
						active={suggest.active}
						label={suggestLabelOf(suggest)}
						desktopOnly
						onNavigate={onNavigate}
					/>
				</nav>
			)}
			{viewer === undefined || reading === undefined ? null : (
				<>
					<span className={TRACK}>
						<SwatchTrack swatches={reading.swatches} size={TRACK_SIZE} />
					</span>
					{reading.funds === undefined ? null : (
						<span className={FUNDS}>
							<Balance
								{...reading.funds}
								layout="inline"
								tag={COPY.runStorage}
							/>
						</span>
					)}
				</>
			)}
		</header>

		{viewer === undefined ? null : (
			<AccountMenu
				viewer={viewer}
				community={community}
				suggest={suggest}
				onNavigate={onNavigate}
			/>
		)}
	</div>
);

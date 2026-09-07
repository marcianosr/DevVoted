import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { AvatarChip } from "../AvatarChip.ui";
import { Badge, badgeNumbers } from "../Badge.ui";
import { Button } from "../Button.ui";
import { ClimbTrack, type ClimbTrackProps } from "../ClimbTrack.ui";
import { Fieldset } from "../Fieldset.ui";
import { plural } from "../format";
import { Panel } from "../Panel.ui";
import { ResultRow, type ResultRowProps } from "../ResultRow.ui";
import { Section } from "../Section.ui";
import { Swatch } from "../Swatch.ui";
import { Tabs } from "../Tabs.ui";
import { Text } from "../Text.ui";

const HEADER = "flex items-start justify-between gap-4 @max-md:flex-col";
const GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
const WHO = "flex items-center gap-2";
const POLL_FACTS = "flex flex-wrap items-center gap-2";
const ROWS = "flex flex-col gap-3";
const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

export type StandoutEntry = {
	title: string;
	avatar: {
		name: string;
		photoUrl?: string;
		borderUrl?: string;
		you: boolean;
	};
	detail: string;
	swatch?: { theme?: SwatchTheme; finish: SwatchFinish };
};

export type PollChip = { id: string; label: string; disabled: boolean };

export type CommunityPollDetail = {
	category: string;
	rightShare: string;
	question: string;
	multiple: boolean;
	rows: readonly ResultRowProps[];
};

export type CommunityScreenProps = {
	theme?: SwatchTheme;
	standouts: readonly StandoutEntry[];
	pollChips: readonly PollChip[];
	selectedChipId?: string;
	onSelectPoll?: (id: string) => void;
	poll?: CommunityPollDetail;
	pollNote?: string;
	totalPlayers?: number;
	climb?: ClimbTrackProps;
	topPercent?: number;
	countdown?: string;
	back: {
		label: string;
		disabled?: boolean;
		hint?: string;
		onBack?: () => void;
	};
};

const StandoutBox = ({ entry }: { entry: StandoutEntry }) => (
	<Fieldset legend={entry.title}>
		<span className={WHO}>
			<AvatarChip
				name={entry.avatar.name}
				photoUrl={entry.avatar.photoUrl}
				borderUrl={entry.avatar.borderUrl}
				you={entry.avatar.you}
			/>
			<Text size="title" className="truncate font-bold">
				{entry.avatar.name}
			</Text>
			{entry.swatch === undefined ? null : (
				<Swatch theme={entry.swatch.theme} finish={entry.swatch.finish} />
			)}
		</span>
		<Text size="caption" tone="muted">
			{entry.detail}
		</Text>
	</Fieldset>
);

const PollDetail = ({ poll }: { poll: CommunityPollDetail }) => (
	<div className="flex flex-col gap-4">
		<div className={POLL_FACTS}>
			<Badge>{poll.category}</Badge>
			<Text tone="muted" className="inline-flex flex-wrap items-center gap-1">
				{badgeNumbers(poll.rightShare)}
			</Text>
			{poll.multiple ? (
				<Text size="caption" tone="faint">
					multiple choice
				</Text>
			) : null}
		</div>
		<Text as="p" size="title" className="font-bold">
			{poll.question}
		</Text>
		<ul className={ROWS}>
			{poll.rows.map((row) => (
				<ResultRow key={row.letter} {...row} />
			))}
		</ul>
	</div>
);

export const CommunityScreen = ({
	theme,
	standouts,
	pollChips,
	selectedChipId,
	onSelectPoll,
	poll,
	pollNote,
	totalPlayers,
	climb,
	topPercent,
	countdown,
	back,
}: CommunityScreenProps) => (
	<Panel theme={theme} sidebar>
		<header className={HEADER}>
			<Text size="score" className="font-bold">
				Community
			</Text>
			{topPercent === undefined ? null : (
				<Text tone="muted" className="inline-flex flex-wrap items-center gap-1">
					{badgeNumbers(`top ${topPercent}% of players today`)}
				</Text>
			)}
		</header>

		<Section label="Standouts today">
			{standouts.length === 0 ? (
				<Text tone="muted">Nothing stands out yet — the day is young.</Text>
			) : (
				<div className={GRID}>
					{standouts.map((entry) => (
						<StandoutBox key={entry.title} entry={entry} />
					))}
				</div>
			)}
		</Section>

		<Section label="The climb today">
			{climb === undefined ? (
				<Text tone="muted">Start a run to place yourself on the map.</Text>
			) : (
				<ClimbTrack gates={climb.gates} />
			)}
		</Section>

		<Section
			label="Today's polls"
			meta={
				totalPlayers === undefined
					? undefined
					: `${plural(totalPlayers, "player")} answered`
			}
		>
			<div className="flex flex-col gap-4">
				{pollChips.length === 0 ? null : (
					<Tabs
						label="today's polls"
						variant="pill"
						items={pollChips}
						activeId={selectedChipId ?? ""}
						onSelect={onSelectPoll}
					/>
				)}
				{poll === undefined ? (
					<Text tone="muted">{pollNote}</Text>
				) : (
					<PollDetail poll={poll} />
				)}
			</div>
		</Section>

		<footer className={FOOTER}>
			<Text tone="muted">{countdown ?? ""}</Text>
			<Button
				label={back.label}
				variant="primary"
				disabled={back.disabled === true}
				hint={back.hint}
				onUse={back.onBack}
			/>
		</footer>
	</Panel>
);

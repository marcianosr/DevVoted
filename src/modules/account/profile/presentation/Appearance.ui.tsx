import { clsx } from "clsx";

import type {
	AppearanceView,
	BorderPick,
	Tally,
	TitlePick,
} from "~/modules/account/profile/application/appearance.viewmodel";
import { WORN_TITLE_CAP } from "~/modules/account/profile/domain/title.model";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { ProfileCard } from "~/ui/kanto-theme/ProfileCard.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const missingOf = ({ held, total }: Tally) => total - held;

export const COPY = {
	label: "Appearance",
	tryingOn: (name: string) => `trying on ${name}`,
	border: "Border",
	borderMeta: ({ held, total }: Tally) => `${held} of ${total} owned`,
	defaultFrame: "–",
	moreBorders: (tally: Tally) => `+${missingOf(tally)}`,
	moreBordersCaption: "in Dex",
	moreBordersHint: (tally: Tally) =>
		`${missingOf(tally)} more borders in the Dex`,
	pickBorder: (name: string) => `Wear ${name}`,
	titles: "Titles",
	titlesMeta: `tap to wear · up to ${WORN_TITLE_CAP} · first shows everywhere`,
	moreTitles: (tally: Tally) => `+ ${missingOf(tally)} to earn →`,
	tally: (titles: Tally, borders: Tally) =>
		`${titles.held} of ${titles.total} titles · ${borders.held} of ${borders.total} borders`,
	seeAll: "see all in Dex →",
	save: "Save look",
} as const;

const TRYING_ON_COLOR = "fuchsia";

const STAGE =
	"flex justify-center rounded-2xl bg-hatched-theme-fine px-4 py-6 ring-1 ring-inset ring-theme-faint";
const STAGE_CARD = "w-full max-w-md";
const TILES = "flex flex-wrap gap-4";
const TILE = "flex w-20 flex-col items-center gap-2 disabled:opacity-40";
const FRAME =
	"flex size-20 items-center justify-center rounded-lg bg-theme-raised ring-1 ring-inset ring-theme-faint";
const FRAME_PICKED = "ring-2 ring-theme";
const FRAME_MORE =
	"border border-dashed border-theme-faint bg-transparent ring-0 text-sm font-bold text-theme";
const FRAME_IMAGE = "max-h-full max-w-full";
const FRAME_EMPTY = "text-theme-muted";
const CAPTION = "w-full truncate text-center text-xs text-theme-muted";
const CAPTION_PICKED = "font-bold text-theme-soft";
const CHIPS = "flex flex-wrap items-center gap-2";
const CHIP =
	"flex h-9 items-center gap-2 rounded-md px-3 text-sm font-bold ring-1 ring-inset ring-theme-faint text-theme-muted enabled:hover:ring-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const CHIP_WORN = "bg-theme/10 ring-theme text-theme-soft";
const CHIP_INDEX =
	"flex size-5 items-center justify-center rounded-sm bg-theme text-xs text-theme-faint";
const ERROR = "text-sm text-cinnabar";

export type AppearanceProps = AppearanceView & {
	canSave: boolean;
	error?: string;
	onPickBorder: (borderId: string | null) => void;
	onToggleTitle: (titleId: string) => void;
	onMoreBorders: () => void;
	onMoreTitles: () => void;
	onSave: () => void;
};

const BorderTile = ({
	pick,
	onPick,
}: {
	pick: BorderPick;
	onPick: (borderId: string | null) => void;
}) => (
	<button
		type="button"
		className={TILE}
		aria-label={COPY.pickBorder(pick.name)}
		aria-pressed={pick.picked}
		onClick={() => onPick(pick.id)}
	>
		<span className={clsx(FRAME, pick.picked && FRAME_PICKED)}>
			{pick.image === undefined ? (
				<span aria-hidden className={FRAME_EMPTY}>
					{COPY.defaultFrame}
				</span>
			) : (
				<img src={pick.image} alt="" className={FRAME_IMAGE} />
			)}
		</span>
		<span className={clsx(CAPTION, pick.picked && CAPTION_PICKED)}>
			{pick.name}
		</span>
	</button>
);

const MoreBordersTile = ({
	tally,
	onPress,
}: {
	tally: Tally;
	onPress: () => void;
}) => (
	<button
		type="button"
		className={TILE}
		aria-label={COPY.moreBordersHint(tally)}
		onClick={onPress}
	>
		<span className={clsx(FRAME, FRAME_MORE)}>{COPY.moreBorders(tally)}</span>
		<span className={CAPTION}>{COPY.moreBordersCaption}</span>
	</button>
);

const TitleChip = ({
	pick,
	onToggle,
}: {
	pick: TitlePick;
	onToggle: (titleId: string) => void;
}) => (
	<button
		type="button"
		className={clsx(CHIP, pick.wornAt !== null && CHIP_WORN)}
		aria-pressed={pick.wornAt !== null}
		disabled={pick.blocked}
		onClick={() => onToggle(pick.id)}
	>
		{pick.wornAt === null ? null : (
			<span className={CHIP_INDEX}>{pick.wornAt}</span>
		)}
		{pick.name}
	</button>
);

export const Appearance = ({
	face,
	tryingOn,
	borders,
	borderTally,
	titles,
	titleTally,
	canSave,
	error,
	onPickBorder,
	onToggleTitle,
	onMoreBorders,
	onMoreTitles,
	onSave,
}: AppearanceProps) => (
	<Panel>
		<Panel.Header
			label={COPY.label}
			badge={
				tryingOn === undefined
					? undefined
					: { label: COPY.tryingOn(tryingOn), color: TRYING_ON_COLOR }
			}
		/>
		<Panel.Body>
			<div className={STAGE}>
				<div className={STAGE_CARD}>
					<ProfileCard {...face} />
				</div>
			</div>
		</Panel.Body>
		<Panel.Header label={COPY.border} meta={COPY.borderMeta(borderTally)} />
		<Panel.Body>
			<div className={TILES}>
				{borders.map((pick) => (
					<BorderTile
						key={pick.id ?? "default"}
						pick={pick}
						onPick={onPickBorder}
					/>
				))}
				{missingOf(borderTally) === 0 ? null : (
					<MoreBordersTile tally={borderTally} onPress={onMoreBorders} />
				)}
			</div>
		</Panel.Body>
		<Panel.Header label={COPY.titles} meta={COPY.titlesMeta} />
		<Panel.Body>
			<div className={CHIPS}>
				{titles.map((pick) => (
					<TitleChip key={pick.id} pick={pick} onToggle={onToggleTitle} />
				))}
				{missingOf(titleTally) === 0 ? null : (
					<Button
						size="sm"
						tone="bare"
						label={COPY.moreTitles(titleTally)}
						onPress={onMoreTitles}
					/>
				)}
			</div>
		</Panel.Body>
		<Panel.Footer
			trailing={
				<Button
					size="md"
					tone="action"
					label={COPY.save}
					onPress={onSave}
					disabled={!canSave}
				/>
			}
		>
			<Typography variant="hint">
				{COPY.tally(titleTally, borderTally)}
			</Typography>
			<Button
				size="sm"
				tone="bare"
				label={COPY.seeAll}
				onPress={onMoreBorders}
			/>
			{error === undefined ? null : <span className={ERROR}>{error}</span>}
		</Panel.Footer>
	</Panel>
);

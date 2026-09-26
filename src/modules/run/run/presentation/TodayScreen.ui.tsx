import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { IconName } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { ScreenFooter } from "~/ui/kanto-theme/ScreenFooter.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";
import { SwatchTrack } from "~/ui/kanto-theme/SwatchTrack.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	freshTitle: "Today’s climb",
	freshStanding:
		"one shared seed · everyone gets the same polls, in the same order",
	polls: "Today’s polls",
	community: "Community",
} as const;

const LADDER_ROW = "flex w-full flex-wrap items-center gap-3";
const NAMING = "flex min-w-0 flex-col";

const PRESS_SIZE = "md";
const TRACK_SIZE = "small";

export type TodayPress = { label: string; onPress?: () => void };

export type TodayRun = {
	/** Run state picks live-vs-over, so the caller states it (ADR-102). */
	title: string;
	/** "gate 4 of 12 · 296 KB stored" */
	standing: string;
	swatches: readonly SwatchFill[];
	/** "today’s 5 polls are ready", or the wait until the next segment drops. Read under the press. */
	pollsNote: string;
};

export type TodayScreenProps = {
	swatch: GateSwatch;
	run: TodayRun | null;
	/** Start, Resume, or the wait itself — a press with no handler is refused. */
	action: TodayPress;
	/**
	 * How many of today's polls are still unanswered, stood in the press's own
	 * mark. A spent day reads 0 there while the press reads the wait, so the
	 * two halves of "none left, and here is when more land" arrive together.
	 */
	pollsLeft?: number;
	polls: { detail: string; press: TodayPress };
	community: { detail: string; press: TodayPress };
	error?: string;
};

type TodayRowProps = {
	icon: IconName;
	label: string;
	detail: string;
	press: TodayPress;
};

const TodayRow = ({ icon, label, detail, press }: TodayRowProps) => (
	<Panel.Row
		trailing={
			<Button
				size={PRESS_SIZE}
				icon={icon}
				label={press.label}
				disabled={press.onPress === undefined}
				onPress={press.onPress}
			/>
		}
	>
		<span className={NAMING}>
			<Typography variant="subtitle" as="span">
				{label}
			</Typography>
			<Typography variant="hint" as="span">
				{detail}
			</Typography>
		</span>
	</Panel.Row>
);

/** The /run hub: what your climb is doing today, and the ways off it. */
export const TodayScreen = ({
	swatch,
	run,
	action,
	pollsLeft,
	polls,
	community,
	error,
}: TodayScreenProps) => (
	<Screen gate={swatch.theme} width="narrow" ground="bare">
		<Panel>
			<Panel.Header
				label={run?.title ?? COPY.freshTitle}
				meta={run?.standing ?? COPY.freshStanding}
			/>
			{run === null ? null : (
				<Panel.Body>
					<div className={LADDER_ROW}>
						<SwatchTrack swatches={run.swatches} size={TRACK_SIZE} />
					</div>
				</Panel.Body>
			)}
			<Panel.Rows>
				<TodayRow
					icon="clock"
					label={COPY.polls}
					detail={polls.detail}
					press={polls.press}
				/>
				<TodayRow
					icon="community"
					label={COPY.community}
					detail={community.detail}
					press={community.press}
				/>
			</Panel.Rows>
		</Panel>

		<ScreenFooter
			action={{
				label: action.label,
				swatch: { state: "current", swatch, count: pollsLeft },
				onPress: action.onPress,
			}}
			note={run?.pollsNote}
			refusal={error}
		/>
	</Screen>
);

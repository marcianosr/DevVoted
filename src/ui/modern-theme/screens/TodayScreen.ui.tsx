import type { ReactNode } from "react";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { Action } from "../Action.ui";
import { Glyph, type GlyphName } from "../Glyph.ui";
import { Screen } from "../Screen.ui";
import { Swatch } from "../Swatch.ui";
import { SwatchTrack, type SwatchTrackGate } from "../SwatchTrack.ui";
import { Text } from "../Text.ui";
import { plural } from "../format";

const FRAME = "mx-auto flex w-full max-w-3xl flex-col";
const LIST = "flex flex-col";

const ROW =
	"flex items-start gap-3 border-b border-edge px-5 py-4 last:border-b-0";
const MARK = "mt-0.5 shrink-0 text-zinc-500";
const CONTENT = "flex min-w-0 flex-1 flex-col gap-1.5";
const HEAD = "flex flex-wrap items-baseline gap-x-2";
const PRESS = "shrink-0";
const TRACK = "flex flex-wrap items-center gap-x-3 gap-y-1.5";

const DIVIDER = " · ";

const joined = (...parts: readonly (string | null)[]) =>
	parts.filter(Boolean).join(DIVIDER);

export type TodayRun = {
	readonly gateName: string;
	readonly theme?: SwatchTheme;
	readonly finish?: SwatchFinish;
	readonly gatesCleared: number;
	readonly gateCount: number;
	readonly days?: number;
	readonly storageKb: number;
	readonly gates: readonly SwatchTrackGate[];
	readonly live: boolean;
};

export type TodayPolls =
	| { readonly ready: true; readonly count: number }
	| { readonly ready: false; readonly opensIn: string };

export type TodayScreenProps = {
	run: TodayRun | null;
	polls: TodayPolls;
	onStart: () => void;
	onResume: () => void;
	dailyPoll: {
		readonly questions: number;
		readonly answeredBy?: number;
		readonly onAnswer: () => void;
	};
	community: { readonly runsLive?: number; readonly onOpen: () => void };
	starting?: boolean;
	error?: string;
};

type TodayRowProps = {
	leading: ReactNode;
	title: string;
	detail: string;
	press: ReactNode;
	children?: ReactNode;
};

const TodayRow = ({
	leading,
	title,
	detail,
	press,
	children,
}: TodayRowProps) => (
	<li className={ROW}>
		<span className={MARK}>{leading}</span>
		<span className={CONTENT}>
			<span className={HEAD}>
				<Text size="body">{title}</Text>
			</span>
			<Text as="p" size="meta" tone="muted">
				{detail}
			</Text>
			{children}
		</span>
		<span className={PRESS}>{press}</span>
	</li>
);

const IconRow = ({
	icon,
	...rest
}: { icon: GlyphName } & Omit<TodayRowProps, "leading">) => (
	<TodayRow leading={<Glyph name={icon} />} {...rest} />
);

const runTitle = (run: TodayRun) =>
	run.live
		? `Your run is on ${run.gateName}`
		: `Your last run reached ${run.gateName}`;

const dayClause = (run: TodayRun) => {
	if (run.days === undefined) return null;
	return run.live ? `day ${run.days}` : plural(run.days, "day");
};

const runDetail = (run: TodayRun) =>
	[
		`gate ${run.gatesCleared} of ${run.gateCount}`,
		dayClause(run),
		`${run.storageKb} KB ${run.live ? "stored" : "banked"}`,
	]
		.filter(Boolean)
		.join(DIVIDER);

const pollsNote = (polls: TodayPolls) =>
	polls.ready
		? `today's ${plural(polls.count, "poll")} ${polls.count === 1 ? "is" : "are"} ready`
		: polls.opensIn;

export const TodayScreen = ({
	run,
	polls,
	onStart,
	onResume,
	dailyPoll,
	community,
	starting = false,
	error,
}: TodayScreenProps) => {
	const runPress = (() => {
		if (run?.live !== true)
			return (
				<Action
					label="Start today’s climb →"
					emphasis="loud"
					disabled={starting}
					onUse={onStart}
				/>
			);

		return polls.ready ? (
			<Action label="Resume →" emphasis="loud" onUse={onResume} />
		) : (
			<Action label={polls.opensIn} disabled onUse={onResume} />
		);
	})();

	return (
		<Screen>
			<article className={FRAME}>
				<ul className={LIST}>
					{run === null ? (
						<TodayRow
							leading={<Swatch size="pip" state="locked" />}
							title="Today’s climb"
							detail={`one shared seed${DIVIDER}everyone gets the same polls, in the same order`}
							press={runPress}
						/>
					) : (
						<TodayRow
							leading={
								<Swatch
									size="pip"
									state={run.live ? "current" : "earned"}
									theme={run.theme}
									finish={run.finish}
								/>
							}
							title={runTitle(run)}
							detail={runDetail(run)}
							press={runPress}
						>
							<span className={TRACK}>
								<SwatchTrack
									gates={run.gates}
									cleared={run.gatesCleared}
									atCleared={run.live ? "current" : "locked"}
									counting="none"
								/>
								<Text size="meta" tone="theme">
									{pollsNote(polls)}
								</Text>
							</span>
						</TodayRow>
					)}

					<IconRow
						icon="calendar"
						title="Today’s polls"
						detail={joined(
							`${plural(dailyPoll.questions, "question")}, shared by everyone`,
							dailyPoll.answeredBy === undefined
								? null
								: `${dailyPoll.answeredBy} have answered`
						)}
						press={<Action label="Answer it" onUse={dailyPoll.onAnswer} />}
					/>

					<IconRow
						icon="players"
						title="Community"
						detail={
							community.runsLive === undefined
								? "see how everyone else is doing today"
								: `${plural(community.runsLive, "run")} live`
						}
						press={<Action label="Open board" onUse={community.onOpen} />}
					/>
				</ul>

				{error === undefined ? null : (
					<Text as="p" size="meta" tone="cinnabar" className="px-5 pb-4">
						{error}
					</Text>
				)}
			</article>
		</Screen>
	);
};

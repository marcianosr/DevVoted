import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button } from "../Button.ui";
import { CalendarIcon } from "../CalendarIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { Panel } from "../Panel.ui";
import { PlayersIcon } from "../PlayersIcon.ui";
import { Swatch } from "../Swatch.ui";
import { SwatchTrack, type TrackSwatch } from "../SwatchTrack.ui";
import { Text } from "../Text.ui";

const LIST = "flex flex-col divide-y divide-edge";
const ROW = "flex items-start gap-3 py-3 @max-md:flex-wrap";
const MARK = "pt-1 text-zinc-500";
const BODY = "flex min-w-0 flex-1 flex-col gap-1";
const HEADLINE = "flex items-start gap-3";
const TITLE = "min-w-0 flex-1 font-bold";
const FOOTER =
	"flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-edge pt-3";
const STAT = "flex flex-col";
const RUN_NOTE = "flex flex-wrap items-center gap-x-4 gap-y-1";

export type HomeStat = {
	label: string;
	value: string;
};

export type HomeScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	run: {
		swatch?: SwatchTheme;
		title: string;
		detail: string;
		swatches: readonly TrackSwatch[];
		note: string;
		resumeLabel: string;
		onResume?: () => void;
	};
	today: {
		title: string;
		detail: string;
		playLabel: string;
		onPlay?: () => void;
	};
	community: {
		title: string;
		detail: string;
		mapLabel: string;
		onMap?: () => void;
	};
	collection: {
		swatches: readonly TrackSwatch[];
		stats: readonly HomeStat[];
		dexLabel: string;
		onDex?: () => void;
	};
};

const HomeRow = ({
	mark,
	title,
	detail,
	press,
	children,
}: {
	mark: ReactNode;
	title: string;
	detail: string;
	press: ReactNode;
	children?: ReactNode;
}) => (
	<div className={ROW}>
		<span className={MARK}>{mark}</span>
		<span className={BODY}>
			<span className={HEADLINE}>
				<Text className={TITLE}>{title}</Text>
				{press}
			</span>
			<Text as="p" tone="muted" size="caption">
				{detail}
			</Text>
			{children}
		</span>
	</div>
);

export const HomeScreen = ({
	header,
	theme,
	run,
	today,
	community,
	collection,
}: HomeScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		<div className={LIST}>
			<HomeRow
				mark={<Swatch theme={run.swatch} state="current" />}
				title={run.title}
				detail={run.detail}
				press={
					<Button
						label={run.resumeLabel}
						variant="primary"
						onUse={run.onResume}
					/>
				}
			>
				<span className={RUN_NOTE}>
					<SwatchTrack swatches={run.swatches} />
					<Text tone="theme" size="caption">
						{run.note}
					</Text>
				</span>
			</HomeRow>

			<HomeRow
				mark={<CalendarIcon />}
				title={today.title}
				detail={today.detail}
				press={<Button label={today.playLabel} onUse={today.onPlay} />}
			/>

			<HomeRow
				mark={<PlayersIcon />}
				title={community.title}
				detail={community.detail}
				press={<Button label={community.mapLabel} onUse={community.onMap} />}
			/>
		</div>

		<footer className={FOOTER}>
			<SwatchTrack swatches={collection.swatches} />
			{collection.stats.map((stat) => (
				<span key={stat.label} className={STAT}>
					<Text>{stat.value}</Text>
					<Text tone="faint" size="caption">
						{stat.label}
					</Text>
				</span>
			))}
			<Button
				label={collection.dexLabel}
				className="ml-auto"
				onUse={collection.onDex}
			/>
		</footer>
	</Panel>
);

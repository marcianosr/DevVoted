import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { badgeNumbers } from "../Badge.ui";
import { Slots } from "../Slots.ui";
import { Version } from "../Version.ui";
import { Button } from "../Button.ui";
import { Panel } from "../Panel.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SplitBar, type SplitBarProps } from "../SplitBar.ui";
import { SwatchTrack, type TrackSwatch } from "../SwatchTrack.ui";
import { Text } from "../Text.ui";

const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

export type GameOverScreenProps = {
	theme?: SwatchTheme;
	earned: {
		swatches: readonly TrackSwatch[];
		title: string;
		subtitle: string;
	};
	fell: {
		swatches: readonly TrackSwatch[];
		note: string;
	};
	archive?: SplitBarProps & { note: string };
	lostBy: {
		meta: string;
		rows: readonly { name: string; detail: string; tag?: string }[];
	};
	finalBuild: {
		meta: string;
		rows: readonly {
			name: string;
			detail: string;
			slots: number;
			version: number;
		}[];
		note: string;
	};
	shareLabel: string;
	onShare?: () => void;
	newRunLabel: string;
	onNewRun?: () => void;
};

export const GameOverScreen = ({
	theme,
	earned,
	fell,
	archive,
	lostBy,
	finalBuild,
	shareLabel,
	onShare,
	newRunLabel,
	onNewRun,
}: GameOverScreenProps) => (
	<Panel theme={theme}>
		<header className="flex items-center gap-4 @max-md:flex-col @max-md:items-start @max-md:gap-2">
			<SwatchTrack swatches={earned.swatches} size="tile" />
			<div className="flex flex-col gap-0.5">
				<Text size="score" className="font-bold">
					{earned.title}
				</Text>
				<Text tone="muted" className="inline-flex flex-wrap items-center gap-1">
					{badgeNumbers(earned.subtitle)}
				</Text>
			</div>
		</header>

		<div className="flex flex-wrap items-center gap-4">
			<SwatchTrack swatches={fell.swatches} />
			<Text tone="muted">{fell.note}</Text>
		</div>

		{archive === undefined ? null : (
			<Section label="Archive" className="border-t border-edge pt-2">
				<div className="flex flex-col gap-2">
					<SplitBar kept={archive.kept} lost={archive.lost} />
					<Text tone="muted">{archive.note}</Text>
				</div>
			</Section>
		)}

		<Section label="Where you lost it" meta={lostBy.meta} divided>
			{lostBy.rows.map((row) => (
				<Row
					key={row.name}
					name={row.name}
					detail={row.detail}
					trailing={
						row.tag === undefined ? undefined : (
							<Text tone="muted">{row.tag}</Text>
						)
					}
				/>
			))}
		</Section>

		<Section label="Final build" meta={finalBuild.meta} divided>
			{finalBuild.rows.map((row) => (
				<Row
					key={row.name}
					name={row.name}
					tag={
						<>
							<Version label={`v${row.version}`} />
							<Slots slots={row.slots} />
						</>
					}
					detail={row.detail}
				/>
			))}
			<Text as="p" tone="muted" className="py-2.5">
				{finalBuild.note}
			</Text>
		</Section>

		<footer className={FOOTER}>
			<Button
				label={shareLabel}
				disabled={onShare === undefined}
				onUse={onShare}
			/>
			<Button
				label={newRunLabel}
				variant="primary"
				disabled={onNewRun === undefined}
				className="@max-md:flex-1"
				onUse={onNewRun}
			/>
		</footer>
	</Panel>
);

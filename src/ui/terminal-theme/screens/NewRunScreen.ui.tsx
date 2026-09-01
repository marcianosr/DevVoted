import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button } from "../Button.ui";
import { BuyLine, type BuyLineProps } from "../BuyLine.ui";
import { Callout } from "../Callout.ui";
import { Dot } from "../Dot.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { IconButton } from "../IconButton.ui";
import { Panel } from "../Panel.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { Slots } from "../Slots.ui";
import { Version } from "../Version.ui";

const FOOTER = "flex items-center justify-end border-t border-edge pt-4";
const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const SLOT_ICON = "+";
const DEPLOY_ICON = "+";
const REMOVE_ICON = "✕";

const segmentsOf = (
	rows: readonly { family: ConfigFamily; slots: number }[]
): readonly SlotSegment[] =>
	rows.map((row) => ({ family: row.family, slots: row.slots }));

export type NewRunBuildRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	version?: string;
	slots: number;
	remove?: {
		label: string;
		onRemove?: () => void;
	};
};

export type DealtRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	deployLabel?: string;
	onDeploy?: () => void;
	locked?: boolean;
};

export type NewRunScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	gitTag?: {
		title: string;
		detail: string;
	};
	storage: {
		meta: string;
		slots: number;
	};
	build: {
		meta: string;
		rows: readonly NewRunBuildRow[];
		buySlot?: BuyLineProps;
	};
	dealt: {
		meta: string;
		rows: readonly DealtRow[];
	};
	startLabel: string;
	onStart?: () => void;
};

export const NewRunScreen = ({
	header,
	theme,
	gitTag,
	storage,
	build,
	dealt,
	startLabel,
	onStart,
}: NewRunScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		{gitTag === undefined ? null : (
			<Callout
				mark={<GitTagIcon />}
				title={gitTag.title}
				detail={gitTag.detail}
			/>
		)}

		<Section label="Build storage" meta={storage.meta}>
			<SlotTrack
				segments={segmentsOf(build.rows)}
				slots={storage.slots}
				numbered
			/>
		</Section>

		<div className={COLUMNS}>
			<div className="@container">
				<Section label="Build" meta={build.meta}>
					<div className="divide-y divide-edge">
						{build.rows.map((row) => (
							<Row
								key={row.name}
								leading={<Dot variant="on" />}
								name={row.name}
								tag={
									<>
										{row.version === undefined ? null : (
											<Version label={row.version} />
										)}
										<Slots family={row.family} slots={row.slots} />
									</>
								}
								detail={row.detail}
								trailing={
									<>
										{row.remove === undefined ? null : (
											<IconButton
												icon={REMOVE_ICON}
												label={row.remove.label}
												tone="cinnabar"
												iconOnly
												onUse={row.remove.onRemove}
											/>
										)}
									</>
								}
							/>
						))}
					</div>
					{build.buySlot === undefined ? null : (
						<BuyLine icon={SLOT_ICON} {...build.buySlot} />
					)}
				</Section>
			</div>

			<div className="@container">
				<Section label="Dealt" meta={dealt.meta} divided>
					{dealt.rows.map((row) => (
						<Row
							key={row.name}
							name={row.name}
							tag={<Slots family={row.family} slots={row.slots} />}
							detail={row.detail}
							dimmed={row.locked}
							trailing={
								<>
									{row.deployLabel === undefined ? null : (
										<IconButton
											icon={DEPLOY_ICON}
											label={row.deployLabel}
											iconOnly
											onUse={row.onDeploy}
										/>
									)}
								</>
							}
						/>
					))}
				</Section>
			</div>
		</div>

		<footer className={FOOTER}>
			<Button
				label={startLabel}
				variant="primary"
				className="@max-md:w-full"
				onUse={onStart}
			/>
		</footer>
	</Panel>
);

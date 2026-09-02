import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "../Badge.ui";
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
import { Text } from "../Text.ui";
import { Version } from "../Version.ui";

const FOOTER = "flex items-center justify-end border-t border-edge pt-4";
const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const SLOT_ICON = "+";
const CASH_ICON = "−";
const DEPLOY_ICON = "+";
const REMOVE_ICON = "✕";

const COMBOS = "grid gap-2 pt-1 pb-2 @max-md:grid-cols-1 sm:grid-cols-3";
const COMBO_CARD =
	"flex flex-col gap-2 rounded-lg border border-edge-strong px-3 py-2.5";
const COMBO_HEAD = "flex flex-wrap items-center gap-2";

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

export type StartCombo = {
	id: string;
	name: string;
	blurb: string;
	recommended?: boolean;
	takeLabel: string;
	onTake?: () => void;
};

export type NewRunScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	gitTag?: {
		title: string;
		detail: string;
	};
	combos?: {
		meta: string;
		rows: readonly StartCombo[];
	};
	storage: {
		meta: string;
		slots: number;
	};
	build: {
		meta: string;
		rows: readonly NewRunBuildRow[];
		buySlot?: BuyLineProps;
		cashSlot?: BuyLineProps;
	};
	dealt: {
		meta: string;
		rows: readonly DealtRow[];
	};
	startLabel: string;
	onStart?: () => void;
};

const ComboCard = ({ combo }: { combo: StartCombo }) => (
	<div className={COMBO_CARD}>
		<span className={COMBO_HEAD}>
			<Text className="font-bold">{combo.name}</Text>
			{combo.recommended === true ? (
				<Badge tone="celadon">recommended</Badge>
			) : null}
		</span>
		<Text as="p" tone="muted" size="caption" className="flex-1">
			{combo.blurb}
		</Text>
		<Button
			label={combo.takeLabel}
			className="mt-auto w-full"
			onUse={combo.onTake}
		/>
	</div>
);

export const NewRunScreen = ({
	header,
	theme,
	gitTag,
	combos,
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

		{combos === undefined ? null : (
			<Section label="Starter stacks" meta={combos.meta}>
				<div className={COMBOS}>
					{combos.rows.map((combo) => (
						<ComboCard key={combo.id} combo={combo} />
					))}
				</div>
			</Section>
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
					{build.cashSlot === undefined ? null : (
						<BuyLine icon={CASH_ICON} {...build.cashSlot} />
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
											disabled={row.locked}
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
				disabled={onStart === undefined}
				className="@max-md:w-full"
				onUse={onStart}
			/>
		</footer>
	</Panel>
);

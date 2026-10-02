import type { ReactNode } from "react";

import { Action, type ActionProps } from "./Action.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Figures } from "./Figures.ui";
import type { IconName } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import { Pick, type PickProps } from "./Pick.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";
import { Typography } from "./Typography.ui";

const CHOICE = "flex w-full flex-col gap-4";
const TALLY = "flex w-full flex-wrap items-baseline gap-x-4 gap-y-1";
const OWED = "text-display font-extrabold tabular-nums text-theme";
const TALLY_NOTE = "ml-auto shrink-0";
const LEGEND = "flex w-full flex-wrap items-center gap-x-4 gap-y-1";
const LEGEND_ITEM = "flex items-center gap-2";
const LEGEND_DOT = "badge-theme size-2.5 shrink-0 rounded-[3px]";
const SECTION = "flex w-full flex-col gap-2";
const SECTION_HEAD = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const SECTION_NOTE = "shrink-0 sm:ml-auto";
const ROWS = "flex w-full flex-col gap-2";
const BRIBE_ROW =
	"flex w-full items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-inset ring-theme-faint";
const BRIBE_NAMING = "flex min-w-0 flex-1 flex-col gap-0.5";
const BRIBE_NAME = "text-sm font-extrabold text-theme-faint";
const REFUSAL_ROW = "flex w-full flex-wrap items-center gap-4";
const REFUSAL_PROSE = "min-w-0 flex-1";
const REFUSAL_TITLE = "font-extrabold text-theme-faint";

const COST_COLOR: KantoColor = "cinnabar";
const REFUSAL_TONE = "danger";
const ACTION_SIZE = "sm";

export type GatePeelSource = {
	label: string;
	slots: number;
	color: KantoColor;
};

export type GatePeelBribe = {
	title: string;
	balance: string;
	label: string;
	note: string;
	cost: string;
	pick: PickProps;
};

export type GateDrop = {
	title: string;
	note: string;
	configs: readonly ConfigChipProps[];
};

export type GateCatch = {
	title: string;
	note: string;
	config: ConfigChipProps;
};

export type GatePeelArm = {
	title: string;
	note: string;
	owed: string;
	owedColor: KantoColor;
	tally: string;
	bill: number;
	sources: readonly GatePeelSource[];
	catch?: GateCatch;
	bribe: GatePeelBribe;
	drop: GateDrop;
};

export type GateRefusalAction = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

export type GateRefusalArm = {
	title: string;
	price: string;
	note: string;
	action: GateRefusalAction;
};

export type GateChoiceProps = {
	peel: GatePeelArm;
	refusal: GateRefusalArm;
	retry?: ActionProps;
};

const fillsOf = (
	sources: readonly GatePeelSource[]
): readonly SlotTrackFill[] =>
	sources.map(({ label, slots, color }) => ({ name: label, slots, color }));

const Legend = ({ sources }: { sources: readonly GatePeelSource[] }) => (
	<div className={LEGEND}>
		{sources.map((source) => (
			<span key={source.label} className={LEGEND_ITEM}>
				<span
					aria-hidden
					data-screen-theme={source.color}
					className={LEGEND_DOT}
				/>
				<Typography variant="hint" as="span">
					{source.label}
				</Typography>
			</span>
		))}
	</div>
);

type SectionProps = { title: string; note: string; children: ReactNode };

const Section = ({ title, note, children }: SectionProps) => (
	<div className={SECTION}>
		<div className={SECTION_HEAD}>
			<Typography variant="label" as="h3">
				{title}
			</Typography>
			<span className={SECTION_NOTE}>
				<Typography variant="hint" as="span">
					<Figures text={note} />
				</Typography>
			</span>
		</div>
		{children}
	</div>
);

const BribeRow = ({ label, note, cost, pick }: GatePeelBribe) => (
	<div className={BRIBE_ROW}>
		<Pick {...pick} />
		<span className={BRIBE_NAMING}>
			<span className={BRIBE_NAME}>{label}</span>
			<Typography variant="hint" as="span">
				<Figures text={note} />
			</Typography>
		</span>
		<Badge color={COST_COLOR}>{cost}</Badge>
	</div>
);

type PeelArmProps = GatePeelArm & { retry?: ActionProps };

const PeelArm = ({
	title,
	note,
	owed,
	owedColor,
	tally,
	bill,
	sources,
	catch: caught,
	bribe,
	drop,
	retry,
}: PeelArmProps) => (
	<Panel>
		<Panel.Header label={title} meta={<Figures text={note} />} />

		<Panel.Body>
			<div className={TALLY}>
				<span data-screen-theme={owedColor} className={OWED}>
					{owed}
				</span>
				<span className={TALLY_NOTE}>
					<Typography variant="hint" as="span">
						<Figures text={tally} />
					</Typography>
				</span>
			</div>

			<SlotTrack fills={fillsOf(sources)} capacity={bill} caption={false} />
			{sources.length === 0 ? null : <Legend sources={sources} />}

			{caught === undefined ? null : (
				<Section title={caught.title} note={caught.note}>
					<ConfigChip {...caught.config} />
				</Section>
			)}

			<Section title={bribe.title} note={bribe.balance}>
				<BribeRow {...bribe} />
			</Section>

			<Section title={drop.title} note={drop.note}>
				<div className={ROWS}>
					{drop.configs.map((config, index) => (
						<ConfigChip key={index} {...config} />
					))}
				</div>
			</Section>

			{retry === undefined ? null : <Action {...retry} />}
		</Panel.Body>
	</Panel>
);

const RefusalArm = ({ title, price, note, action }: GateRefusalArm) => (
	<Panel>
		<Panel.Body>
			<div className={REFUSAL_ROW}>
				<span className={REFUSAL_PROSE}>
					<Typography variant="hint" as="span">
						<span className={REFUSAL_TITLE}>{title}</span>{" "}
						<Figures text={`${note} ${price}`} />
					</Typography>
				</span>
				<Button
					size={ACTION_SIZE}
					tone={REFUSAL_TONE}
					label={action.label}
					icon={action.icon}
					disabled={action.onPress === undefined}
					onPress={action.onPress}
				/>
			</div>
		</Panel.Body>
	</Panel>
);

export const GateChoice = ({ peel, refusal, retry }: GateChoiceProps) => (
	<section className={CHOICE}>
		<PeelArm {...peel} retry={retry} />
		<RefusalArm {...refusal} />
	</section>
);

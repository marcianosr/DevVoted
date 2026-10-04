import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Action, type ActionProps } from "./Action.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Figures } from "./Figures.ui";
import type { IconName } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import { Pick, type PickProps } from "./Pick.ui";
import { Prose } from "./Prose.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";
import { Typography } from "./Typography.ui";

const CHOICE = "flex w-full flex-col gap-4";
const HEADING = "flex w-full flex-col gap-1";
const OWED = "text-theme";
const LEGEND = "flex w-full flex-wrap items-center gap-x-4 gap-y-1";
const LEGEND_ITEM = "flex items-center gap-2";
const LEGEND_DOT = "badge-theme size-2.5 shrink-0 rounded-[3px]";
const SECTION = "flex w-full flex-col gap-2";
const SECTION_HEAD = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const SECTION_NOTE = "min-w-0 sm:ml-auto";
const ROWS = "flex w-full flex-col gap-2";
const OPTION =
	"flex w-full items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-inset";
const OPTION_RESTING = "ring-theme-faint";
const OPTION_PICKED = "ring-theme-soft";
const OPTION_LOCKED = "opacity-40";
const OPTION_NAME = "min-w-0 flex-1 font-extrabold text-theme";
const OPTION_BADGES =
	"flex shrink-0 flex-wrap items-center justify-end gap-1.5";
const BRIBE_ROW =
	"flex w-full items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-inset ring-theme-faint";
const BRIBE_NAMING = "flex min-w-0 flex-1 flex-col gap-0.5";
const BRIBE_NAME = "text-sm font-extrabold text-theme-faint";

const COST_COLOR: KantoColor = "cinnabar";
const OWED_COLOR: KantoColor = "saffron";

const COPY = {
	pay: "Pay",
	toRetry: "to retry",
	paid: "The peel is paid",
} as const;
const REFUSAL_TONE = "danger";
const REFUSAL_SIZE = "sm";

export type GatePeelBadge = { label: string; color: KantoColor };

export type GatePeelOption = {
	name: string;
	badges: readonly GatePeelBadge[];
	pick: PickProps;
};

export type GatePeelRadio = {
	kind: "radio";
	label: string;
	rows: readonly GatePeelOption[];
	loss?: string;
};

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

export type GatePeelMix = {
	kind: "mix";
	bill: number;
	sources: readonly GatePeelSource[];
	bribe: GatePeelBribe;
	drop: GateDrop;
};

export type GateCatch = {
	title: string;
	note: string;
	config: ConfigChipProps;
};

export type GateRefusalAction = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

export type GateRefusal = {
	note: string;
	action: GateRefusalAction;
};

export type GateChoiceProps = {
	meta: string;
	owed?: string;
	catch?: GateCatch;
	options?: GatePeelRadio | GatePeelMix;
	refusal: GateRefusal;
	press?: ActionProps;
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

const Option = ({ name, badges, pick }: GatePeelOption) => (
	<div
		className={clsx(
			OPTION,
			pick.checked ? OPTION_PICKED : OPTION_RESTING,
			pick.disabled === true && OPTION_LOCKED
		)}
	>
		<Pick {...pick} shape="radio" />
		<span className={OPTION_NAME}>{name}</span>
		<span className={OPTION_BADGES}>
			{badges.map((badge) => (
				<Badge key={badge.label} color={badge.color}>
					{badge.label}
				</Badge>
			))}
		</span>
	</div>
);

const Radio = ({ label, rows, loss }: GatePeelRadio) => (
	<>
		<div role="radiogroup" aria-label={label} className={ROWS}>
			{rows.map((row) => (
				<Option key={row.name} {...row} />
			))}
		</div>
		{loss === undefined ? null : <Prose text={loss} />}
	</>
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

const Mix = ({ bill, sources, bribe, drop }: GatePeelMix) => (
	<>
		<SlotTrack fills={fillsOf(sources)} capacity={bill} caption={false} />
		{sources.length === 0 ? null : <Legend sources={sources} />}

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
	</>
);

const Owed = ({ owed }: { owed?: string }) => (
	<Typography variant="headline" as="h3">
		{owed === undefined ? (
			COPY.paid
		) : (
			<>
				{COPY.pay}{" "}
				<span data-screen-theme={OWED_COLOR} className={OWED}>
					{owed}
				</span>{" "}
				{COPY.toRetry}
			</>
		)}
	</Typography>
);

const Options = ({ options }: { options: GatePeelRadio | GatePeelMix }) =>
	options.kind === "radio" ? <Radio {...options} /> : <Mix {...options} />;

const Refusal = ({ note, action }: GateRefusal) => (
	<Panel.Footer
		trailing={
			<Button
				size={REFUSAL_SIZE}
				tone={REFUSAL_TONE}
				label={action.label}
				icon={action.icon}
				disabled={action.onPress === undefined}
				onPress={action.onPress}
			/>
		}
	>
		<Typography variant="hint" as="span">
			<Figures text={note} />
		</Typography>
	</Panel.Footer>
);

export const GateChoice = ({
	meta,
	owed,
	catch: caught,
	options,
	refusal,
	press,
}: GateChoiceProps) => (
	<section className={CHOICE}>
		<Panel>
			<Panel.Body>
				<div className={HEADING}>
					<Typography variant="hint" as="span">
						<Figures text={meta} />
					</Typography>
					<Owed owed={owed} />
				</div>

				{caught === undefined ? null : (
					<Section title={caught.title} note={caught.note}>
						<ConfigChip {...caught.config} />
					</Section>
				)}

				{press === undefined ? null : <Action {...press} />}

				{options === undefined ? null : <Options options={options} />}
			</Panel.Body>
			<Refusal {...refusal} />
		</Panel>
	</section>
);

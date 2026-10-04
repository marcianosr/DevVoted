import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone } from "./Button.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import {
	type BuildGrowth,
	PayNowRow,
	ScaleArrow,
	ScaleColumn,
	ScaleLead,
	ScaleLedger,
	ScaleRow,
	UpkeepRow,
	WeightRow,
} from "./InstallScale.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";
import { Version, versionAccentOf, type VersionState } from "./Version.ui";

const WIDTH = "w-fit max-w-112";
const HEAD = "flex w-full items-center gap-3";
const CLOSE = "ml-auto";
const PAIR = "flex w-full items-stretch gap-3";
const CARD =
	"flex flex-col gap-2 rounded-lg border border-theme-soft p-3 text-left";
const HELD_CARD = "shrink-0";
const OFFER_CARD = "min-w-0 flex-1";
const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const FIGURES = "flex items-center gap-2";
const ARROW = "shrink-0 self-center text-theme-muted";
const CHANGES = "flex flex-col gap-0.5 text-xs text-theme-muted";
const CHANGED_TO = "font-bold text-theme-faint";

const HELD_LABEL = "installed";
const OFFER_LABEL = "next";
const MAXED_LABEL = "fully upgraded";
const NO_OFFER_LABEL = "nothing on offer";
const ARROW_GLYPH = "→";
const SEPARATOR = "·";
const BUY_LABEL = "Buy";
const CLOSE_GLYPH = "×";
const CLOSE_LABEL = "Close";
const CLOSE_TONE: ButtonTone = "ambient";

const SCALE_COPY = {
	lead: (version: number) => `Upgrade to v${version}.`,
	grows: "Upgrading grows your build.",
	raises: "Upgrading raises what the build costs a gate.",
	version: "version",
	effect: "effect",
} as const;

const GAIN: KantoColor = "viridian";
const REFUSAL: KantoColor = "cinnabar";

export type UpgradeRung = {
	version: number;
	effect: string;
	state: VersionState;
	price?: string;
	held?: boolean;
	disabled?: boolean;
};

export type UpgradeChange = {
	from: string;
	to: string;
};

export type UpgradesProps = {
	name: string;
	description: string;
	rungs: readonly UpgradeRung[];
	changes?: readonly UpgradeChange[];
	scale?: BuildGrowth;
	refusal?: string;
	onBuy?: (version: number) => void;
	onClose?: () => void;
};

export const offeredRungOf = (rungs: readonly UpgradeRung[]) =>
	rungs.find((rung) => rung.state === "offered");

export const heldRungOf = (rungs: readonly UpgradeRung[]) =>
	rungs.find((rung) => rung.held === true);

const noOfferLabelOf = (rungs: readonly UpgradeRung[]) =>
	rungs.every((rung) => rung.state === "owned") ? MAXED_LABEL : NO_OFFER_LABEL;

const buyLabelOf = ({ version, price }: UpgradeRung) =>
	price === undefined
		? `${BUY_LABEL} v${version}`
		: `${BUY_LABEL} v${version} ${SEPARATOR} ${price}`;

const pennantStateOf = ({ state, disabled }: UpgradeRung): VersionState =>
	state === "offered" && disabled === true ? "unaffordable" : state;

export const ChangeLines = ({
	changes,
}: {
	changes: readonly UpgradeChange[];
}) =>
	changes.length === 0 ? null : (
		<span className={CHANGES}>
			{changes.map(({ from, to }) => (
				<span key={`${from}${to}`}>
					{from} {ARROW_GLYPH} <span className={CHANGED_TO}>{to}</span>
				</span>
			))}
		</span>
	);

const CardBody = ({
	label,
	rung,
	changes = [],
}: {
	label: string;
	rung: UpgradeRung;
	changes?: readonly UpgradeChange[];
}) => (
	<>
		<Typography variant="label">{label}</Typography>
		<span className={FIGURES}>
			<Version version={rung.version} state={pennantStateOf(rung)} />
			<Badge color={GAIN}>{rung.effect}</Badge>
			{rung.price === undefined ? null : <Badge>{rung.price}</Badge>}
		</span>
		<ChangeLines changes={changes} />
	</>
);

const Offer = ({
	rung,
	changes,
	onBuy,
}: {
	rung: UpgradeRung;
	changes?: readonly UpgradeChange[];
	onBuy?: (version: number) => void;
}) => {
	const accent = versionAccentOf(pennantStateOf(rung));

	if (onBuy === undefined) {
		return (
			<div data-screen-theme={accent} className={clsx(CARD, OFFER_CARD)}>
				<CardBody label={OFFER_LABEL} rung={rung} changes={changes} />
			</div>
		);
	}

	return (
		<button
			type="button"
			data-screen-theme={accent}
			aria-label={buyLabelOf(rung)}
			disabled={rung.disabled}
			onClick={() => onBuy(rung.version)}
			className={clsx(CARD, OFFER_CARD, PRESSABLE)}
		>
			<CardBody label={OFFER_LABEL} rung={rung} changes={changes} />
		</button>
	);
};

export const Upgrades = ({
	name,
	description,
	rungs,
	changes,
	refusal,
	onBuy,
	onClose,
}: UpgradesProps) => {
	const held = heldRungOf(rungs);
	const offered = offeredRungOf(rungs);

	return (
		<Panel className={WIDTH}>
			<Panel.Body>
				<span className={HEAD}>
					<Typography variant="title">{name}</Typography>
					{onClose === undefined ? null : (
						<span className={CLOSE}>
							<Button
								tone={CLOSE_TONE}
								glyph={CLOSE_GLYPH}
								label={`${CLOSE_LABEL} ${name}`}
								onPress={onClose}
							/>
						</span>
					)}
				</span>
				<Typography variant="caption" as="p">
					<Figures text={description} />
				</Typography>

				<div className={PAIR}>
					{held === undefined ? null : (
						<div className={clsx(CARD, HELD_CARD)}>
							<CardBody label={HELD_LABEL} rung={held} />
						</div>
					)}
					{offered === undefined ? (
						<Typography variant="hint" as="span">
							{noOfferLabelOf(rungs)}
						</Typography>
					) : (
						<>
							<span aria-hidden className={ARROW}>
								{ARROW_GLYPH}
							</span>
							<Offer rung={offered} changes={changes} onBuy={onBuy} />
						</>
					)}
				</div>

				{refusal === undefined ? null : (
					<span data-screen-theme={REFUSAL}>
						<Typography variant="hint">{refusal}</Typography>
					</span>
				)}
			</Panel.Body>
		</Panel>
	);
};

export type UpgradeScaleProps = {
	from: number;
	to: number;
	changes?: readonly UpgradeChange[];
	price?: string;
	growth?: BuildGrowth;
	refusal?: string;
};

const growthLeadOf = (growth?: BuildGrowth) => {
	if (growth === undefined) return undefined;
	return growth.from === growth.to ? SCALE_COPY.raises : SCALE_COPY.grows;
};

export const UpgradeScale = ({
	from,
	to,
	changes = [],
	price,
	growth,
	refusal,
}: UpgradeScaleProps) => (
	<ScaleColumn>
		<ScaleLead bold={SCALE_COPY.lead(to)} rest={growthLeadOf(growth)} />
		<ScaleLedger>
			<ScaleRow label={SCALE_COPY.version}>
				<Version version={from} />
				<ScaleArrow />
				<Version version={to} state="offered" />
			</ScaleRow>
			{changes.map((change) => (
				<ScaleRow key={`${change.from}${change.to}`} label={SCALE_COPY.effect}>
					<Badge>{change.from}</Badge>
					<ScaleArrow />
					<Badge color={GAIN}>{change.to}</Badge>
				</ScaleRow>
			))}
			{growth === undefined || growth.from === growth.to ? null : (
				<WeightRow from={growth.from} to={growth.to} />
			)}
			{price === undefined ? null : <PayNowRow price={price} />}
			{growth === undefined ? null : <UpkeepRow perGateKb={growth.perGateKb} />}
		</ScaleLedger>
		{refusal === undefined ? null : (
			<span data-screen-theme={REFUSAL}>
				<Typography variant="hint">{refusal}</Typography>
			</span>
		)}
	</ScaleColumn>
);

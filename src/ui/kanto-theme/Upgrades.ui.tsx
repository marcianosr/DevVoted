import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone } from "./Button.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
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

export type UpgradesProps = {
	name: string;
	description: string;
	rungs: readonly UpgradeRung[];
	/** Why the offered rung will not go through, in the player's own terms. */
	refusal?: string;
	onBuy?: (version: number) => void;
	onClose?: () => void;
};

export const offeredRungOf = (rungs: readonly UpgradeRung[]) =>
	rungs.find((rung) => rung.state === "offered");

const heldRungOf = (rungs: readonly UpgradeRung[]) =>
	rungs.find((rung) => rung.held === true);

const noOfferLabelOf = (rungs: readonly UpgradeRung[]) =>
	rungs.every((rung) => rung.state === "owned") ? MAXED_LABEL : NO_OFFER_LABEL;

const buyLabelOf = ({ version, price }: UpgradeRung) =>
	price === undefined
		? `${BUY_LABEL} v${version}`
		: `${BUY_LABEL} v${version} ${SEPARATOR} ${price}`;

const pennantStateOf = ({ state, disabled }: UpgradeRung): VersionState =>
	state === "offered" && disabled === true ? "unaffordable" : state;

const CardBody = ({ label, rung }: { label: string; rung: UpgradeRung }) => (
	<>
		<Typography variant="label">{label}</Typography>
		<span className={FIGURES}>
			<Version version={rung.version} state={pennantStateOf(rung)} />
			<Badge color={GAIN}>{rung.effect}</Badge>
			{rung.price === undefined ? null : <Badge>{rung.price}</Badge>}
		</span>
	</>
);

const Offer = ({
	rung,
	onBuy,
}: {
	rung: UpgradeRung;
	onBuy?: (version: number) => void;
}) => {
	const accent = versionAccentOf(pennantStateOf(rung));

	if (onBuy === undefined) {
		return (
			<div data-screen-theme={accent} className={clsx(CARD, OFFER_CARD)}>
				<CardBody label={OFFER_LABEL} rung={rung} />
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
			<CardBody label={OFFER_LABEL} rung={rung} />
		</button>
	);
};

export const Upgrades = ({
	name,
	description,
	rungs,
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
							<Offer rung={offered} onBuy={onBuy} />
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

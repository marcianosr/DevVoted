import { REGISTRY } from "~/shared/lib/copy";
import { Badge } from "./Badge.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import type { DetailReveal } from "./Button.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	offers: "offers",
	aSlot: "a slot",
} as const;

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = "flex w-full flex-col gap-3";

const SEPARATOR = "·";

/** The registry has room to spell its prices out, so nothing hides on hover. */
const PRICE_ON: DetailReveal = "always";

export type RegistryProps = {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	heading?: boolean;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
};

export type RegistrySummaryProps = { offers: number; slotPrice: string };

/**
 * The slot price wears a badge whatever it says. `Figures` only badges what it
 * recognises as a figure, which silently left "free" bare beside a "32 KB" that
 * had one (ADR-066). The spaces stay inside the text so the line still reads as
 * a sentence wherever it lands, flex header or inline heading.
 */
export const RegistrySummary = ({
	offers,
	slotPrice,
}: RegistrySummaryProps) => (
	<>
		<span>{`${offers} ${COPY.offers} ${SEPARATOR} `}</span>
		<Badge>{slotPrice}</Badge>
		<span>{` ${COPY.aSlot}`}</span>
	</>
);

const Offer = ({
	offer,
	openInfo,
	onToggleInfo,
	openUpgrades,
	onToggleUpgrades,
}: {
	offer: ConfigChipProps;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
}) => {
	if (offer.locked) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...offer}
			width="full"
			priceOn={PRICE_ON}
			infoOpen={offer.name === openInfo}
			onToggleInfo={
				onToggleInfo === undefined ? undefined : () => onToggleInfo(offer.name)
			}
			upgradesOpen={offer.name === openUpgrades}
			onToggleUpgrades={
				onToggleUpgrades === undefined
					? undefined
					: () => onToggleUpgrades(offer.name)
			}
		/>
	);
};

export const Registry = ({
	offers,
	slotPrice,
	heading = true,
	openInfo,
	onToggleInfo,
	openUpgrades,
	onToggleUpgrades,
}: RegistryProps) => (
	<section className={COLUMN}>
		{!heading ? null : (
			<div className={TITLE_ROW}>
				<Typography variant="title">{REGISTRY}</Typography>
				<Typography variant="hint" as="span">
					<RegistrySummary offers={offers.length} slotPrice={slotPrice} />
				</Typography>
			</div>
		)}

		<div className={LIST}>
			{offers.map((offer, index) => (
				<Offer
					key={offer.name ?? index}
					offer={offer}
					openInfo={openInfo}
					onToggleInfo={onToggleInfo}
					openUpgrades={openUpgrades}
					onToggleUpgrades={onToggleUpgrades}
				/>
			))}
		</div>
	</section>
);

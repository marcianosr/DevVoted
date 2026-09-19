import { Badge } from "./Badge.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import type { DetailReveal } from "./Button.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = "flex w-full flex-col gap-3";

const SEPARATOR = "·";
const TITLE = "Registry";
const OFFERS_WORD = "offers";
const A_SLOT = "a slot";

/** The registry has room to spell its prices out, so nothing hides on hover. */
const PRICE_ON: DetailReveal = "always";

export type RegistryProps = {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	heading?: boolean;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
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
		<span>{`${offers} ${OFFERS_WORD} ${SEPARATOR} `}</span>
		<Badge>{slotPrice}</Badge>
		<span>{` ${A_SLOT}`}</span>
	</>
);

const Offer = ({
	offer,
	openInfo,
	onToggleInfo,
}: {
	offer: ConfigChipProps;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
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
		/>
	);
};

export const Registry = ({
	offers,
	slotPrice,
	heading = true,
	openInfo,
	onToggleInfo,
}: RegistryProps) => (
	<section className={COLUMN}>
		{!heading ? null : (
			<div className={TITLE_ROW}>
				<Typography variant="title">{TITLE}</Typography>
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
				/>
			))}
		</div>
	</section>
);

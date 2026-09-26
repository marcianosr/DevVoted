import { REGISTRY } from "~/shared/lib/copy";
import { Badge } from "./Badge.ui";
import { CARD_FLOW, ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import type { DetailReveal } from "./Button.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	offers: "offers",
} as const;

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = `grid w-full gap-3 ${CARD_FLOW}`;

const SEPARATOR = "·";

const PRICE_ON: DetailReveal = "always";

export type RegistryProps = {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	heading?: boolean;
	openInfo?: ReadonlySet<string>;
	onToggleInfo?: (name: string) => void;
	onToggleAll?: () => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
};

export type RegistrySummaryProps = { offers: number; slotPrice: string };

export const RegistrySummary = ({
	offers,
	slotPrice,
}: RegistrySummaryProps) => (
	<>
		<span>{`${offers} ${COPY.offers} ${SEPARATOR} `}</span>
		<Badge>{slotPrice}</Badge>
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
	openInfo?: ReadonlySet<string>;
	onToggleInfo?: (name: string) => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
}) => {
	if (offer.locked) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...offer}
			priceOn={PRICE_ON}
			infoOpen={openInfo?.has(offer.name) === true}
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

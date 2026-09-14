import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = "flex w-full flex-col gap-3";

const HINT_GAIN: KantoColor = "pewter";

const SEPARATOR = "·";
const TITLE = "Registry";

export const registrySummaryOf = (offers: number, slotPrice: string) =>
	`${offers} offers ${SEPARATOR} ${slotPrice} a slot`;

export type RegistryProps = {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	heading?: boolean;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
};

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
			upgradePriceOn="always"
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
					<Figures
						text={registrySummaryOf(offers.length, slotPrice)}
						gain={HINT_GAIN}
					/>
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

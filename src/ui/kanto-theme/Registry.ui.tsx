import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = "flex w-full flex-col gap-3";
const CONTROLS = "flex w-full flex-col gap-3 pt-2";

const HINT_GAIN: KantoColor = "pewter";

const SEPARATOR = "·";
const TITLE = "Registry";
const CONTROLS_TITLE = "Registry control";

const summaryOf = (offers: number, slotPrice: string) =>
	`${offers} offers ${SEPARATOR} ${slotPrice} a slot`;

export type RegistryProps = {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	controls?: readonly RegistryControlProps[];
	note?: string;
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
	controls = [],
	note,
	openInfo,
	onToggleInfo,
}: RegistryProps) => (
	<section className={COLUMN}>
		<div className={TITLE_ROW}>
			<Typography variant="title">{TITLE}</Typography>
			<Typography variant="hint" as="span">
				<Figures text={summaryOf(offers.length, slotPrice)} gain={HINT_GAIN} />
			</Typography>
		</div>

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

		{controls.length === 0 ? null : (
			<div className={CONTROLS}>
				<Typography variant="title" as="h3">
					{CONTROLS_TITLE}
				</Typography>
				{controls.map((control) => (
					<RegistryControl key={control.title} {...control} />
				))}
			</div>
		)}

		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</section>
);

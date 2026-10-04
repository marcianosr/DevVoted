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
const LIST = `registry-deal grid w-full gap-3 ${CARD_FLOW}`;
const GROUPS = "flex w-full flex-col gap-6";
const GROUP = "flex w-full flex-col gap-3";
const GROUP_HEADING = "flex items-center gap-2";
const RULE = "min-w-8 flex-1 border-t border-theme-faint";

const SEPARATOR = "·";

const PRICE_ON: DetailReveal = "always";

export type RegistryGroup = {
	id: string;
	label: string;
	offers: readonly ConfigChipProps[];
};

export type RegistryPanels = {
	openInfo?: ReadonlySet<string>;
	onToggleInfo?: (name: string) => void;
	openUpgrades?: string;
	onToggleUpgrades?: (name: string) => void;
};

export type RegistryProps = RegistryPanels & {
	offers: readonly ConfigChipProps[];
	slotPrice: string;
	groups?: readonly RegistryGroup[];
	heading?: boolean;
	onToggleAll?: () => void;
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
}: RegistryPanels & { offer: ConfigChipProps }) => {
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

const Offers = ({
	offers,
	...panels
}: RegistryPanels & { offers: readonly ConfigChipProps[] }) => (
	<div className={LIST}>
		{offers.map((offer, index) => (
			<Offer key={offer.name ?? index} offer={offer} {...panels} />
		))}
	</div>
);

const Group = ({
	group,
	...panels
}: RegistryPanels & { group: RegistryGroup }) => (
	<div role="group" aria-label={group.label} className={GROUP}>
		<div className={GROUP_HEADING}>
			<Typography variant="subtitle" as="span">
				{group.label}
			</Typography>
			<Typography variant="hint" as="span">
				{group.offers.length}
			</Typography>
			<span aria-hidden className={RULE} />
		</div>

		<Offers offers={group.offers} {...panels} />
	</div>
);

export const Registry = ({
	offers,
	slotPrice,
	groups,
	heading = true,
	openInfo,
	onToggleInfo,
	openUpgrades,
	onToggleUpgrades,
}: RegistryProps) => {
	const panels: RegistryPanels = {
		openInfo,
		onToggleInfo,
		openUpgrades,
		onToggleUpgrades,
	};

	return (
		<section className={COLUMN}>
			{!heading ? null : (
				<div className={TITLE_ROW}>
					<Typography variant="title">{REGISTRY}</Typography>
					<Typography variant="hint" as="span">
						<RegistrySummary offers={offers.length} slotPrice={slotPrice} />
					</Typography>
				</div>
			)}

			{groups === undefined ? (
				<Offers offers={offers} {...panels} />
			) : (
				<div className={GROUPS}>
					{groups.map((group) => (
						<Group key={group.id} group={group} {...panels} />
					))}
				</div>
			)}
		</section>
	);
};

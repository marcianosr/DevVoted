import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	infoFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackTo,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { slotDealsFor, type SlotDeal } from "~/modules/run/shop/application/shopScreen.viewmodel";
import { kbLabel } from "~/shared/lib/storage";

import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { HandProps } from "~/ui/kanto-theme/Hand.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type { SlotCash } from "~/ui/kanto-theme/SlotBox.ui";
import type { SlotOfferProps } from "~/ui/kanto-theme/SlotOffer.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";

const START_GATE = 0;
const RUN_GATE_COUNT = VICTORY_GATE + 1;
const SEPARATOR = "·";
const ARCHIVE_WORD = "archive";

const NEW_RUN_TITLE = "New run";
const EMPTY_LABEL = "nothing installed yet";
const SUGGESTED_LABEL = "suggested";
const SUGGESTED_COLOR = "cerulean" as const;
const START_LABEL = `${gateSwatchAt(START_GATE).gateName} gate prep`;
const ARCHIVE_SOURCE = `from ${ARCHIVE_WORD} storage`;
export const NEW_RUN_BUILD_NOTE =
	"A slot is bought with archived storage, not the run's balance, and is refundable at cost until the run starts.";

export const newRunHeaderFor = (archiveKb: number): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	gateCount: RUN_GATE_COUNT,
	swatches: swatchTrackTo(START_GATE),
	funds: fundsOf(archiveKb, ARCHIVE_WORD),
	title: NEW_RUN_TITLE,
	subtitle: `gate ${START_GATE} ${SEPARATOR} ${gateSwatchAt(START_GATE).gateName}`,
});

export type HandCard = {
	config: Config;
	held: boolean;
	suggested: boolean;
	fits: boolean;
	onPress: () => void;
};

export const handCardFor = ({
	config,
	held,
	suggested,
	fits,
	onPress,
}: HandCard): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: suggested ? [{ label: SUGGESTED_LABEL, color: SUGGESTED_COLOR }] : [],
	skipped: held || !fits,
	install: held ? undefined : { onPress, disabled: !fits },
	info: infoFor(config),
});

export type BuildDeals = {
	cash?: SlotCash;
	offer?: SlotOfferProps;
	nextSlot?: SlotOfferProps;
};

export const newRunBuildFor = (
	configs: readonly Config[],
	capacity: number,
	onUninstall: (configId: string) => void,
	deals: BuildDeals = {},
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo"> = {}
): BuildProps => ({
	configs: configs.map((config) => ({
		name: config.label,
		badges: [],
		...chipFor(config),
		onUninstall: () => onUninstall(config.id),
	})),
	slots: { used: occupiedSlots(configs), capacity },
	emptyLabel: EMPTY_LABEL,
	...deals,
	...panels,
});

const nextSlotFor = (
	capacity: number,
	costKb?: number
): SlotOfferProps | undefined =>
	costKb === undefined
		? undefined
		: { slot: capacity + 2, price: kbLabel(costKb), locked: true };

export type NewRunSlots = {
	capacity: number;
	archiveKb: number;
	buy: SlotDeal;
	cash: SlotDeal;
	next: SlotDeal;
};

export const newRunDealsFor = (
	{ capacity, archiveKb, buy, cash, next }: NewRunSlots,
	onBuy: () => void,
	onCash: () => void
): BuildDeals => {
	const deals = slotDealsFor(capacity, archiveKb, buy, cash, onBuy, onCash);

	return {
		...deals,
		offer:
			deals.offer === undefined || deals.offer.locked !== undefined
				? deals.offer
				: { ...deals.offer, from: ARCHIVE_SOURCE },
		nextSlot: nextSlotFor(capacity, next.costKb),
	};
};

export const newRunFooterFor = (onStart?: () => void): ScreenFooterProps => ({
	action: { label: START_LABEL, icon: "chevron", onPress: onStart },
});

export const NEW_RUN_BALANCE_WORD = BALANCE_WORD;
export type { NewRunScreenProps, HandProps };

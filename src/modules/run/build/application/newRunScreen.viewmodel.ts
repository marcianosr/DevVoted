import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	infoFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import {
	type VendorLockChip,
	vendorChipFor,
} from "~/modules/run/build/application/vendorChip.viewmodel";

import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { RegistryProps } from "~/ui/kanto-theme/Registry.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";

const START_GATE = 0;
/** The opening build is the free rung by construction, so it never bills. */
const FREE_UPKEEP = 0;
const SEPARATOR = "·";

const NEW_RUN_TITLE = "New run";
const FREE_PRICE = "free";
export const EMPTY_LABEL = "nothing installed yet";
export const SUGGESTED_LABEL = "suggested";
const SUGGESTED_COLOR = "cerulean" as const;
const START_LABEL = `${gateSwatchAt(START_GATE).gateName} gate prep`;
export const NEW_RUN_BUILD_NOTE = `Select configs up to ${BASE_SLOTS} weight units`;

export const newRunHeaderFor = (balanceKb: number): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	swatches: swatchTrackFor([], START_GATE),
	funds: fundsOf(balanceKb, BALANCE_WORD),
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

export const newRunBuildFor = (
	configs: readonly Config[],
	held: number,
	onUninstall: (configId: string) => void,
	vendorLockFor: (configId: string) => VendorLockChip | undefined = () =>
		undefined,
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo"> = {}
): BuildProps => ({
	configs: configs.map((config) => ({
		name: config.label,
		...chipFor(config),
		...vendorChipFor(vendorLockFor(config.id), () => onUninstall(config.id)),
	})),
	weight: { held, perGateKb: FREE_UPKEEP },
	emptyLabel: EMPTY_LABEL,
	...panels,
});

export const newRunRegistryFor = (
	offers: readonly ConfigChipProps[],
	panels: Pick<RegistryProps, "openInfo" | "onToggleInfo"> = {}
): RegistryProps => ({
	offers,
	slotPrice: FREE_PRICE,
	...panels,
});

export const newRunFooterFor = (
	onStart?: () => void,
	refusal?: string
): ScreenFooterProps => ({
	action: { label: START_LABEL, icon: "chevron", onPress: onStart },
	...(refusal === undefined ? {} : { refusal }),
});

export const NEW_RUN_BALANCE_WORD = BALANCE_WORD;
export type { NewRunScreenProps, RegistryProps };

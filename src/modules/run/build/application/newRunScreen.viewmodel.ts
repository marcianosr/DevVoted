import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_GROUP_ORDER,
	type ConfigGroup,
	configGroupOf,
} from "~/modules/run/config/domain/configGroup.model";
import {
	settledChipFor,
	settledFactsFor,
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
import { plural } from "~/shared/lib/displayValue";
import {
	type VendorLockChip,
	vendorChipFor,
} from "~/modules/run/build/application/vendorChip.viewmodel";

import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type {
	RegistryGroup,
	RegistryProps,
} from "~/ui/kanto-theme/Registry.ui";
import type { RegistryHelpProps } from "~/ui/kanto-theme/RegistryHelp.ui";
import type { NewRunScreenProps } from "~/ui/kanto-theme/NewRunScreen.ui";
import type { ScreenFooterProps } from "~/ui/kanto-theme/ScreenFooter.ui";

const START_GATE = 0;
const FREE_UPKEEP = 0;

const NEW_RUN_TITLE = "New run";
const FREE_PRICE = "free";
export const EMPTY_LABEL = "nothing installed yet";
export const INSTALLED_LABEL = "Installed";
export const CONFIG_GROUP_LABELS = {
	coverage: "Coverage",
	storage: "Storage",
	answerHelp: "Answer help",
	risk: "Risk",
	misc: "Misc",
} as const satisfies Record<ConfigGroup, string>;
const START_LABEL = `${gateSwatchAt(START_GATE).gateName} gate prep`;
const CONFIG_WORD = "config";
const WEIGHT_WORD = "weight";
export const NEW_RUN_BUILD_NOTE: LeadLine = [
	"Select configs up to ",
	{ figure: `${BASE_SLOTS}` },
	` ${WEIGHT_WORD} units`,
];
const READING_JOIN = " · ";
export const BARE_BUILD_REMEDY = `install at least one ${CONFIG_WORD}`;

export type NewRunBuild = { configs: number; held: number; slots: number };

export const newRunPressNoteOf = (build: NewRunBuild): string =>
	build.configs === 0 ? BARE_BUILD_REMEDY : buildReadingOf(build);

export const buildReadingOf = ({ configs, held, slots }: NewRunBuild): string =>
	`${plural(configs, CONFIG_WORD)}${READING_JOIN}${held}/${slots} ${WEIGHT_WORD}`;

export const newRunHeaderFor = (balanceKb: number): HeaderProps => ({
	swatch: gateSwatchAt(START_GATE),
	swatches: swatchTrackFor([], START_GATE),
	funds: fundsOf(balanceKb, BALANCE_WORD),
	title: NEW_RUN_TITLE,
});

export type HandCard = {
	config: Config;
	held: boolean;
	fits: boolean;
	onPress: () => void;
};

export const handCardFor = ({
	config,
	held,
	fits,
	onPress,
}: HandCard): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [],
	skipped: held || !fits,
	install: held
		? { label: INSTALLED_LABEL, disabled: true }
		: { onPress, disabled: !fits },
	info: settledFactsFor(config),
});

export const newRunGroupsFor = (
	hand: readonly HandCard[]
): readonly RegistryGroup[] =>
	CONFIG_GROUP_ORDER.map((group) => ({
		id: group,
		label: CONFIG_GROUP_LABELS[group],
		offers: hand
			.filter((card) => configGroupOf(card.config) === group)
			.map(handCardFor),
	})).filter((group) => group.offers.length > 0);

const HELP_MIN_GROUPS = 2;

export const newRunHelpFor = (
	groups: readonly RegistryGroup[],
	picked: string | undefined,
	handlers: Pick<RegistryHelpProps, "onPick" | "onHide">
): RegistryHelpProps | undefined =>
	groups.length < HELP_MIN_GROUPS
		? undefined
		: {
				chips: groups.map(({ id, label, offers }) => ({
					id,
					label,
					count: offers.length,
				})),
				pickedId: picked,
				...handlers,
			};

export const newRunBuildFor = (
	configs: readonly Config[],
	held: number,
	onUninstall: (configId: string) => void,
	vendorLockFor: (configId: string) => VendorLockChip | undefined = () =>
		undefined,
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo" | "onToggleAll"> = {}
): BuildProps => ({
	configs: configs.map((config) => ({
		name: config.label,
		...settledChipFor(config),
		...vendorChipFor(vendorLockFor(config.id), () => onUninstall(config.id)),
	})),
	weight: { held, perGateKb: FREE_UPKEEP },
	emptyLabel: EMPTY_LABEL,
	...panels,
});

export const newRunRegistryFor = (
	groups: readonly RegistryGroup[],
	picked?: string,
	panels: Pick<RegistryProps, "openInfo" | "onToggleInfo" | "onToggleAll"> = {}
): RegistryProps => {
	const showing = groups.filter(
		(group) => picked === undefined || group.id === picked
	);

	return {
		offers: showing.flatMap((group) => group.offers),
		groups: showing,
		slotPrice: FREE_PRICE,
		...panels,
	};
};

export const newRunFooterFor = (
	onStart?: () => void,
	refusal?: string,
	build: NewRunBuild = { configs: 0, held: 0, slots: BASE_SLOTS }
): ScreenFooterProps => ({
	action: {
		label: START_LABEL,
		swatch: { state: "current", swatch: gateSwatchAt(START_GATE) },
		onPress: onStart,
	},
	note: newRunPressNoteOf(build),
	...(refusal === undefined ? {} : { refusal }),
});

export const NEW_RUN_BALANCE_WORD = BALANCE_WORD;
export type { NewRunScreenProps, RegistryProps };

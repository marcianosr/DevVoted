import { useState } from "react";

import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

import {
	EMPTY_WARM_BOOT_DRAFT,
	NEW_RUN_BUILD_NOTE,
	bootedPanelFor,
	draftPickOf,
	isDrafted,
	newRunBuildFor,
	newRunFooterFor,
	newRunGroupsFor,
	newRunHeaderFor,
	newRunFilterFor,
	newRunRegistryFor,
	type WarmBootDraft,
	warmBootPanelFor,
	warmBootSpendOf,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import { VENDOR_REMEDY } from "~/modules/run/build/application/vendorChip.viewmodel";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { WarmBootPick } from "~/modules/run/run/domain/warmBoot.model";
import type { RegistryControlId } from "~/modules/run/shop/domain/registryControl.model";
import { NewRunScreen } from "~/ui/kanto-theme/NewRunScreen.ui";

export type StartViewProps = {
	view: RunView;
	runNumber?: number | null;
	onToggle: (configId: string) => void;
	onVendorLock: (configId: string) => void;
	onStart: () => void;
	onWarmBoot?: (pick: WarmBootPick) => void;
	bootRefusal?: string;
	booting?: boolean;
};

const NO_ARCHIVE_KB = 0;

const toggledIn = (
	serviceIds: readonly RegistryControlId[],
	id: RegistryControlId
): readonly RegistryControlId[] =>
	serviceIds.includes(id)
		? serviceIds.filter((carried) => carried !== id)
		: [...serviceIds, id];

export const StartView = ({
	view,
	runNumber = null,
	onToggle,
	onVendorLock,
	onStart,
	onWarmBoot,
	bootRefusal,
	booting = false,
}: StartViewProps) => {
	const [buildFlips, setBuildFlips] = useState<ReadonlySet<string>>(new Set());
	const [offerFlips, setOfferFlips] = useState<ReadonlySet<string>>(new Set());
	const [pickedGroup, setPickedGroup] = useState<string>();
	const [draft, setDraft] = useState<WarmBootDraft>(EMPTY_WARM_BOOT_DRAFT);

	const buildNames = view.configs.map((config) => config.label);
	const offerNames = view.available.map((config) => config.label);

	const openBuild = disclosedIn(buildNames, buildFlips, INSTALLED_CARDS_OPEN);
	const openOffers = disclosedIn(offerNames, offerFlips, OFFERED_CARDS_OPEN);

	const toggleBuild = (name: string) =>
		setBuildFlips(toggleDisclosure(buildFlips, name));

	const toggleOffer = (name: string) =>
		setOfferFlips(toggleDisclosure(offerFlips, name));

	const toggleAllBuild = () =>
		setBuildFlips(
			discloseAll(
				buildNames,
				openBuild.size < buildNames.length,
				INSTALLED_CARDS_OPEN
			)
		);

	const toggleAllOffers = () =>
		setOfferFlips(
			discloseAll(
				offerNames,
				openOffers.size < offerNames.length,
				OFFERED_CARDS_OPEN
			)
		);

	const held = new Set(view.configs.map((config) => config.id));
	const free = view.slots - occupiedSlots(view.configs);
	const needsVendor = view.vendorLock.offered;

	const vendorLockFor = (configId: string) => ({
		locked: view.vendorLock.lockedConfigId === configId,
		onLock:
			needsVendor &&
			view.configs.find((config) => config.id === configId)?.vendorLocks !==
				true
				? () => onVendorLock(configId)
				: undefined,
	});

	const groups = newRunGroupsFor(
		view.available.map((config) => ({
			config,
			held: held.has(config.id),
			fits: slotsOf(config) <= free,
			onPress: () => onToggle(config.id),
		}))
	);

	const archiveKb = view.archiveAfterKb ?? NO_ARCHIVE_KB;
	const warmBoot =
		view.warmBoot !== null
			? bootedPanelFor(view.warmBoot, archiveKb)
			: onWarmBoot === undefined
				? undefined
				: warmBootPanelFor({
						archiveKb,
						unlockedServiceIds: view.unlockedServiceIds,
						draft,
						onPickRung: (rung) => setDraft({ ...draft, rung }),
						onToggleService: (id) =>
							setDraft({ ...draft, serviceIds: toggledIn(draft.serviceIds, id) }),
					});
	const drafted = view.warmBoot === null && isDrafted(draft);
	const canPress = view.canStart && !needsVendor && !booting;
	const press = !canPress
		? undefined
		: drafted && onWarmBoot !== undefined
			? () => onWarmBoot(draftPickOf(draft))
			: onStart;

	return (
		<NewRunScreen
			header={{
				...newRunHeaderFor(view.storage),
				readout: runReadoutFor(view, runNumber),
			}}
			build={newRunBuildFor(view.configs, view.slots, onToggle, vendorLockFor, {
				openInfo: openBuild,
				onToggleInfo: toggleBuild,
				onToggleAll: toggleAllBuild,
			})}
			registry={newRunRegistryFor(groups, pickedGroup, {
				openInfo: openOffers,
				onToggleInfo: toggleOffer,
				onToggleAll: toggleAllOffers,
			})}
			filter={newRunFilterFor(groups, pickedGroup, setPickedGroup)}
			buildNote={NEW_RUN_BUILD_NOTE}
			warmBoot={warmBoot}
			footer={newRunFooterFor(
				press,
				needsVendor ? VENDOR_REMEDY : bootRefusal,
				{
					configs: view.configs.length,
					held: occupiedSlots(view.configs),
					slots: view.slots,
				},
				drafted ? warmBootSpendOf(draft) : undefined
			)}
		/>
	);
};

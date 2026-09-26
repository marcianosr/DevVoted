import { useState } from "react";

import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

import {
	handCardFor,
	NEW_RUN_BUILD_NOTE,
	newRunBuildFor,
	newRunFooterFor,
	newRunHeaderFor,
	newRunRegistryFor,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import { VENDOR_REMEDY } from "~/modules/run/build/application/vendorChip.viewmodel";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { NewRunScreen } from "~/ui/kanto-theme/NewRunScreen.ui";

export type StartViewProps = {
	view: RunView;
	onToggle: (configId: string) => void;
	onVendorLock: (configId: string) => void;
	onStart: () => void;
};

export const StartView = ({
	view,
	onToggle,
	onVendorLock,
	onStart,
}: StartViewProps) => {
	const [buildFlips, setBuildFlips] = useState<ReadonlySet<string>>(new Set());
	const [offerFlips, setOfferFlips] = useState<ReadonlySet<string>>(new Set());

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
	const suggested = new Set(view.recommendedConfigIds);
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

	const offers = view.available.map((config) =>
		handCardFor({
			config,
			held: held.has(config.id),
			suggested: !held.has(config.id) && suggested.has(config.id),
			fits: slotsOf(config) <= free,
			onPress: () => onToggle(config.id),
		})
	);

	return (
		<NewRunScreen
			header={newRunHeaderFor(view.storage)}
			build={newRunBuildFor(view.configs, view.slots, onToggle, vendorLockFor, {
				openInfo: openBuild,
				onToggleInfo: toggleBuild,
				onToggleAll: toggleAllBuild,
			})}
			registry={newRunRegistryFor(offers, {
				openInfo: openOffers,
				onToggleInfo: toggleOffer,
				onToggleAll: toggleAllOffers,
			})}
			buildNote={NEW_RUN_BUILD_NOTE}
			footer={newRunFooterFor(
				view.canStart && !needsVendor ? onStart : undefined,
				needsVendor ? VENDOR_REMEDY : undefined,
				{
					configs: view.configs.length,
					held: occupiedSlots(view.configs),
					slots: view.slots,
				}
			)}
		/>
	);
};

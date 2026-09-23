import { useState } from "react";

import {
	handCardFor,
	NEW_RUN_BUILD_NOTE,
	NEW_RUN_REGISTRY_NOTE,
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
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);

	const toggleInfo = (name: string) =>
		setOpenInfo(name === openInfo ? undefined : name);

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
				openInfo,
				onToggleInfo: toggleInfo,
			})}
			registry={newRunRegistryFor(offers, {
				openInfo,
				onToggleInfo: toggleInfo,
			})}
			buildNote={NEW_RUN_BUILD_NOTE}
			registryNote={NEW_RUN_REGISTRY_NOTE}
			footer={newRunFooterFor(
				view.canStart && !needsVendor ? onStart : undefined,
				needsVendor ? VENDOR_REMEDY : undefined
			)}
		/>
	);
};

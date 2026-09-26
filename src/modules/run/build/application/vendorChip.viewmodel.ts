import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";

const LOCK_IN = "lock in";
const LOCKED_IN = "locked in";

export const VENDOR_REMEDY =
	"vendor lock-in names nobody · pick the config it exempts — you cannot sell it";

export type VendorLockChip = {
	readonly locked: boolean;
	readonly onLock?: () => void;
};

type VendorChipParts = {
	badges: ConfigChipBadge[];
	onUninstall?: () => void;
};

const vendorBadgesFor = (
	vendorLock: VendorLockChip | undefined
): ConfigChipBadge[] => {
	if (vendorLock === undefined) return [];
	if (vendorLock.locked) return [{ label: LOCKED_IN, color: "saffron" }];
	if (vendorLock.onLock === undefined) return [];
	return [{ label: LOCK_IN, onPress: vendorLock.onLock }];
};

export const vendorChipFor = (
	vendorLock: VendorLockChip | undefined,
	onUninstall?: () => void
): VendorChipParts => ({
	badges: vendorBadgesFor(vendorLock),
	onUninstall: vendorLock?.locked === true ? undefined : onUninstall,
});

import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";

const LOCK_IN = "lock in";
const LOCKED_IN = "locked in";

export const VENDOR_REMEDY =
	"vendor lock-in names nobody · pick the config it exempts — you cannot sell it";

export type VendorLockChip = {
	readonly locked: boolean;
	readonly onLock?: () => void;
};

/**
 * Spelled out rather than picked off `ConfigChipProps`: that type is
 * `Redactable`, so a `Pick` distributes over the union and comes back with
 * `badges` optional, which every chip requires.
 */
type VendorChipParts = {
	badges: ConfigChipBadge[];
	onUninstall?: () => void;
};

/**
 * A locked config loses its uninstall press outright rather than wearing a
 * disabled one, and the badge left behind is what states why. The kit's `hint`
 * reaches the DOM only as an aria-label, so a refusal carried there is a
 * refusal nobody can see.
 */
const vendorBadgesFor = (
	vendorLock: VendorLockChip | undefined
): ConfigChipBadge[] => {
	if (vendorLock === undefined) return [];
	if (vendorLock.locked) return [{ label: LOCKED_IN, color: "saffron" }];
	if (vendorLock.onLock === undefined) return [];
	return [{ label: LOCK_IN, onPress: vendorLock.onLock }];
};

/**
 * Lives beside the build rather than beside the shop because both prep screens
 * draw the same chip: the starting hand and the registry ask for the vendor in
 * the same words, and only the build owns the lock.
 */
export const vendorChipFor = (
	vendorLock: VendorLockChip | undefined,
	onUninstall?: () => void
): VendorChipParts => ({
	badges: vendorBadgesFor(vendorLock),
	onUninstall: vendorLock?.locked === true ? undefined : onUninstall,
});

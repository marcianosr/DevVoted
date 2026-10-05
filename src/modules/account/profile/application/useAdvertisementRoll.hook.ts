import { useCallback, useEffect, useState } from "react";

import type {
	AdvertisementPlacement,
	AdvertisementRoll,
} from "~/modules/account/profile/application/advertisement.viewmodel";

const DISMISSED_PREFIX = "devvoted:advertisement-dismissed:";
const DISMISSED = "1";

const isDismissed = (placement: AdvertisementPlacement): boolean => {
	try {
		return window.sessionStorage.getItem(DISMISSED_PREFIX + placement) !== null;
	} catch {
		return false;
	}
};

const markDismissed = (placement: AdvertisementPlacement) => {
	try {
		window.sessionStorage.setItem(DISMISSED_PREFIX + placement, DISMISSED);
	} catch {
		return;
	}
};

export type AdvertisementSlot = {
	roll: AdvertisementRoll | undefined;
	dismiss: () => void;
};

export const useAdvertisementRoll = (
	placement: AdvertisementPlacement
): AdvertisementSlot => {
	const [roll, setRoll] = useState<AdvertisementRoll | undefined>(undefined);

	useEffect(() => {
		if (isDismissed(placement)) return;
		setRoll({ kind: Math.random(), border: Math.random() });
	}, [placement]);

	const dismiss = useCallback(() => {
		markDismissed(placement);
		setRoll(undefined);
	}, [placement]);

	return { roll, dismiss };
};

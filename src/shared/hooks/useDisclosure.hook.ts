import { useState } from "react";

import { useIsSmallScreen } from "~/shared/hooks/useIsSmallScreen.hook";

import {
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

export type Disclosure = {
	readonly open: ReadonlySet<string>;
	readonly toggle: (name: string) => void;
	readonly toggleAll: () => void;
};

export const useDisclosure = (
	names: readonly string[],
	openByDefault: boolean
): Disclosure => {
	const [flips, setFlips] = useState<ReadonlySet<string>>(new Set());
	const folded = useIsSmallScreen();
	const openOnArrival = openByDefault && !folded;
	const open = disclosedIn(names, flips, openOnArrival);

	return {
		open,
		toggle: (name) => setFlips(toggleDisclosure(flips, name)),
		toggleAll: () =>
			setFlips(discloseAll(names, open.size < names.length, openOnArrival)),
	};
};

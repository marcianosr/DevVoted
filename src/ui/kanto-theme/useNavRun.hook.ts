import { createContext, useContext, useEffect, useRef } from "react";

import type { BalanceProps } from "./Balance.ui";
import type { SwatchFill } from "./Swatch.ui";

export type NavRunReading = {
	swatches: readonly SwatchFill[];
	funds?: BalanceProps;
};

export const NavRunContext = createContext<
	(reading: NavRunReading | undefined) => void
>(() => undefined);

export const useNavRun = (reading: NavRunReading): void => {
	const publish = useContext(NavRunContext);
	const latest = useRef(reading);
	latest.current = reading;
	const changed = JSON.stringify(reading);

	useEffect(() => {
		publish(latest.current);
	}, [publish, changed]);

	useEffect(() => () => publish(undefined), [publish]);
};

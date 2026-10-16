import { render } from "@testing-library/react";
import { useState, type ReactElement, type ReactNode } from "react";

import { Balance } from "~/modules/run/run/presentation/Balance.ui";
import { SwatchTrack } from "~/modules/run/gate/presentation/SwatchTrack.ui";
import {
	NavRunContext,
	type NavRunReading,
} from "~/modules/app/shell/presentation/useNavRun.hook";

const NAV_TEST_ID = "nav-run";

const NavRunStandIn = ({ children }: { children: ReactNode }) => {
	const [reading, setReading] = useState<NavRunReading>();

	return (
		<NavRunContext.Provider value={setReading}>
			{children}
			<div data-testid={NAV_TEST_ID}>
				{reading === undefined ? null : (
					<>
						<SwatchTrack swatches={reading.swatches} size="small" />
						{reading.funds === undefined ? null : (
							<Balance {...reading.funds} layout="inline" />
						)}
					</>
				)}
			</div>
		</NavRunContext.Provider>
	);
};

export const renderWithNavRun = (ui: ReactElement) =>
	render(ui, { wrapper: NavRunStandIn });

export const navRunOf = (container: HTMLElement): HTMLElement | null =>
	container.querySelector(`[data-testid="${NAV_TEST_ID}"]`);

import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/swatch.model";

/**
 * Wraps a story in a gate-themed section so the `*-theme` utilities resolve,
 * mirroring how Screen scopes the ambient gate theme in the app (ADR-020).
 */
export const withGateTheme = (gateTheme: SwatchTheme = "cascade") => {
	const GateThemeDecorator = (Story: () => ReactNode) => (
		<section data-gate-theme={gateTheme} className="p-6 bg-black">
			<Story />
		</section>
	);
	return GateThemeDecorator;
};

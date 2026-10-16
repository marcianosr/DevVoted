import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

export const gateTitleOf = (swatch: GateSwatch): string =>
	`${swatch.gateName} Gate`;

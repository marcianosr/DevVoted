import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FAMILY_SOLID } from "./families";

const DOT = "inline-block size-2 shrink-0 rounded-xs";
const DIM = "opacity-40";

export type FamilyDotProps = {
	family: ConfigFamily;
	/** An unseen config still shows its family — the catalogue tells you what
	 * kind of thing is missing, never which one. */
	dim?: boolean;
	className?: string;
};

export const FamilyDot = ({ family, dim, className }: FamilyDotProps) => (
	<span
		role="img"
		aria-label={family}
		className={clsx(DOT, FAMILY_SOLID[family], dim && DIM, className)}
	/>
);

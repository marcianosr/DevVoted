import { clsx } from "clsx";

import { Icon, type IconName } from "./Icon.ui";
import { Swatch, type SwatchMark, type SwatchSize } from "./Swatch.ui";

const PRESS =
	"flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition disabled:cursor-not-allowed";

const LIVE =
	"segment-theme press-raised hover:brightness-110 active:press-sunk";
const REFUSED = "border border-theme-faint bg-theme-faint text-theme-muted";

const LABEL = "text-base font-extrabold tracking-wide";
const NOTE = "text-sm font-normal";
const LINES = "flex min-w-0 flex-col gap-0.5";
const LEADS_ON = "ml-auto size-4";
const LEADS_ON_ICON: IconName = "forward";
const MARK = "size-7";

const MARK_SIZE: SwatchSize = "large";

const SEPARATOR = " · ";

const accessibleNameOf = (label: string, note?: string) =>
	note === undefined ? undefined : `${label}${SEPARATOR}${note}`;

export type ActionProps = {
	label: string;
	note?: string;
	swatch?: SwatchMark;
	icon?: IconName;
	onPress?: () => void;
};

const Mark = ({ swatch, icon, refused }: MarkProps) => {
	if (swatch !== undefined)
		return (
			<Swatch
				{...swatch}
				size={MARK_SIZE}
				ground={refused ? "dark" : "bright"}
			/>
		);

	if (icon !== undefined) return <Icon name={icon} className={MARK} />;

	return null;
};

type MarkProps = Pick<ActionProps, "swatch" | "icon"> & { refused: boolean };

export const Action = ({ label, note, swatch, icon, onPress }: ActionProps) => {
	const refused = onPress === undefined;

	return (
		<button
			type="button"
			aria-label={accessibleNameOf(label, note)}
			disabled={refused}
			onClick={onPress}
			className={clsx(PRESS, refused ? REFUSED : LIVE)}
		>
			<Mark swatch={swatch} icon={icon} refused={refused} />
			<span className={LINES}>
				<span className={LABEL}>{label}</span>
				{note === undefined ? null : <span className={NOTE}>{note}</span>}
			</span>
			<Icon name={LEADS_ON_ICON} className={LEADS_ON} />
		</button>
	);
};

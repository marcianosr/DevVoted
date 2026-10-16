import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";

const PRESS =
	"flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition disabled:cursor-not-allowed";

const LIVE =
	"segment-theme press-raised hover:brightness-110 active:press-sunk";
const SHINE = "press-sheen";
const REFUSED = "border border-theme-faint bg-theme-faint text-theme-muted";

const LABEL = "text-base font-extrabold tracking-wide";
const NOTE = "text-sm font-normal";
const LINES = "flex min-w-0 flex-col gap-0.5";
const LEADS_ON = "ml-auto size-4";
const LEADS_ON_ICON: IconName = "forward";
const MARK = "size-7";
const DASHED = "size-7 shrink-0 rounded-md border border-dashed border-current";

const SEPARATOR = " · ";

const accessibleNameOf = (label: string, note?: string) =>
	note === undefined ? label : `${label}${SEPARATOR}${note}`;

export type ActionMark = "dashed";
export type ActionTone = "action" | "commit";

const COMMIT_COLOR: KantoColor = "saffron";

const toneColorOf = (
	tone: ActionTone,
	refused: boolean
): KantoColor | undefined =>
	tone === "commit" && !refused ? COMMIT_COLOR : undefined;

export type ActionProps = {
	label: string;
	note?: string;
	leading?: ReactNode;
	icon?: IconName;
	mark?: ActionMark;
	tone?: ActionTone;
	shine?: boolean;
	onPress?: () => void;
};

const Mark = ({ leading, icon, mark }: MarkProps) => {
	if (leading !== undefined) return leading;
	if (icon !== undefined) return <Icon name={icon} className={MARK} />;
	if (mark !== undefined) return <span aria-hidden className={DASHED} />;

	return null;
};

type MarkProps = Pick<ActionProps, "leading" | "icon" | "mark">;

export const Action = ({
	label,
	note,
	leading,
	icon,
	mark,
	tone = "action",
	shine = false,
	onPress,
}: ActionProps) => {
	const refused = onPress === undefined;

	return (
		<button
			type="button"
			aria-label={accessibleNameOf(label, note)}
			data-screen-theme={toneColorOf(tone, refused)}
			disabled={refused}
			onClick={onPress}
			className={clsx(
				PRESS,
				refused ? REFUSED : LIVE,
				shine && !refused && SHINE
			)}
		>
			<Mark leading={leading} icon={icon} mark={mark} />
			<span className={LINES}>
				<span className={LABEL}>{label}</span>
				{note === undefined ? null : <span className={NOTE}>{note}</span>}
			</span>
			<Icon name={LEADS_ON_ICON} className={LEADS_ON} />
		</button>
	);
};

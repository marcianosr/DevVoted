import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";

const BADGE =
	"inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap";
const LABEL = "badge-theme";
const ICONED = "gap-1";
const PRESS =
	"press-theme ring-1 ring-inset ring-theme-soft transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const ARMED = "press-theme-armed";

const PRESS_COLOR = "cerulean";

type Decoration = {
	color?: KantoColor;
	icon?: IconName;
	onPress?: never;
	armed?: never;
	disabled?: never;
	hint?: never;
};

type Press = {
	color?: never;
	icon?: never;
	onPress: () => void;
	armed?: boolean;
	disabled?: boolean;
	hint?: string;
};

export type BadgeProps = { children: ReactNode } & (Decoration | Press);

export const Badge = ({ children, ...props }: BadgeProps) => {
	if (props.onPress === undefined) {
		return (
			<span
				data-screen-theme={props.color}
				className={clsx(BADGE, LABEL, props.icon !== undefined && ICONED)}
			>
				{props.icon === undefined ? null : <Icon name={props.icon} />}
				{children}
			</span>
		);
	}

	const { onPress, armed, disabled = false, hint } = props;

	return (
		<button
			type="button"
			data-screen-theme={PRESS_COLOR}
			aria-label={hint}
			aria-pressed={armed}
			disabled={disabled}
			onClick={onPress}
			className={clsx(BADGE, PRESS, armed === true && ARMED)}
		>
			{children}
		</button>
	);
};

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full items-center gap-4 text-left";
const BOX = "rounded-lg border border-theme-faint bg-theme-raised p-3";
const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const CAP =
	"badge-theme flex size-8 shrink-0 items-center justify-center rounded-md text-sm";
const BODY = "flex min-w-0 flex-col";
const PRICE = "ml-auto shrink-0";
const UNLOCK = "ml-auto min-w-0 text-right text-xs text-theme-muted";

const REFUSAL_COLOR = "cinnabar";
const LOCKED_GLYPH = "?";
const UNLOCK_WORD = "unlock";
const SEPARATOR = "·";

export type RegistryControlLayout = "box" | "row";

export type RegistryControlData = {
	glyph: string;
	title: string;
	detail: string;
};

export type RegistryControlState =
	{ locked?: false; price?: string } | { locked: true; unlock: string };

type RegistryControlChrome = {
	layout?: RegistryControlLayout;
	refusal?: string;
	disabled?: boolean;
	onPress?: () => void;
};

export type RegistryControlProps = RegistryControlData &
	RegistryControlState &
	RegistryControlChrome;

export type UnlockedRegistryControlProps = RegistryControlData &
	Extract<RegistryControlState, { locked?: false }> &
	RegistryControlChrome;

const Trailing = (props: RegistryControlProps) => {
	if (props.locked === true) {
		return (
			<span className={UNLOCK}>
				{`${UNLOCK_WORD} ${SEPARATOR} ${props.unlock}`}
			</span>
		);
	}
	if (props.refusal !== undefined) {
		return (
			<span className={PRICE}>
				<Badge color={REFUSAL_COLOR}>{props.refusal}</Badge>
			</span>
		);
	}
	if (props.price === undefined) return null;
	return (
		<span className={PRICE}>
			<Badge>{props.price}</Badge>
		</span>
	);
};

const Body = (props: RegistryControlProps) => (
	<>
		<span aria-hidden className={CAP}>
			{props.locked === true ? LOCKED_GLYPH : props.glyph}
		</span>
		<span className={BODY}>
			<Typography variant="subtitle" as="span">
				{props.title}
			</Typography>
			<Typography variant="hint" as="span">
				{props.detail}
			</Typography>
		</span>
		<Trailing {...props} />
	</>
);

const hintOf = ({ title, price, refusal }: UnlockedRegistryControlProps) =>
	[title, price, refusal].filter((part) => part !== undefined).join(" · ");

export const RegistryControl = (props: RegistryControlProps) => {
	const boxed = (props.layout ?? "box") === "box";

	if (props.locked === true || props.onPress === undefined) {
		return (
			<div className={clsx(ROW, boxed && BOX)}>
				<Body {...props} />
			</div>
		);
	}

	return (
		<button
			type="button"
			aria-label={hintOf(props)}
			disabled={props.disabled === true || props.refusal !== undefined}
			onClick={props.onPress}
			className={clsx(ROW, boxed && BOX, PRESSABLE)}
		>
			<Body {...props} />
		</button>
	);
};

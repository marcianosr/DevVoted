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

const REFUSAL_COLOR = "cinnabar";

export type RegistryControlLayout = "box" | "row";

export type RegistryControlProps = {
	layout?: RegistryControlLayout;
	glyph: string;
	title: string;
	detail: string;
	price: string;
	refusal?: string;
	disabled?: boolean;
	onPress?: () => void;
};

const Body = ({
	glyph,
	title,
	detail,
	price,
	refusal,
}: RegistryControlProps) => (
	<>
		<span aria-hidden className={CAP}>
			{glyph}
		</span>
		<span className={BODY}>
			<Typography variant="subtitle" as="span">
				{title}
			</Typography>
			<Typography variant="hint" as="span">
				{detail}
			</Typography>
		</span>
		<span className={PRICE}>
			{refusal === undefined ? (
				<Badge>{price}</Badge>
			) : (
				<Badge color={REFUSAL_COLOR}>{refusal}</Badge>
			)}
		</span>
	</>
);

const hintOf = ({ title, price, refusal }: RegistryControlProps) =>
	[title, price, refusal].filter((part) => part !== undefined).join(" · ");

export const RegistryControl = (props: RegistryControlProps) => {
	const boxed = (props.layout ?? "box") === "box";

	if (props.onPress === undefined) {
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

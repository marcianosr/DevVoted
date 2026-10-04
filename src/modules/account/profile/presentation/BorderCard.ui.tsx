import { clsx } from "clsx";

import { formatStorage } from "~/shared/lib/storage";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";

export const COPY = {
	tryOn: (name: string) => `Try on ${name}`,
	pick: (name: string) => `Wear ${name}`,
	owned: "owned",
	orWinARun: "win a run, or",
	buy: (cost: number) => `Buy · ${formatStorage(cost)}`,
} as const;

const COST_COLOR = "saffron";

const CARD =
	"flex flex-col items-center gap-2 rounded-lg border border-theme-faint bg-theme-raised p-3";
const CARD_PICKED = "ring-2 ring-viridian";
const CARD_TRYING_ON =
	"outline-2 outline-offset-2 outline-dashed outline-fuchsia";
const PRESS =
	"flex w-full cursor-pointer flex-col items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2";
const FRAME = "flex aspect-square w-20 items-center justify-center";
const FRAME_LOCKED = "opacity-50";
const IMAGE = "max-h-full max-w-full";
const NAME = "w-full text-center text-xs font-bold";
const NAME_OWNED = "text-theme-soft";
const NAME_LOCKED = "text-theme-muted";
const OWNED = "text-xs font-bold text-viridian";
const WIN_PATH = "text-xs text-theme-muted";

export type BorderCardProps = {
	name: string;
	image: string;
	cost: number;
	owned: boolean;
	picked: boolean;
	canAfford: boolean;
	isMutating: boolean;
	tryingOn: boolean;
	earnedByVictory?: boolean;
	onPress: () => void;
	onBuy: () => void;
};

type StandingProps = Pick<
	BorderCardProps,
	"cost" | "owned" | "canAfford" | "isMutating" | "tryingOn" | "onBuy"
>;

const Standing = ({
	cost,
	owned,
	canAfford,
	isMutating,
	tryingOn,
	onBuy,
}: StandingProps) => {
	if (owned) return <span className={OWNED}>{COPY.owned}</span>;
	if (!tryingOn) return <Badge color={COST_COLOR}>{formatStorage(cost)}</Badge>;
	return (
		<Button
			size="sm"
			tone="action"
			label={COPY.buy(cost)}
			onPress={onBuy}
			disabled={isMutating || !canAfford}
		/>
	);
};

export const BorderCard = ({
	name,
	image,
	owned,
	picked,
	tryingOn,
	earnedByVictory = false,
	onPress,
	...standing
}: BorderCardProps) => (
	<div
		className={clsx(CARD, picked && CARD_PICKED, tryingOn && CARD_TRYING_ON)}
	>
		<button
			type="button"
			className={PRESS}
			aria-label={owned ? COPY.pick(name) : COPY.tryOn(name)}
			aria-pressed={owned ? picked : tryingOn}
			onClick={onPress}
		>
			<span className={clsx(FRAME, !owned && FRAME_LOCKED)}>
				<img src={image} alt="" className={IMAGE} />
			</span>
			<span className={clsx(NAME, owned ? NAME_OWNED : NAME_LOCKED)}>
				{name}
			</span>
		</button>
		{earnedByVictory && !owned ? (
			<span className={WIN_PATH}>{COPY.orWinARun}</span>
		) : null}
		<Standing owned={owned} tryingOn={tryingOn} {...standing} />
	</div>
);

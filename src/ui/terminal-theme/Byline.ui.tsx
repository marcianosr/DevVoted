import { Text } from "./Text.ui";

const BYLINE = "flex items-center gap-2 border-t border-edge pt-3";
const AVATAR = "relative size-8 shrink-0";
// Square, not round: border art is square (224px PNGs), so a circular crop
// would clip every frame the player bought.
const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-edge-strong bg-zinc-900 text-xs text-zinc-400";
const PHOTO = "size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full scale-120";

export type BylineProps = {
	handle: string;
	title?: string;
	avatarUrl?: string;
	borderUrl?: string;
};

const initialOf = (handle: string) =>
	(handle.replace(/^@/, "")[0] ?? "?").toUpperCase();

export const Byline = ({
	handle,
	title,
	avatarUrl,
	borderUrl,
}: BylineProps) => (
	<div className={BYLINE}>
		<span className={AVATAR}>
			<span aria-hidden className={FACE}>
				{avatarUrl === undefined ? (
					initialOf(handle)
				) : (
					<img src={avatarUrl} alt="" className={PHOTO} />
				)}
			</span>
			{borderUrl === undefined ? null : (
				<img src={borderUrl} alt="" aria-hidden className={FRAME} />
			)}
		</span>
		<Text tone="muted" size="caption">
			Created by {handle}
			{title === undefined ? null : ` · ${title}`}
		</Text>
	</div>
);

import { clsx } from "clsx";

export type AvatarChipSize = "sm" | "md";

const CHIP = "relative inline-block shrink-0";
const SIZE = {
	sm: "size-6",
	md: "size-8",
} satisfies Record<AvatarChipSize, string>;
const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-edge-strong bg-zinc-900 text-zinc-400";
const FACE_TEXT = {
	sm: "text-[10px]",
	md: "text-xs",
} satisfies Record<AvatarChipSize, string>;
const PHOTO = "size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full scale-120";
const YOU = "ring-2 ring-cerulean";
const DIMMED = "opacity-40 grayscale";
const GHOST = "opacity-60";
const GHOST_FACE = "border-dashed border-zinc-500";

export type AvatarChipProps = {
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
	size?: AvatarChipSize;
	dimmed?: boolean;
	ghost?: boolean;
	className?: string;
};

export const initialsOf = (name: string): string => {
	const words = name.replace(/^@/, "").trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "?";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const AvatarChip = ({
	name,
	photoUrl,
	borderUrl,
	you,
	size = "md",
	dimmed,
	ghost,
	className,
}: AvatarChipProps) => (
	<span
		role="img"
		aria-label={name}
		title={name}
		className={clsx(
			CHIP,
			SIZE[size],
			dimmed === true && DIMMED,
			ghost === true && GHOST,
			className
		)}
	>
		<span
			aria-hidden
			className={clsx(
				FACE,
				FACE_TEXT[size],
				you === true && YOU,
				ghost === true && GHOST_FACE
			)}
		>
			{photoUrl === undefined ? (
				initialsOf(name)
			) : (
				<img src={photoUrl} alt="" className={PHOTO} />
			)}
		</span>
		{borderUrl === undefined ? null : (
			<img src={borderUrl} alt="" aria-hidden className={FRAME} />
		)}
	</span>
);

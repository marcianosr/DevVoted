import { clsx } from "clsx";

import { findBorderById } from "~/domains/economy/data/borders";

export type AvatarUser = {
	id: string;
	displayName?: string | null;
	photoUrl?: string | null;
	equippedBorderId?: string | null;
};

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = {
	user: AvatarUser;
	size?: AvatarSize;
	/** 'square' enables the equipped-border overlay (border art is square). */
	shape?: "square" | "circle";
	/** Drop the native title — for callers wrapping the avatar in a Tooltip. */
	noTitle?: boolean;
};

const KANTO_COLORS = [
	"bg-pallet",
	"bg-viridian",
	"bg-pewter",
	"bg-cerulean",
	"bg-vermillion",
	"bg-lavender",
	"bg-celadon",
	"bg-fuchsia",
	"bg-saffron",
	"bg-cinnabar",
	"bg-indigo",
	"bg-seafoam",
] as const;

const SIZE_CLASSES: Record<AvatarSize, string> = {
	xs: "w-5 h-5 text-[10px]",
	sm: "w-6 h-6 text-xs",
	md: "w-10 h-10 text-sm",
	lg: "w-16 h-16 text-xl",
	xl: "w-24 h-24 text-2xl",
	"2xl": "w-32 h-32 text-3xl",
};

const getColorFromString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return KANTO_COLORS[Math.abs(hash) % KANTO_COLORS.length];
};

export const Avatar = ({
	user,
	size = "sm",
	shape = "circle",
	noTitle = false,
}: AvatarProps) => {
	const name = user.displayName ?? user.id;
	const initial = name.charAt(0).toUpperCase();
	const colorClass = getColorFromString(user.id);

	const border =
		shape === "square" && user.equippedBorderId
			? findBorderById(user.equippedBorderId)
			: undefined;

	const rounding = shape === "circle" ? "rounded-full" : "";
	const wrapper = clsx("relative inline-block shrink-0", SIZE_CLASSES[size]);

	return (
		<div className={wrapper} title={noTitle ? undefined : name}>
			<div className={clsx("absolute inset-0 overflow-hidden", rounding)}>
				{user.photoUrl ? (
					<img
						src={user.photoUrl}
						alt={name}
						className="w-full h-full object-cover"
					/>
				) : (
					<span
						className={clsx(
							"w-full h-full inline-flex items-center justify-center text-white",
							colorClass
						)}
					>
						{initial}
					</span>
				)}
			</div>
			{border && (
				<img
					src={border.image}
					alt="Cool border"
					aria-hidden="true"
					className="absolute inset-0 scale-120 w-full h-full pointer-events-none"
				/>
			)}
		</div>
	);
};

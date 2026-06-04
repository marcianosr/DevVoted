import { clsx } from "clsx";

import { findBorderById } from "~/domains/economy/data/borders";

type AvatarWithBorderProps = {
	photoUrl: string | null | undefined;
	displayName: string;
	borderId: string | null;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
};

// Wrapper holds both the avatar and the border. The border art fills the
// wrapper exactly (no scale-up), so it never bleeds into adjacent content.
// The avatar itself sits inset so the border decoration has room to "surround"
// it visually within the same bounding box.
const sizeClasses = {
	xs: "w-6 h-6 text-[10px]",
	sm: "w-10 h-10 text-xs",
	md: "w-16 h-16 text-xl",
	lg: "w-24 h-24 text-2xl",
	xl: "w-32 h-32 text-3xl",
};

const avatarInsetClass = "inset-[12%]";

export const AvatarWithBorder = ({
	photoUrl,
	displayName,
	borderId,
	size = "lg",
}: AvatarWithBorderProps) => {
	const border = borderId ? findBorderById(borderId) : undefined;
	const initial = displayName.charAt(0).toUpperCase();

	// Without a border: circular avatar fills the wrapper (classic style).
	// With a border: the border art defines the outer shape, so the avatar
	// becomes a square inset that fills the frame's interior — no rounding.
	const avatarPositionClass = border
		? clsx("absolute", avatarInsetClass)
		: "w-full h-full";
	const avatarShapeClass = border ? "" : "rounded-full";

	return (
		<div className={clsx("relative inline-block shrink-0", sizeClasses[size])}>
			{photoUrl ? (
				<img
					src={photoUrl}
					alt={displayName}
					className={clsx(
						avatarPositionClass,
						avatarShapeClass,
						"object-cover"
					)}
				/>
			) : (
				<span
					className={clsx(
						avatarPositionClass,
						avatarShapeClass,
						"bg-cyan-700 inline-flex items-center justify-center text-white"
					)}
				>
					{initial}
				</span>
			)}
			{border && (
				<img
					src={border.image}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 w-full h-full pointer-events-none"
				/>
			)}
		</div>
	);
};

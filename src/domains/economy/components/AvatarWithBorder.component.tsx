import { clsx } from "clsx";

import { findBorderById } from "~/domains/economy/data/borders";

type AvatarWithBorderProps = {
	photoUrl: string | null | undefined;
	displayName: string;
	borderId: string | null;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
};

// Wrapper holds both the avatar and the border. The border art fills the
// wrapper exactly and layers on top of the avatar — border art is expected to
// have a transparent center, so the avatar shows through and only the painted
// frame is visible at the edges.
const sizeClasses = {
	xs: "w-6 h-6 text-[10px]",
	sm: "w-10 h-10 text-xs",
	md: "w-16 h-16 text-xl",
	lg: "w-24 h-24 text-2xl",
	xl: "w-32 h-32 text-3xl",
};

export const AvatarWithBorder = ({
	photoUrl,
	displayName,
	borderId,
	size = "lg",
}: AvatarWithBorderProps) => {
	const border = borderId ? findBorderById(borderId) : undefined;
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<div className={clsx("relative inline-block shrink-0", sizeClasses[size])}>
			<div className="absolute inset-0 overflow-hidden">
				{photoUrl ? (
					<img
						src={photoUrl}
						alt={displayName}
						className="w-full h-full object-cover"
					/>
				) : (
					<span className="w-full h-full bg-cyan-700 inline-flex items-center justify-center text-white">
						{initial}
					</span>
				)}
			</div>
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

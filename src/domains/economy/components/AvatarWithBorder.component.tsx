import { clsx } from "clsx";

import { findBorderById } from "~/domains/economy/data/borders";

type AvatarWithBorderProps = {
	photoUrl: string | null | undefined;
	displayName: string;
	borderId: string | null;
	size?: "md" | "lg" | "xl";
};

const sizeClasses = {
	md: "w-16 h-16",
	lg: "w-24 h-24",
	xl: "w-32 h-32",
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
		<div className={clsx("relative inline-block", sizeClasses[size])}>
			{photoUrl ? (
				<img
					src={photoUrl}
					alt={displayName}
					className="w-full h-full rounded-full object-cover"
				/>
			) : (
				<span className="w-full h-full rounded-full bg-cyan-700 inline-flex items-center justify-center text-white text-2xl">
					{initial}
				</span>
			)}
			{border && (
				<img
					src={border.image}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 w-full h-full pointer-events-none scale-125"
				/>
			)}
		</div>
	);
};

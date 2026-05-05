import { clsx } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";

import { CommunityStatsUser } from "~/domains/polls/api/communityStats.queries";

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

const getColorFromString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % KANTO_COLORS.length;
	return KANTO_COLORS[index];
};

type UserAvatarProps = {
	user: CommunityStatsUser;
	size?: "sm" | "md" | "lg";
};

const formatTimeTaken = (ms: number | null | undefined): string | null => {
	if (ms === null || ms === undefined) return null;

	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

const sizeClasses = {
	sm: "w-6 h-6 text-xs",
	md: "w-8 h-8 text-sm",
	lg: "w-10 h-10 text-base",
};

const UserAvatar = ({ user, size = "sm" }: UserAvatarProps) => {
	const initial = (user.displayName || user.id).charAt(0).toUpperCase();
	const colorClass = getColorFromString(user.id);
	const timeTaken = formatTimeTaken(user.timeTakenMs);
	const title = timeTaken
		? `${user.displayName} - ${timeTaken}`
		: user.displayName;

	const baseStyles = clsx("inline-block rounded-full", sizeClasses[size], {});

	if (user.photoUrl) {
		return (
			<img
				src={user.photoUrl}
				alt={user.displayName || "User avatar"}
				title={title}
				className={baseStyles}
			/>
		);
	}

	return (
		<span
			className={clsx(
				baseStyles,
				colorClass,
				"inline-flex items-center justify-center text-white"
			)}
			title={title}
		>
			{initial}
		</span>
	);
};

export default UserAvatar;

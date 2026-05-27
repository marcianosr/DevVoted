import { formatDistanceToNow } from "date-fns";

type PollLastSeenBadgeProps = {
	lastSeenAt: Date | null;
};

const formatLastSeen = (lastSeenAt: Date | null): string => {
	if (!lastSeenAt) return "Last seen: Never";
	return `Last seen ${formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true })}`;
};

export const PollLastSeenBadge = ({ lastSeenAt }: PollLastSeenBadgeProps) => (
	<p className="text-sm text-gray-400">{formatLastSeen(lastSeenAt)}</p>
);

import { formatDistanceToNow } from "date-fns";

type PollLastSeenBadgeProps = {
	lastSeenAt: string | null;
	lastEncounteredAt: Date | null;
	timesEncountered: number;
};

const formatDate = (date: Date | string | null): string => {
	if (!date) return "Never";
	return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const PollLastSeenBadge = ({
	lastSeenAt,
	lastEncounteredAt,
	timesEncountered,
}: PollLastSeenBadgeProps) => (
	<div className="text-sm text-gray-400">
		<p>Last seen: {formatDate(lastSeenAt)}</p>
		<p>Last encountered by you: {formatDate(lastEncounteredAt)}</p>
		<p>Times encountered: {timesEncountered}</p>
	</div>
);

import { formatDistanceToNow } from "date-fns";

type PollLastSeenBadgeProps = {
	lastSeenAt: string | null;
	lastEncounteredAt: Date | null;
	timesEncountered: number;
};

const toDate = (date: Date | string): Date => {
	if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
		// Date-only strings parse as midnight UTC, causing off-by-one-day errors in
		// non-UTC timezones. Noon UTC keeps us well clear of both day boundaries.
		return new Date(`${date}T12:00:00Z`);
	}
	return new Date(date);
};

const formatDate = (date: Date | string | null): string => {
	if (!date) return "Never";
	return formatDistanceToNow(toDate(date), { addSuffix: true });
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

import { NEW_BADGE } from "~/shared/lib/copy";

import { Badge } from "./Badge.ui";

export const NewBadge = () => (
	<Badge color={NEW_BADGE.color}>{NEW_BADGE.label}</Badge>
);

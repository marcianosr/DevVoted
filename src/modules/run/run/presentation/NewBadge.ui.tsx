import { NEW_BADGE } from "~/shared/lib/copy";

import { Badge } from "~/ui/kanto-theme/Badge.ui";

export const NewBadge = () => (
	<Badge color={NEW_BADGE.color}>{NEW_BADGE.label}</Badge>
);

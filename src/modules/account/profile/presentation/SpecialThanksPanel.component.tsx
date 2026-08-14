import { useQuery } from "@tanstack/react-query";

import { getUsersByDisplayNames } from "~/modules/account/profile/application/profile.serverfn";
import { CreditList } from "~/modules/account/profile/presentation/CreditList.ui";

const SPECIAL_THANKS = ["Matthijs Groen", "Piet de Vries", "Sander van Maurik"];

/**
 * Tier 2: fetches the credited people. Client-side rather than in the stats
 * route's loader, so the route can stay a mount-and-stop file; this list is
 * credits, not critical-path content.
 */
export const SpecialThanksPanel = () => {
	const { data } = useQuery({
		queryKey: ["special-thanks"],
		queryFn: () =>
			getUsersByDisplayNames({ data: { displayNames: SPECIAL_THANKS } }),
	});

	if (!data?.length) return null;

	return <CreditList title="Special thanks to" people={data} />;
};

import { useNavigate } from "@tanstack/react-router";

import type { RunLinkPath } from "~/modules/run/run/application/runRoutes.viewmodel";

export const useRunNavigation = () => {
	const navigate = useNavigate();

	return (path: RunLinkPath | null) => {
		if (path !== null) navigate({ to: path });
	};
};

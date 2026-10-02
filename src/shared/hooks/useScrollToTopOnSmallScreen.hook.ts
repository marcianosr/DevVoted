import { useEffect } from "react";

import { isSmallScreen } from "~/shared/hooks/useIsSmallScreen.hook";

export const useScrollToTopOnSmallScreen = (screenKey: string | undefined) => {
	useEffect(() => {
		if (isSmallScreen()) window.scrollTo({ top: 0 });
	}, [screenKey]);
};

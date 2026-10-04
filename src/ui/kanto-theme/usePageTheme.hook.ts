import { createContext, useContext, useEffect } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { KantoColor } from "./colors";

export type PageTheme = {
	theme?: KantoColor;
	gate?: SwatchTheme;
};

export const UNTHEMED_PAGE: KantoColor = "pewter";

const EMPTY_PAGE: PageTheme = {};

export const PageThemeContext = createContext<(page: PageTheme) => void>(
	() => undefined
);

type PageThemeAttributes = {
	"data-screen-theme"?: KantoColor;
	"data-gate-theme"?: SwatchTheme;
};

export const pageThemeAttributes = ({
	theme,
	gate,
}: PageTheme): PageThemeAttributes =>
	gate === undefined
		? { "data-screen-theme": theme ?? UNTHEMED_PAGE }
		: { "data-gate-theme": gate };

export const usePageTheme = ({ theme, gate }: PageTheme): void => {
	const publish = useContext(PageThemeContext);

	useEffect(() => {
		publish({ theme, gate });
		return () => publish(EMPTY_PAGE);
	}, [publish, theme, gate]);
};

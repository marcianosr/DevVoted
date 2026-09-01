import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Swatch, type SwatchState } from "./Swatch.ui";
import { Text } from "./Text.ui";

const HEADER =
	"flex items-start justify-between gap-4 border-b border-edge pb-3";
const NAMING = "flex min-w-0 items-start gap-3";
const TITLES = "flex min-w-0 flex-col gap-0.5";
const FIGURE = "flex shrink-0 flex-col items-end gap-0.5 text-right";

export type HeaderProps = {
	title: string;
	subtitle?: string;
	swatch?: SwatchTheme;
	swatchState?: SwatchState;
	value?: string;
	caption?: string;
};

export const Header = ({
	title,
	subtitle,
	swatch,
	swatchState = "earned",
	value,
	caption,
}: HeaderProps) => (
	<header className={HEADER}>
		<div className={NAMING}>
			{swatch === undefined && swatchState === "earned" ? null : (
				<Swatch
					theme={swatch}
					state={swatchState}
					size="badge"
					className="mt-1"
				/>
			)}
			<div className={TITLES}>
				<Text size="title" className="font-bold">
					{title}
				</Text>
				{subtitle === undefined ? null : <Text tone="muted">{subtitle}</Text>}
			</div>
		</div>
		{value === undefined ? null : (
			<div className={FIGURE}>
				<Text size="title" className="font-bold">
					{value}
				</Text>
				{caption === undefined ? null : <Text tone="muted">{caption}</Text>}
			</div>
		)}
	</header>
);

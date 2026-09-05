import type { ReactNode } from "react";

import { Button } from "./Button.ui";
import { Text } from "./Text.ui";

const LINE = "flex flex-wrap items-center gap-3 pt-2";
const DETAIL = "min-w-0 flex-1";

export type BuyLineProps = {
	label: string;
	detail?: string;
	icon?: ReactNode;
	price?: string;
	lock?: string;
	onBuy?: () => void;
};

export const BuyLine = ({
	label,
	detail,
	icon,
	price,
	lock,
	onBuy,
}: BuyLineProps) => (
	<div className={LINE}>
		{detail === undefined ? null : (
			<Text tone="muted" size="caption" className={DETAIL}>
				{detail}
			</Text>
		)}
		{price === undefined ? null : (
			<Button
				label={label}
				icon={icon}
				price={price}
				hint={lock}
				disabled={onBuy === undefined}
				className="ml-auto"
				onUse={onBuy}
			/>
		)}
	</div>
);

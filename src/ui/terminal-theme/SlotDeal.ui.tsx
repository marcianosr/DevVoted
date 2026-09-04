import { IconButton } from "./IconButton.ui";
import { PriceTag } from "./PriceTag.ui";
import { Row } from "./Row.ui";

const BUY_ICON = "+";
const CASH_ICON = "−";

export type SlotDealRow = {
	name: string;
	detail?: string;
	price?: string;
	label: string;
	receives?: boolean;
	onUse?: () => void;
};

const priceVariant = (row: SlotDealRow) => {
	if (row.receives === true) return "receive" as const;
	return row.onUse === undefined ? ("short" as const) : ("pay" as const);
};

export const SlotDeal = ({ row }: { row: SlotDealRow }) => (
	<Row
		name={row.name}
		detail={row.detail}
		trailing={
			<>
				{row.price === undefined ? null : (
					<PriceTag label={row.price} variant={priceVariant(row)} />
				)}
				<IconButton
					icon={row.receives === true ? CASH_ICON : BUY_ICON}
					label={row.label}
					hint={[row.label, row.price]
						.filter((part) => part !== undefined)
						.join(" · ")}
					tone={row.receives === true ? "cinnabar" : "viridian"}
					iconOnly
					disabled={row.onUse === undefined}
					onUse={row.onUse}
				/>
			</>
		}
	/>
);

import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const FLOOR = "min-w-0 flex-1";

export type EstimateCard = {
	count: number;
	floor: string;
	payout: string;
};

export type EstimatePickerProps = {
	label: string;
	hint: string;
	cards: readonly EstimateCard[];
	committed: number | null;
	onPick?: (count: number) => void;
	refusal?: string;
};

const Card = ({
	card,
	committed,
	onPick,
}: {
	card: EstimateCard;
	committed: number | null;
	onPick?: (count: number) => void;
}) => {
	const armed = committed === card.count;
	if (onPick === undefined)
		return <Badge color={armed ? "saffron" : undefined}>{card.count}</Badge>;

	return (
		<Badge armed={armed} onPress={() => onPick(card.count)}>
			{card.count}
		</Badge>
	);
};

export const EstimatePicker = ({
	label,
	hint,
	cards,
	committed,
	onPick,
	refusal,
}: EstimatePickerProps) => (
	<Panel>
		<Panel.Header label={label} />

		<Panel.Body>
			<Typography variant="hint">{hint}</Typography>
		</Panel.Body>

		<Panel.Rows>
			{cards.map((card) => (
				<Panel.Row
					key={card.count}
					trailing={<Badge color="viridian">{card.payout}</Badge>}
				>
					<span className={ROW}>
						<Card card={card} committed={committed} onPick={onPick} />
						<span className={FLOOR}>
							<Typography variant="caption">{card.floor}</Typography>
						</span>
					</span>
				</Panel.Row>
			))}
		</Panel.Rows>

		{refusal === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{refusal}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);

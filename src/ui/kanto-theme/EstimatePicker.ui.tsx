import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const FLOOR = "min-w-0 flex-1";

export type EstimateCard = {
	count: number;
	/** The bet in words, e.g. "at least 3 of 5". */
	floor: string;
	/** What it pays if the window meets it, already resolved by the engine. */
	payout: string;
};

export type EstimatePickerProps = {
	label: string;
	hint: string;
	cards: readonly EstimateCard[];
	committed: number | null;
	/** Absent once the bet is locked, which is the moment the gate starts. */
	onPick?: (count: number) => void;
	/**
	 * Why no card can be picked. Visible text rather than a `hint`, because a
	 * `hint` is an aria-label and a refusal nobody can see is not a refusal.
	 */
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

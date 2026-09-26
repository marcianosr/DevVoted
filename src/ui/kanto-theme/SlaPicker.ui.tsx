import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const TERMS = "min-w-0 flex-1";

export type SlaCard = {
	band: string;
	label: string;
	terms: string;
	uplift: string;
};

export type SlaPickerProps = {
	label: string;
	hint: string;
	cards: readonly SlaCard[];
	committed: string | null;
	onPick?: (band: string) => void;
	refusal?: string;
};

const Card = ({
	card,
	committed,
	onPick,
}: {
	card: SlaCard;
	committed: string | null;
	onPick?: (band: string) => void;
}) => {
	const armed = committed === card.band;
	if (onPick === undefined)
		return <Badge color={armed ? "saffron" : undefined}>{card.label}</Badge>;

	return (
		<Badge armed={armed} onPress={() => onPick(card.band)}>
			{card.label}
		</Badge>
	);
};

export const SlaPicker = ({
	label,
	hint,
	cards,
	committed,
	onPick,
	refusal,
}: SlaPickerProps) => (
	<Panel>
		<Panel.Header label={label} />

		<Panel.Body>
			<Typography variant="hint">{hint}</Typography>
		</Panel.Body>

		<Panel.Rows>
			{cards.map((card) => (
				<Panel.Row
					key={card.band}
					trailing={<Badge color="viridian">{card.uplift}</Badge>}
				>
					<span className={ROW}>
						<Card card={card} committed={committed} onPick={onPick} />
						<span className={TERMS}>
							<Typography variant="caption">{card.terms}</Typography>
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

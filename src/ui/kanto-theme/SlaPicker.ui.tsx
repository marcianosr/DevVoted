import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const TERMS = "min-w-0 flex-1";

export type SlaCard = {
	/** The band's own id, which is what the press commits. */
	band: string;
	/** The band as the ladder spells it, e.g. "HEALTHY". */
	label: string;
	/** What the promise is worth in words, e.g. "close at HEALTHY or better". */
	terms: string;
	/** The uplift it pays, already resolved by the engine. */
	uplift: string;
};

export type SlaPickerProps = {
	label: string;
	hint: string;
	cards: readonly SlaCard[];
	committed: string | null;
	/** Absent once the promise is locked, which is the moment the gate starts. */
	onPick?: (band: string) => void;
	/**
	 * Why no band can be promised. Visible text rather than a `hint`, because a
	 * `hint` is an aria-label and a refusal nobody can see is not a refusal.
	 */
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

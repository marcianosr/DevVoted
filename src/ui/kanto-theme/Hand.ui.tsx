import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const LIST = "flex w-full flex-col gap-3";

const TITLE = "Dealt";

const summaryOf = (left: number) => `${left} left in the hand`;

export type HandProps = {
	cards: readonly ConfigChipProps[];
	left: number;
	note?: string;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
};

const Card = ({
	card,
	openInfo,
	onToggleInfo,
}: {
	card: ConfigChipProps;
	openInfo?: string;
	onToggleInfo?: (name: string) => void;
}) => {
	if (card.locked === true) return <ConfigChip locked />;

	return (
		<ConfigChip
			{...card}
			width="full"
			infoOpen={card.name === openInfo}
			onToggleInfo={
				onToggleInfo === undefined ? undefined : () => onToggleInfo(card.name)
			}
		/>
	);
};

export const Hand = ({
	cards,
	left,
	note,
	openInfo,
	onToggleInfo,
}: HandProps) => (
	<section className={COLUMN}>
		<div className={TITLE_ROW}>
			<Typography variant="title">{TITLE}</Typography>
			<Typography variant="hint" as="span">
				{summaryOf(left)}
			</Typography>
		</div>

		<div className={LIST}>
			{cards.map((card, index) => (
				<Card
					key={card.name ?? index}
					card={card}
					openInfo={openInfo}
					onToggleInfo={onToggleInfo}
				/>
			))}
		</div>

		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</section>
);

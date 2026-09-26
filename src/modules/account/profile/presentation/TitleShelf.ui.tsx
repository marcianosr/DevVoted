import { DexPanel } from "~/ui/kanto-theme/DexPanel.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	label: "titles earned",
	worn: (worn: number, cap: number) => `${worn} of ${cap} worn`,
	note: "A title is earned by playing and is yours permanently, even if the record that won it stops being true. Wear as many as the card holds; the first one you wear is the one other screens show.",
	wear: "Wear",
	takeOff: "Take off",
	locked: "Locked",
	none: "No titles earned yet. The lines below are the bars.",
} as const;

const NAME = "min-w-0 flex-1";
const EARNED_NAME = "block text-sm font-bold text-theme-soft";
const LOCKED_NAME = "block text-sm font-bold text-theme-muted";
const ERROR = "text-sm text-cinnabar";

export type TitleRowProps = {
	name: string;
	earnedWhen: string;
	earned: boolean;
	equipped: boolean;
	isMutating: boolean;
	blocked: boolean;
	onPress: () => void;
};

export type TitleShelfProps = {
	rows: readonly (TitleRowProps & { id: string })[];
	held: string;
	worn: number;
	cap: number;
	error?: string;
};

const TitleRow = ({
	name,
	earnedWhen,
	earned,
	equipped,
	isMutating,
	blocked,
	onPress,
}: TitleRowProps) => (
	<Panel.Row
		theme={equipped ? "viridian" : undefined}
		trailing={
			earned ? (
				<Button
					size="sm"
					tone={equipped ? "ambient" : "action"}
					label={equipped ? COPY.takeOff : COPY.wear}
					onPress={onPress}
					disabled={isMutating || blocked}
				/>
			) : (
				<Badge>{COPY.locked}</Badge>
			)
		}
	>
		<span className={NAME}>
			<span className={earned ? EARNED_NAME : LOCKED_NAME}>{name}</span>
			<Typography variant="hint" as="span">
				{earnedWhen}
			</Typography>
		</span>
	</Panel.Row>
);

export const TitleShelf = ({
	rows,
	held,
	worn,
	cap,
	error,
}: TitleShelfProps) => (
	<DexPanel
		label={COPY.label}
		count={held}
		meta={COPY.worn(worn, cap)}
		note={COPY.note}
	>
		<Panel.Rows>
			{rows.map(({ id, ...row }) => (
				<TitleRow key={id} {...row} />
			))}
		</Panel.Rows>
		{rows.some((row) => row.earned) ? null : (
			<Panel.Body>
				<Typography variant="hint" as="p">
					{COPY.none}
				</Typography>
			</Panel.Body>
		)}
		{error === undefined ? null : (
			<Panel.Body>
				<span className={ERROR}>{error}</span>
			</Panel.Body>
		)}
	</DexPanel>
);

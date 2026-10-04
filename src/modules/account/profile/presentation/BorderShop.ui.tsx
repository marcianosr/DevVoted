import {
	BorderCard,
	type BorderCardProps,
} from "~/modules/account/profile/presentation/BorderCard.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	label: "Borders",
	note: "Tap a locked border to try it in the preview, then buy it with archived storage.",
} as const;

const ARCHIVE_COLOR = "saffron";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";
const ERROR = "text-sm text-cinnabar";

export type BorderShopProps = {
	cards: readonly (BorderCardProps & { id: string })[];
	held: string;
	archive: string;
	error?: string;
};

export const BorderShop = ({
	cards,
	held,
	archive,
	error,
}: BorderShopProps) => (
	<Panel>
		<Panel.Header
			label={COPY.label}
			meta={
				<>
					<Badge>{held}</Badge>
					<Badge color={ARCHIVE_COLOR}>{archive}</Badge>
				</>
			}
		/>
		<Panel.Body>
			<Typography variant="hint">{COPY.note}</Typography>
			<div className={GRID}>
				{cards.map(({ id, ...card }) => (
					<BorderCard key={id} {...card} />
				))}
			</div>
			{error === undefined ? null : <span className={ERROR}>{error}</span>}
		</Panel.Body>
	</Panel>
);

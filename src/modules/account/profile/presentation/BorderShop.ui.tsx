import {
	BorderCard,
	type BorderCardProps,
} from "~/modules/account/profile/presentation/BorderCard.ui";
import { DexPanel } from "~/ui/kanto-theme/DexPanel.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	label: "borders owned",
	meta: "bought with archived storage",
	note: "Press a border to try it on in the preview. Buying it spends archived storage; wearing it shows it to everyone.",
} as const;

const GRID = "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4";
const ERROR = "text-sm text-cinnabar";

export type BorderShopProps = {
	cards: readonly (BorderCardProps & { id: string })[];
	held: string;
	error?: string;
};

export const BorderShop = ({ cards, held, error }: BorderShopProps) => (
	<DexPanel label={COPY.label} count={held} meta={COPY.meta} note={COPY.note}>
		<Panel.Body>
			<div className={GRID}>
				{cards.map(({ id, ...card }) => (
					<BorderCard key={id} {...card} />
				))}
			</div>
			{error === undefined ? null : (
				<Typography variant="hint" as="p">
					<span className={ERROR}>{error}</span>
				</Typography>
			)}
		</Panel.Body>
	</DexPanel>
);

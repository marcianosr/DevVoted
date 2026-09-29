import { Badge } from "~/ui/kanto-theme/Badge.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Icon, type IconName } from "~/ui/kanto-theme/Icon.ui";
import { Modal } from "~/ui/kanto-theme/Modal.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { ScreenFooter } from "~/ui/kanto-theme/ScreenFooter.ui";
import {
	Typography,
	type TypographyVariant,
} from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	label: "Titles granted",
	heading: "Thank you for playing",
	intro: "You played before the rebuild. Thanks for sticking around.",
	titleGain: "+ title",
	archivedStorage: "Archived storage",
	kept: "history kept",
	rules: "new runs use the current rules",
	archivedRun: (on: string) => `run from ${on} archived`,
	wearOne: "Wear the title",
	wearMany: "Wear the titles",
	close: "Close",
	later: "Later",
} as const;

const MODAL_THEME: KantoColor = "cerulean";
const GAIN: KantoColor = "viridian";
const TITLE_ICON: IconName = "star";
const STORAGE_ICON: IconName = "floppy";
const TITLE_NAME: TypographyVariant = "accent";
const STORAGE_NAME: TypographyVariant = "subtitle";
const SEPARATOR = " · ";

const TILE =
	"flex size-7 shrink-0 items-center justify-center rounded-md bg-theme-raised text-theme";

export type GrantedTitle = { id: string; name: string; worn: boolean };

export type TitleGrantModalProps = {
	titles: readonly GrantedTitle[];
	archiveBonus?: string;
	archivedOn?: string;
	wears: number;
	note?: string;
	isMutating?: boolean;
	onWear: () => void;
	onDismiss: () => void;
};

const pressLabelFor = (count: number): string =>
	count === 0 ? COPY.close : count === 1 ? COPY.wearOne : COPY.wearMany;

const footerLineFor = (archivedOn?: string): string =>
	[
		COPY.kept,
		...(archivedOn === undefined ? [] : [COPY.archivedRun(archivedOn)]),
		COPY.rules,
	].join(SEPARATOR);

type RewardRowProps = {
	icon: IconName;
	name: string;
	variant: TypographyVariant;
	gain: string;
};

const RewardRow = ({ icon, name, variant, gain }: RewardRowProps) => (
	<Panel.Row trailing={<Badge color={GAIN}>{gain}</Badge>}>
		<span aria-hidden className={TILE}>
			<Icon name={icon} />
		</span>
		<Typography variant={variant} as="span">
			{name}
		</Typography>
	</Panel.Row>
);

export const TitleGrantModal = ({
	titles,
	archiveBonus,
	archivedOn,
	wears,
	note,
	isMutating = false,
	onWear,
	onDismiss,
}: TitleGrantModalProps) => {
	const unworn = titles.filter((title) => !title.worn).length;
	const atCap = wears === 0 && unworn > 0;
	const shut = isMutating || atCap;
	const pressLabel = pressLabelFor(atCap ? unworn : wears);
	const pressHandler = wears === 0 ? onDismiss : onWear;

	return (
		<Modal
			label={COPY.label}
			heading={COPY.heading}
			theme={MODAL_THEME}
			onDismiss={onDismiss}
		>
			<Typography variant="caption" as="p">
				{COPY.intro}
			</Typography>

			<Panel>
				<Panel.Rows>
					{titles.map((title) => (
						<RewardRow
							key={title.id}
							icon={TITLE_ICON}
							name={title.name}
							variant={TITLE_NAME}
							gain={COPY.titleGain}
						/>
					))}
					{archiveBonus === undefined ? null : (
						<RewardRow
							icon={STORAGE_ICON}
							name={COPY.archivedStorage}
							variant={STORAGE_NAME}
							gain={`+ ${archiveBonus}`}
						/>
					)}
				</Panel.Rows>
				<Panel.Footer>
					<Typography variant="hint" as="span">
						<Icon name="tick" /> {footerLineFor(archivedOn)}
					</Typography>
				</Panel.Footer>
			</Panel>

			<ScreenFooter
				action={{
					label: pressLabel,
					mark: "dashed",
					onPress: shut ? undefined : pressHandler,
				}}
				asides={[
					{ label: COPY.later, onPress: isMutating ? undefined : onDismiss },
				]}
				note={note}
				rule={false}
			/>
		</Modal>
	);
};

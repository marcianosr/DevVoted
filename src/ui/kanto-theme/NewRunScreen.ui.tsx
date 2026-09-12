import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import { Build, type BuildProps } from "./Build.ui";
import { Hand, type HandProps } from "./Hand.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const BUILD_LAYOUT = "column";
const OUTCOMES_LAYOUT = "stacked";

export type NewRunScreenProps = {
	header: HeaderProps;
	build: BuildProps;
	hand: HandProps;
	outcomes: BandOutcomesProps;
	footer: ScreenFooterProps;
	buildNote?: string;
	width?: ScreenWidth;
};

export const NewRunScreen = ({
	header,
	build,
	hand,
	outcomes,
	footer,
	buildNote,
	width = "wide",
}: NewRunScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<Header {...header} />

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<Hand {...hand} />
				<Build {...build} layout={BUILD_LAYOUT} list={false} />
				{buildNote === undefined ? null : (
					<Typography variant="hint">{buildNote}</Typography>
				)}
			</div>

			<div className={COLUMN}>
				<Build
					{...build}
					layout={BUILD_LAYOUT}
					heading={false}
					readout={false}
				/>
				<BandOutcomes {...outcomes} layout={OUTCOMES_LAYOUT} />
			</div>
		</div>

		<ScreenFooter {...footer} />
	</Screen>
);

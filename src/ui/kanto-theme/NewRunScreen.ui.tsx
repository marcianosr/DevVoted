import { Build, type BuildProps } from "./Build.ui";
import { Hand, type HandProps } from "./Hand.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full flex-col gap-3";

export type NewRunScreenProps = {
	header: HeaderProps;
	build: BuildProps;
	hand: HandProps;
	footer: ScreenFooterProps;
	buildNote?: string;
	width?: ScreenWidth;
};

export const NewRunScreen = ({
	header,
	build,
	hand,
	footer,
	buildNote,
	width = "wide",
}: NewRunScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<Header {...header} />

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<Build {...build} layout="column" />
				{buildNote === undefined ? null : (
					<Typography variant="hint">{buildNote}</Typography>
				)}
			</div>

			<Hand {...hand} />
		</div>

		<ScreenFooter {...footer} />
	</Screen>
);

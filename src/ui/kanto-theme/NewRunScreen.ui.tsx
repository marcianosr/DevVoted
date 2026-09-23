import { BUILD, REGISTRY } from "~/shared/lib/copy";
import { Build, buildSummaryOf, type BuildProps } from "./Build.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Panel } from "./Panel.ui";
import { Registry, RegistrySummary, type RegistryProps } from "./Registry.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const BUILD_LAYOUT = "column";

export type NewRunScreenProps = {
	header: HeaderProps;
	build: BuildProps;
	registry: RegistryProps;
	footer: ScreenFooterProps;
	buildNote?: string;
	registryNote?: string;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

export const NewRunScreen = ({
	header,
	build,
	registry,
	footer,
	buildNote,
	registryNote,
	width,
	ground = "bare",
}: NewRunScreenProps) => {
	const dealt: BuildProps = {
		...build,
		layout: BUILD_LAYOUT,
		heading: false,
		configCount: false,
		emptySlots: false,
		caption: false,
	};

	return (
		<Screen gate={header.swatch.theme} width={width} ground={ground}>
			<Header {...header} />

			<div className={COLUMNS}>
				<div className={COLUMN}>
					<Panel>
						<Panel.Header label={BUILD} meta={buildSummaryOf(dealt)} />
						<Panel.Body>
							<Build {...dealt} />
						</Panel.Body>
						{buildNote === undefined ? null : (
							<Panel.Footer>
								<Typography variant="hint">{buildNote}</Typography>
							</Panel.Footer>
						)}
					</Panel>
				</div>

				<div className={COLUMN}>
					<Panel>
						<Panel.Header
							label={REGISTRY}
							meta={
								<RegistrySummary
									offers={registry.offers.length}
									slotPrice={registry.slotPrice}
								/>
							}
						/>
						<Panel.Body>
							<Registry {...registry} heading={false} />
						</Panel.Body>
						{registryNote === undefined ? null : (
							<Panel.Footer>
								<Typography variant="hint">{registryNote}</Typography>
							</Panel.Footer>
						)}
					</Panel>
				</div>
			</div>

			<Panel>
				<Panel.Body>
					<ScreenFooter {...footer} rule={false} />
				</Panel.Body>
			</Panel>
		</Screen>
	);
};

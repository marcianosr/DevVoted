import { Build, buildSummaryOf, type BuildProps } from "./Build.ui";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import type { KantoColor } from "./colors";
import { PanelV2 } from "./PanelV2.ui";
import { Registry, registrySummaryOf, type RegistryProps } from "./Registry.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const BUILD_LAYOUT = "column";
const BUILD_TITLE = "Build";
const REGISTRY_TITLE = "Registry";
const HINT_GAIN: KantoColor = "pewter";

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
		offeredSlot: false,
		caption: false,
	};

	return (
		<Screen gate={header.swatch.theme} width={width} ground={ground}>
			<Header {...header} />

			<div className={COLUMNS}>
				<div className={COLUMN}>
					<PanelV2>
						<PanelV2.Header label={BUILD_TITLE} meta={buildSummaryOf(dealt)} />
						<PanelV2.Body>
							<Build {...dealt} />
						</PanelV2.Body>
						{buildNote === undefined ? null : (
							<PanelV2.Footer>
								<Typography variant="hint">{buildNote}</Typography>
							</PanelV2.Footer>
						)}
					</PanelV2>
				</div>

				<div className={COLUMN}>
					<PanelV2>
						<PanelV2.Header
							label={REGISTRY_TITLE}
							meta={
								<Figures
									text={registrySummaryOf(
										registry.offers.length,
										registry.slotPrice
									)}
									gain={HINT_GAIN}
								/>
							}
						/>
						<PanelV2.Body>
							<Registry {...registry} heading={false} />
						</PanelV2.Body>
						{registryNote === undefined ? null : (
							<PanelV2.Footer>
								<Typography variant="hint">{registryNote}</Typography>
							</PanelV2.Footer>
						)}
					</PanelV2>
				</div>
			</div>

			<PanelV2>
				<PanelV2.Body>
					<ScreenFooter {...footer} rule={false} />
				</PanelV2.Body>
			</PanelV2>
		</Screen>
	);
};

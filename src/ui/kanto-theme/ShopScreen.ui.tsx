import { Audit, type AuditProps } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import { Build, buildHeadOf, buildUpkeepOf, type BuildProps } from "./Build.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { NextGate, type NextGateProps } from "./NextGate.ui";
import { PanelV2 } from "./PanelV2.ui";
import { Registry, registrySummaryOf, type RegistryProps } from "./Registry.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { upkeepLabelOf } from "./WeightTrack.ui";
import { WeightOffer } from "./WeightOffer.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const OFFERS = "flex w-full flex-col gap-3";

const BUILD_LAYOUT = "column";
const CONTROL_LAYOUT = "row";
const BUILD_TITLE = "Build";
const REGISTRY_TITLE = "Registry";
const CONTROLS_TITLE = "Registry control";

const HINT_GAIN: KantoColor = "pewter";
const BILLED_COLOR: KantoColor = "saffron";
const FREE_COLOR: KantoColor = "viridian";
const NO_UPKEEP = 0;

const BuildMeta = ({ build }: { build: BuildProps }) => {
	const upkeep = buildUpkeepOf(build);

	return (
		<>
			{buildHeadOf(build)}
			{upkeep === undefined ? null : (
				<Badge color={upkeep > NO_UPKEEP ? BILLED_COLOR : FREE_COLOR}>
					{upkeepLabelOf(upkeep)}
				</Badge>
			)}
		</>
	);
};

export type ShopScreenProps = {
	build: BuildProps;
	registry: RegistryProps;
	header: HeaderProps;
	nextGate?: NextGateProps;
	controls?: readonly RegistryControlProps[];
	audits?: readonly AuditProps[];
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

export const ShopScreen = ({
	build,
	registry,
	header,
	nextGate,
	controls = [],
	audits = [],
	footer,
	width,
	ground = "bare",
}: ShopScreenProps) => {
	const offers = build.weight?.offers ?? [];

	return (
		<Screen gate={header.swatch.theme} width={width} ground={ground}>
			<Header {...header} />

			{audits.length === 0 ? null : (
				<div className={AUDITS}>
					{audits.map((audit, index) => (
						<Audit key={audit.code ?? index} {...audit} />
					))}
				</div>
			)}

			{nextGate === undefined ? null : <NextGate {...nextGate} />}

			<div className={COLUMNS}>
				<div className={COLUMN}>
					<PanelV2>
						<PanelV2.Header
							label={BUILD_TITLE}
							meta={<BuildMeta build={build} />}
						/>
						<PanelV2.Body>
							<Build
								{...build}
								layout={BUILD_LAYOUT}
								heading={false}
								weightOffers={false}
							/>
						</PanelV2.Body>
						{offers.length === 0 ? null : (
							<PanelV2.Footer>
								<div className={OFFERS}>
									{offers.map((offer) => (
										<WeightOffer key={offer.to} {...offer} />
									))}
								</div>
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
					</PanelV2>

					{controls.length === 0 ? null : (
						<PanelV2>
							<PanelV2.Header label={CONTROLS_TITLE} />
							<PanelV2.Rows>
								{controls.map((control) => (
									<PanelV2.Row key={control.title}>
										<RegistryControl {...control} layout={CONTROL_LAYOUT} />
									</PanelV2.Row>
								))}
							</PanelV2.Rows>
						</PanelV2>
					)}
				</div>
			</div>

			{footer === undefined ? null : (
				<PanelV2>
					<PanelV2.Body>
						<ScreenFooter {...footer} rule={false} />
					</PanelV2.Body>
				</PanelV2>
			)}
		</Screen>
	);
};

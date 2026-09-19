import { Audit, type AuditProps } from "./Audit.ui";
import { Build, buildHeadOf, type BuildProps } from "./Build.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { NextGate, type NextGateProps } from "./NextGate.ui";
import { Panel } from "./Panel.ui";
import { Registry, RegistrySummary, type RegistryProps } from "./Registry.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { BuildSpace, type BuildSpaceProps } from "./BuildSpace.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

const BUILD_LAYOUT = "column";
const CONTROL_LAYOUT = "row";
const BUILD_TITLE = "Build";
const REGISTRY_TITLE = "Registry";
const CONTROLS_TITLE = "Registry control";

export type ShopScreenProps = {
	build: BuildProps;
	buildSpace?: BuildSpaceProps;
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
	buildSpace,
	registry,
	header,
	nextGate,
	controls = [],
	audits = [],
	footer,
	width,
	ground = "bare",
}: ShopScreenProps) => {
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
					<Panel>
						<Panel.Header label={BUILD_TITLE} meta={buildHeadOf(build)} />
						<Panel.Body>
							<Build {...build} layout={BUILD_LAYOUT} heading={false} />
						</Panel.Body>
					</Panel>

					{buildSpace === undefined ? null : <BuildSpace {...buildSpace} />}
				</div>

				<div className={COLUMN}>
					<Panel>
						<Panel.Header
							label={REGISTRY_TITLE}
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
					</Panel>

					{controls.length === 0 ? null : (
						<Panel>
							<Panel.Header label={CONTROLS_TITLE} />
							<Panel.Rows>
								{controls.map((control) => (
									<Panel.Row key={control.title}>
										<RegistryControl {...control} layout={CONTROL_LAYOUT} />
									</Panel.Row>
								))}
							</Panel.Rows>
						</Panel>
					)}
				</div>
			</div>

			{footer === undefined ? null : (
				<Panel>
					<Panel.Body>
						<ScreenFooter {...footer} rule={false} />
					</Panel.Body>
				</Panel>
			)}
		</Screen>
	);
};

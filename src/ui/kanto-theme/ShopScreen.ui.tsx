import { BUILD, REGISTRY } from "~/shared/lib/copy";
import { Audit, type AuditProps } from "./Audit.ui";
import { Build, BuildRoom, buildHeadOf, type BuildProps } from "./Build.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { NextGate, type NextGateProps } from "./NextGate.ui";
import { Panel } from "./Panel.ui";
import { Registry, RegistrySummary, type RegistryProps } from "./Registry.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";

const COPY = {
	controlsTitle: "Services",
} as const;

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

const CONTROL_LAYOUT = "row";

export type ShopServiceRow = RegistryControlProps & { id: string };

export type ShopScreenProps = {
	build: BuildProps;
	registry: RegistryProps;
	header: HeaderProps;
	nextGate?: NextGateProps;
	controls?: readonly ShopServiceRow[];
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
						<Panel.Header label={BUILD} meta={buildHeadOf(build)} />
						<Panel.Body>
							<BuildRoom {...build} />
							<Build {...build} heading={false} caption={false} />
						</Panel.Body>
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
					</Panel>

					{controls.length === 0 ? null : (
						<Panel>
							<Panel.Header label={COPY.controlsTitle} />
							<Panel.Rows>
								{controls.map(({ id, ...control }) => (
									<Panel.Row key={id}>
										<RegistryControl {...control} layout={CONTROL_LAYOUT} />
									</Panel.Row>
								))}
							</Panel.Rows>
						</Panel>
					)}
				</div>
			</div>

			{footer === undefined ? null : <ScreenActions {...footer} />}
		</Screen>
	);
};

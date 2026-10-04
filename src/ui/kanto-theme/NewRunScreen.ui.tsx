import { BUILD, REGISTRY } from "~/shared/lib/copy";
import { Build, type BuildProps } from "./Build.ui";
import { discloseAllFor } from "./DiscloseAll.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import { Panel } from "./Panel.ui";
import { Registry, RegistrySummary, type RegistryProps } from "./Registry.ui";
import { Segmented, type SegmentedProps } from "./Segmented.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";
import { WarmBoot, type WarmBootProps } from "./WarmBoot.ui";

const COPY = {
	filter: "Config groups",
} as const;

const LAYOUT = "grid w-full gap-6 md:grid-cols-2 md:gap-x-8";
const TOP_LEFT = "min-w-0 md:col-start-1 md:row-start-1 md:self-center";
const TOP_RIGHT =
	"sticky bottom-[var(--tab-bar,0px)] z-20 order-last min-w-0 md:static md:order-none md:col-start-2 md:row-start-1 md:self-center";
const COLUMNS =
	"grid w-full items-start gap-8 md:col-span-2 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-y-6";
const LEFT = "flex w-full min-w-0 flex-col md:col-start-1";
const RIGHT =
	"flex w-full min-w-0 flex-col md:col-start-2 md:row-span-2 md:row-start-1";

export type RegistryFilter = Omit<SegmentedProps<string>, "label" | "look">;

export type NewRunScreenProps = {
	header: HeaderProps;
	build: BuildProps;
	registry: RegistryProps;
	footer: ScreenFooterProps;
	warmBoot?: WarmBootProps;
	filter?: RegistryFilter;
	buildNote?: LeadLine;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

export const NewRunScreen = ({
	header,
	build,
	registry,
	footer,
	warmBoot,
	filter,
	buildNote,
	width,
	ground = "bare",
}: NewRunScreenProps) => {
	const dealt: BuildProps = {
		...build,
		heading: false,
		configCount: false,
		caption: false,
	};

	return (
		<Screen gate={header.swatch.theme} width={width} ground={ground}>
			<div className={LAYOUT}>
				<div className={TOP_LEFT}>
					<Header {...header} />
				</div>

				<div className={TOP_RIGHT}>
					<ScreenActions {...footer} />
				</div>

				<div className={COLUMNS}>
					<div className={LEFT}>
						<Panel>
							<Panel.Header
								label={BUILD}
								trailing={discloseAllFor(dealt, dealt.configs.length)}
							/>
							<Panel.Body>
								<Build {...dealt} />
							</Panel.Body>
							{buildNote === undefined ? null : (
								<Panel.Footer>
									<Lead line={buildNote} />
								</Panel.Footer>
							)}
						</Panel>
					</div>

					<div className={RIGHT}>
						<Panel>
							<Panel.Header
								label={REGISTRY}
								meta={
									<RegistrySummary
										offers={registry.offers.length}
										slotPrice={registry.slotPrice}
									/>
								}
								trailing={discloseAllFor(registry, registry.offers.length)}
							/>
							<Panel.Body>
								{filter === undefined ? null : (
									<Segmented {...filter} label={COPY.filter} look="loose" />
								)}
								<Registry {...registry} heading={false} />
							</Panel.Body>
						</Panel>
					</div>

					{warmBoot === undefined ? null : (
						<div className={LEFT}>
							<WarmBoot {...warmBoot} />
						</div>
					)}
				</div>
			</div>
		</Screen>
	);
};

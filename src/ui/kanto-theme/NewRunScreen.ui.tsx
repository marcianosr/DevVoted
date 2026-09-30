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

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

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
			<Header {...header} pinned />

			<div className={COLUMNS}>
				<div className={COLUMN}>
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
					{warmBoot === undefined ? null : <WarmBoot {...warmBoot} />}
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
			</div>

			<ScreenActions {...footer} />
		</Screen>
	);
};

import { Audit, type AuditProps } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import { Build, type BuildProps } from "./Build.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Panel } from "./Panel.ui";
import { Registry, type RegistryProps } from "./Registry.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { StoragePlan, type StoragePlanProps } from "./StoragePlan.ui";
import { Typography } from "./Typography.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full flex-col gap-6";
const PLAN_SECTION = "flex w-full flex-col gap-3";
const PLAN_HEADLINE = "flex flex-wrap items-baseline gap-x-3";
const BILL = "flex items-center gap-1.5 text-sm";
const BILL_WORD = "text-theme-muted";

const PLAN_TITLE = "Storage plan";
const CAP_TITLE = "Your cap";
const BILLED_BEFORE = "billed";
const BILLED_AFTER = "at the next clear";
const PLAN_PROSE =
	"The only recurring cost in the shop. A clear that pays over the cap burns the rest.";

export type ShopPlan = {
	bill: string;
	rungs: StoragePlanProps["rungs"];
};

export type ShopScreenProps = {
	build: BuildProps;
	registry: RegistryProps;
	header: HeaderProps;
	plan: ShopPlan;
	audits?: readonly AuditProps[];
	width?: ScreenWidth;
};

export const ShopScreen = ({
	build,
	registry,
	header,
	plan,
	audits = [],
	width = "wide",
}: ShopScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<Header {...header} />

		{audits.length === 0 ? null : (
			<div className={AUDITS}>
				{audits.map((audit, index) => (
					<Audit key={audit.code ?? index} {...audit} />
				))}
			</div>
		)}

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<Build {...build} layout="column" />

				<section className={PLAN_SECTION}>
					<Typography variant="title" as="h3">
						{PLAN_TITLE}
					</Typography>
					<Panel>
						<div className={PLAN_HEADLINE}>
							<Typography variant="subtitle" as="span">
								{CAP_TITLE}
							</Typography>
							<span className={BILL}>
								<span className={BILL_WORD}>{BILLED_BEFORE}</span>
								<Badge>{plan.bill}</Badge>
								<span className={BILL_WORD}>{BILLED_AFTER}</span>
							</span>
						</div>
						<Typography variant="hint">{PLAN_PROSE}</Typography>
						<StoragePlan rungs={plan.rungs} />
					</Panel>
				</section>
			</div>

			<Registry {...registry} />
		</div>
	</Screen>
);

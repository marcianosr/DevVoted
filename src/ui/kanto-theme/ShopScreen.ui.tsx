import { Audit, type AuditProps } from "./Audit.ui";
import { Build, type BuildProps } from "./Build.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Registry, type RegistryProps } from "./Registry.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full flex-col gap-6";

export type ShopScreenProps = {
	build: BuildProps;
	registry: RegistryProps;
	header: HeaderProps;
	audits?: readonly AuditProps[];
	width?: ScreenWidth;
};

export const ShopScreen = ({
	build,
	registry,
	header,
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
			</div>

			<Registry {...registry} />
		</div>
	</Screen>
);

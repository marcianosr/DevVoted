import type { ReactNode } from "react";

import { Author, type AuthorProps } from "~/ui/kanto-theme/Author.ui";
import {
	ClimberCard,
	type ClimberCardProps,
} from "~/ui/kanto-theme/ClimberCard.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import {
	ProfileCard,
	type ProfileCardProps,
} from "~/ui/kanto-theme/ProfileCard.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	label: "how others see you",
	note: "This is you to every other player: when they open your profile, on a poll you wrote, and on the climb map.",
	tryingOn: (name: string) => `trying on ${name}`,
	surfaces: {
		profile: "on your profile",
		byline: "on a poll you wrote",
		climber: "on the climb map",
	},
} as const;

const TRYING_ON_COLOR = "fuchsia";

const SURFACES = "grid w-full gap-4 md:grid-cols-2";
const SURFACE = "flex min-w-0 flex-col gap-2";
const WIDE = "md:col-span-2";
const BYLINE =
	"rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3";

export type AppearancePreviewProps = {
	card: ProfileCardProps;
	byline: AuthorProps;
	climber: ClimberCardProps;
	tryingOn?: string;
};

type SurfaceProps = {
	label: string;
	wide?: boolean;
	children: ReactNode;
};

const Surface = ({ label, wide = false, children }: SurfaceProps) => (
	<figure aria-label={label} className={wide ? `${SURFACE} ${WIDE}` : SURFACE}>
		<figcaption>
			<Typography variant="hint" as="span">
				{label}
			</Typography>
		</figcaption>
		{children}
	</figure>
);

export const AppearancePreview = ({
	card,
	byline,
	climber,
	tryingOn,
}: AppearancePreviewProps) => (
	<Panel>
		<Panel.Header
			label={COPY.label}
			badge={
				tryingOn === undefined
					? undefined
					: { label: COPY.tryingOn(tryingOn), color: TRYING_ON_COLOR }
			}
		/>
		<Panel.Body>
			<div className={SURFACES}>
				<Surface label={COPY.surfaces.profile} wide>
					<ProfileCard {...card} />
				</Surface>
				<Surface label={COPY.surfaces.byline}>
					<div className={BYLINE}>
						<Author {...byline} />
					</div>
				</Surface>
				<Surface label={COPY.surfaces.climber}>
					<ClimberCard {...climber} />
				</Surface>
			</div>
		</Panel.Body>
		<Panel.Footer>
			<Typography variant="hint">{COPY.note}</Typography>
		</Panel.Footer>
	</Panel>
);

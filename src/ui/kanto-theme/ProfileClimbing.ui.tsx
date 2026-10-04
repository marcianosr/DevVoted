import { Panel } from "./Panel.ui";
import { Standing, type StandingProps } from "./Standing.ui";

export const COPY = {
	label: "climbing now",
} as const;

export type ProfileClimbingProps = StandingProps;

export const ProfileClimbing = (standing: ProfileClimbingProps) => (
	<Panel>
		<Panel.Header label={COPY.label} />
		<Panel.Body>
			<Standing {...standing} withBuild={false} />
		</Panel.Body>
	</Panel>
);

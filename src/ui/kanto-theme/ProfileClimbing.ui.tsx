import { Panel } from "./Panel.ui";
import { Standing, type StandingProps } from "./Standing.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	label: "climbing now",
	resting: "no run open today",
} as const;

export type ProfileClimbingProps = {
	standing?: StandingProps;
	meta: string;
};

export const ProfileClimbing = ({ standing, meta }: ProfileClimbingProps) => (
	<Panel>
		<Panel.Header label={COPY.label} meta={meta} />
		<Panel.Body>
			{standing === undefined ? (
				<Typography variant="hint" as="span">
					{COPY.resting}
				</Typography>
			) : (
				<Standing {...standing} />
			)}
		</Panel.Body>
	</Panel>
);

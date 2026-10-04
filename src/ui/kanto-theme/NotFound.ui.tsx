import type { ReactNode } from "react";

import { Button } from "./Button.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	label: "Not found",
	missing: "The page you are looking for does not exist.",
	back: "Go back",
} as const;

const PAGE = "flex flex-1 items-start justify-center p-8";
const PRESSES = "flex flex-wrap items-center gap-3";

export type NotFoundUIProps = {
	onGoBack: () => void;
	homeLink: ReactNode;
	children?: ReactNode;
};

export const NotFoundUI = ({
	onGoBack,
	homeLink,
	children,
}: NotFoundUIProps) => (
	<div className={PAGE}>
		<Panel>
			<Panel.Header label={COPY.label} />
			<Panel.Body>
				{children ?? (
					<Typography variant="paragraph">{COPY.missing}</Typography>
				)}
			</Panel.Body>
			<Panel.Footer>
				<span className={PRESSES}>
					<Button size="md" label={COPY.back} onPress={onGoBack} />
					{homeLink}
				</span>
			</Panel.Footer>
		</Panel>
	</div>
);

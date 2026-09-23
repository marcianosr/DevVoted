import type { ReactNode } from "react";

import { Button } from "./Button.ui";
import { Panel } from "./Panel.ui";

const COPY = {
	label: "Something broke",
	retry: "Try again",
} as const;

const PAGE = "flex min-w-0 flex-1 items-start justify-center p-8";
const PRESSES = "flex flex-wrap items-center gap-3";

export type CatchBoundaryUIProps = {
	errorDisplay: ReactNode;
	onRetry: () => void;
	navigationLink: ReactNode;
};

export const CatchBoundaryUI = ({
	errorDisplay,
	onRetry,
	navigationLink,
}: CatchBoundaryUIProps) => (
	<div className={PAGE} data-screen-theme="cinnabar">
		<Panel>
			<Panel.Header label={COPY.label} />
			<Panel.Body>{errorDisplay}</Panel.Body>
			<Panel.Footer>
				<span className={PRESSES}>
					<Button size="md" label={COPY.retry} onPress={onRetry} />
					{navigationLink}
				</span>
			</Panel.Footer>
		</Panel>
	</div>
);

import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	accessDenied: "Access denied",
	adminOnly: "Only an admin can edit a poll.",
	loadError: "Error loading poll",
	loading: "Loading poll…",
} as const;

const THEME: KantoColor = "pallet";
const ERROR_THEME: KantoColor = "cinnabar";

export const PollEditLoading = () => (
	<Screen theme={THEME} ground="bare">
		<Typography variant="hint">{COPY.loading}</Typography>
	</Screen>
);

export const PollEditDenied = () => (
	<Screen theme={ERROR_THEME} ground="bare">
		<Typography variant="title" as="h1">
			{COPY.accessDenied}
		</Typography>
		<Typography variant="paragraph">{COPY.adminOnly}</Typography>
	</Screen>
);

export const PollEditError = ({ message }: { message: string }) => (
	<Screen theme={ERROR_THEME} ground="bare">
		<Typography variant="title" as="h1">
			{COPY.loadError}
		</Typography>
		<Typography variant="paragraph">{message}</Typography>
	</Screen>
);

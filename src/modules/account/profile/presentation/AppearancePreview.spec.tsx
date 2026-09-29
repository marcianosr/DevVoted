import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
	AppearancePreview,
	COPY,
	type AppearancePreviewProps,
} from "~/modules/account/profile/presentation/AppearancePreview.ui";

const NAME = "marciano_schildmeijer";
const BORDER = "/borders/stack-trace.png";

const PREVIEW: AppearancePreviewProps = {
	card: { name: NAME, titles: ["Git GOAT", "Summit"], borderUrl: BORDER },
	byline: { handle: "marciano", title: "Git GOAT", borderUrl: BORDER },
	climber: { name: NAME, title: "Git GOAT", borderUrl: BORDER },
};

const surfaceNamed = (label: string) =>
	screen.getByRole("figure", { name: label });

describe("AppearancePreview", () => {
	it("states that this is what other players see", () => {
		render(<AppearancePreview {...PREVIEW} />);

		expect(screen.getByText(COPY.note)).toBeInTheDocument();
	});

	it("draws the player on every surface another player meets them", () => {
		render(<AppearancePreview {...PREVIEW} />);

		expect(
			within(surfaceNamed(COPY.surfaces.profile)).getByText(NAME)
		).toBeInTheDocument();
		expect(
			within(surfaceNamed(COPY.surfaces.byline)).getByText(/@marciano/)
		).toBeInTheDocument();
		expect(
			within(surfaceNamed(COPY.surfaces.climber)).getByText(NAME)
		).toBeInTheDocument();
	});

	it("draws every worn title on the card and the first on the byline", () => {
		render(<AppearancePreview {...PREVIEW} />);

		expect(
			within(surfaceNamed(COPY.surfaces.profile)).getByText("Summit")
		).toBeInTheDocument();
		expect(
			within(surfaceNamed(COPY.surfaces.byline)).queryByText("Summit")
		).not.toBeInTheDocument();
	});

	it("names the border being tried on", () => {
		render(<AppearancePreview {...PREVIEW} tryingOn="Stack Trace" />);

		expect(screen.getByText(COPY.tryingOn("Stack Trace"))).toBeInTheDocument();
	});

	it("names no border when only what is worn is shown", () => {
		render(<AppearancePreview {...PREVIEW} />);

		expect(screen.queryByText(/trying on/)).not.toBeInTheDocument();
	});

	it("links nowhere, so a press in the preview never leaves the page", () => {
		render(<AppearancePreview {...PREVIEW} />);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});
});

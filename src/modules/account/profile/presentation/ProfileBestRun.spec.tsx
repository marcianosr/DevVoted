import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { trackFor } from "~/test/swatchTrack.factory";

import { COPY, ProfileBestRun } from "./ProfileBestRun.ui";

const RUN = {
	label: "25 Dec",
	swatches: trackFor([0, 1, 3]),
	outcome: "Cinnabar held",
	coverage: "11%",
	band: "danger",
	href: "/runs/42",
} as const;

describe("ProfileBestRun", () => {
	it("reads the run's coverage, outcome and date", () => {
		render(<ProfileBestRun run={RUN} meta="reached gate 9" />);

		expect(screen.getByText("11%")).toBeVisible();
		expect(screen.getByText("Cinnabar held")).toBeVisible();
		expect(screen.getByText("25 Dec")).toBeVisible();
		expect(screen.getByText("reached gate 9")).toBeVisible();
	});

	it("links to the run's archive", () => {
		render(<ProfileBestRun run={RUN} meta="reached gate 9" />);

		expect(
			screen.getByRole("link", { name: COPY.openArchive })
		).toHaveAttribute("href", "/runs/42");
	});
});

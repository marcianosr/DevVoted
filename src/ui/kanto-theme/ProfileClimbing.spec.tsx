import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoStanding } from "~/test/kantoCommunity.factory";

import { COPY, ProfileClimbing } from "./ProfileClimbing.ui";
import { COPY as STANDING_COPY } from "./Standing.ui";

const STANDING = kantoStanding();

describe("ProfileClimbing", () => {
	it("names the panel and draws the open run's standing", () => {
		render(<ProfileClimbing {...STANDING} />);

		expect(screen.getByRole("heading", { name: COPY.label })).toBeVisible();
		expect(screen.getByText("gate 3")).toBeVisible();
	});

	it("leaves the build to the hover card, so the trophy page stays short", () => {
		render(<ProfileClimbing {...STANDING} />);

		expect(screen.queryByText(STANDING_COPY.build)).not.toBeInTheDocument();
	});
});

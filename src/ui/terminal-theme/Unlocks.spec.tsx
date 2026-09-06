import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Unlocks } from "./Unlocks.ui";

describe(Unlocks, () => {
	it("announces each grant with its label and provenance as visible text", () => {
		render(
			<Unlocks
				rows={[
					{
						label: "Telemetry",
						detail: "Earned: peeked the community split 5 times",
						slots: 2,
						version: 1,
						maxVersion: 5,
					},
				]}
			/>
		);

		expect(screen.getByText("unlocked")).toBeInTheDocument();
		expect(screen.getByText("Telemetry")).toBeInTheDocument();
		expect(
			screen.getByText("Earned: peeked the community split 5 times")
		).toBeInTheDocument();
	});

	it("renders nothing without a grant", () => {
		const { container } = render(<Unlocks rows={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { UpcomingCategories } from "~/modules/run/run/presentation/UpcomingCategories.ui";

describe(UpcomingCategories, () => {
	it("shows both halves of the reveal, this gate's leftovers first", () => {
		render(
			<UpcomingCategories
				thisGate={["js", "css"]}
				nextGate={["java", "ruby"]}
			/>
		);
		expect(screen.getByText("Prefetch")).toBeInTheDocument();
		expect(screen.getByText("this gate")).toBeInTheDocument();
		expect(screen.getByText("next gate")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Java")).toBeInTheDocument();
	});

	it("keeps duplicate categories duplicated — two chips are two polls", () => {
		render(<UpcomingCategories thisGate={["js", "js"]} nextGate={[]} />);
		expect(screen.getAllByText("JavaScript")).toHaveLength(2);
	});

	it("drops the this-gate group when its window is played out", () => {
		render(<UpcomingCategories thisGate={[]} nextGate={["css"]} />);
		expect(screen.queryByText("this gate")).not.toBeInTheDocument();
		expect(screen.getByText("next gate")).toBeInTheDocument();
	});

	it("renders nothing while both halves are empty", () => {
		const { container } = render(
			<UpcomingCategories thisGate={[]} nextGate={[]} />
		);
		expect(container).toBeEmptyDOMElement();
	});
});

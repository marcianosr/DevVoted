import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CoverageByCategory } from "~/modules/run/build/presentation/CoverageByCategory.ui";

describe(CoverageByCategory, () => {
	it("lists each earned category with its percentage", () => {
		render(<CoverageByCategory coverageByCategory={{ css: 5.5, js: 12 }} />);
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("5.5%")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("12%")).toBeInTheDocument();
	});

	it("hides categories with no coverage earned", () => {
		render(<CoverageByCategory coverageByCategory={{ css: 5, git: 0 }} />);
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.queryByText("Git")).not.toBeInTheDocument();
	});

	it("renders nothing when no coverage exists yet", () => {
		const { container } = render(
			<CoverageByCategory coverageByCategory={{}} />
		);
		expect(container).toBeEmptyDOMElement();
	});
});

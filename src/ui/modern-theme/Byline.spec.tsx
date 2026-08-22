import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Byline } from "./Byline.ui";

describe("Byline", () => {
	it("credits the author by handle and says what they are", () => {
		render(<Byline author="matthijsgroen" role="Frontend developer" />);

		expect(screen.getByText("Created by")).toBeInTheDocument();
		expect(screen.getByText("@matthijsgroen")).toBeInTheDocument();
		expect(screen.getByText("· Frontend developer")).toBeInTheDocument();
	});

	it("keeps the initial out of the reading order, since the handle follows it", () => {
		const { container } = render(<Byline author="matthijsgroen" />);

		expect(container.querySelector("[aria-hidden]")).toHaveTextContent("M");
	});

	it("credits an author whose role is not worth stating", () => {
		render(<Byline author="tijmen" />);

		expect(screen.getByText("@tijmen")).toBeInTheDocument();
		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});
});

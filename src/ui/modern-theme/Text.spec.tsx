import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Text } from "./Text.ui";

describe("Text", () => {
	it("renders a span by default", () => {
		render(<Text>Pipeline</Text>);

		expect(screen.getByText("Pipeline").tagName).toBe("SPAN");
	});

	it("renders the tag it is given", () => {
		render(
			<Text as="h1" size="ask">
				Gate 4
			</Text>
		);

		expect(screen.getByRole("heading", { name: "Gate 4" })).toBeInTheDocument();
	});

	it("scales the question larger than the meta line", () => {
		render(
			<>
				<Text size="ask">question</Text>
				<Text size="meta">meta</Text>
			</>
		);

		expect(screen.getByText("question")).toHaveClass("text-xl");
		expect(screen.getByText("meta")).toHaveClass("text-xs");
	});

	it("paints the tone it is given", () => {
		render(<Text tone="cinnabar">−128</Text>);

		expect(screen.getByText("−128")).toHaveClass("text-cinnabar");
	});

	it("keeps a caller's className alongside its own", () => {
		render(<Text className="truncate">Freemium</Text>);

		expect(screen.getByText("Freemium")).toHaveClass("truncate", "text-sm");
	});
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Climber, ClimberStack, initialsOf } from "./Climber.ui";

const BORDER = "/borders/border-js-saffron.svg";

describe("initialsOf", () => {
	it("takes the first letter of each of the first two words", () => {
		expect(initialsOf("Lt. Surge")).toBe("LS");
	});

	it("takes the first two letters of a single word", () => {
		expect(initialsOf("Brock")).toBe("BR");
	});

	it("drops a leading handle marker", () => {
		expect(initialsOf("@misty")).toBe("MI");
	});

	it("falls back to a mark when the name is blank", () => {
		expect(initialsOf("   ")).toBe("?");
	});
});

describe("Climber", () => {
	it("draws the climber as their initials", () => {
		render(<Climber name="Misty" />);

		expect(screen.getByTitle("Misty")).toHaveTextContent("MI");
	});

	it("stands the face on a thick bottom edge, so the chip reads as a keycap", () => {
		const { container } = render(<Climber name="Misty" />);

		expect(container.querySelector("span > span")).toHaveClass("border-b-4");
	});

	it("lays the equipped border flush over the face rather than scaled past it", () => {
		const { container } = render(<Climber name="Misty" borderUrl={BORDER} />);
		const frame = container.querySelector("img");

		expect(frame).toHaveAttribute("src", BORDER);
		expect(frame).toHaveClass("inset-0");
		expect(frame).not.toHaveClass("scale-120");
	});

	it("wears no frame when the climber has equipped no border", () => {
		const { container } = render(<Climber name="Misty" />);

		expect(container.querySelector("img")).toBeNull();
	});

	it("rings the viewer and names them 'you', so they stay findable in a stack", () => {
		const { container } = render(<Climber name="Marciano" you />);

		expect(screen.getByTitle("you")).toBeInTheDocument();
		expect(container.querySelector("span > span")).toHaveClass("ring-viridian");
	});

	it("rings a rival in the colour the board marks a rival", () => {
		const { container } = render(<Climber name="Misty" rival />);

		expect(container.querySelector("span > span")).toHaveClass(
			"ring-vermillion"
		);
	});

	it("keeps the viewer's own ring when they are also a rival", () => {
		const { container } = render(<Climber name="Marciano" you rival />);
		const face = container.querySelector("span > span");

		expect(face).toHaveClass("ring-viridian");
		expect(face).not.toHaveClass("ring-vermillion");
	});

	it("rims a chip whose last gate closed perfect", () => {
		const { container } = render(<Climber name="Misty" perfect />);

		expect(container.querySelector("span > span")).toHaveClass("ring-theme");
	});

	it("flickers a chip whose last gate closed shaky", () => {
		const { container } = render(<Climber name="Misty" shaky />);

		expect(container.firstChild).toHaveClass("climber-flicker");
	});

	it("tags a run a git tag rescued", () => {
		render(<Climber name="Misty" rescued />);

		expect(screen.getByTitle("Misty")).toHaveTextContent("tag");
	});

	it("leaves an unmarked chip bare", () => {
		const { container } = render(<Climber name="Misty" />);
		const chip = container.firstChild;

		expect(chip).not.toHaveClass("climber-flicker");
		expect(chip).toHaveTextContent("MI");
		expect(container.querySelector("span > span")).not.toHaveClass(
			"ring-theme"
		);
	});

	it("prefers a photo over initials", () => {
		const { container } = render(
			<Climber name="Misty" photoUrl="/misty.png" />
		);

		expect(container.querySelector("img")).toHaveAttribute("src", "/misty.png");
		expect(screen.getByTitle("Misty")).not.toHaveTextContent("MI");
	});
});

describe("ClimberStack", () => {
	it("draws every climber it was handed", () => {
		render(<ClimberStack climbers={[{ name: "Brock" }, { name: "Misty" }]} />);

		expect(screen.getByTitle("Brock")).toBeInTheDocument();
		expect(screen.getByTitle("Misty")).toBeInTheDocument();
	});

	it("counts the rest rather than drawing a thousand chips", () => {
		render(<ClimberStack climbers={[{ name: "Brock" }]} overflow={1035} />);

		expect(screen.getByText("+1,035")).toBeInTheDocument();
	});

	it("says nothing about overflow when everyone fits", () => {
		render(<ClimberStack climbers={[{ name: "Brock" }]} />);

		expect(screen.queryByText(/^\+/)).toBeNull();
	});
});
